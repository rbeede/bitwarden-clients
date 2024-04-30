import { Injectable } from "@angular/core";
import { Params } from "@angular/router";
import { BehaviorSubject, firstValueFrom, map } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import {
  OrganizationUserAcceptRequest,
  OrganizationUserAcceptInitRequest,
} from "@bitwarden/common/admin-console/abstractions/organization-user/requests";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { OrganizationKeysRequest } from "@bitwarden/common/admin-console/models/request/organization-keys.request";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import {
  GlobalState,
  GlobalStateProvider,
  KeyDefinition,
  ORGANIZATION_INVITE_DISK,
} from "@bitwarden/common/platform/state";
import { OrgKey } from "@bitwarden/common/types/key";

export type AcceptOrganizationInviteType = "accept" | "accept-init";

const ORGANIZATION_INVITE = new KeyDefinition<any>(ORGANIZATION_INVITE_DISK, "organizationInvite", {
  deserializer: (invite) => invite,
});

@Injectable()
export class AcceptOrganizationInviteService {
  private organizationInvitationState: GlobalState<any>;
  private orgNameSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  // Fix URL encoding of space issue with Angular
  orgName$ = this.orgNameSubject.pipe(map((orgName) => orgName.replace(/\+/g, " ")));
  inviteType: AcceptOrganizationInviteType = "accept";

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly cryptoService: CryptoService,
    private readonly policyApiService: PolicyApiServiceAbstraction,
    private readonly policyService: PolicyService,
    private readonly logService: LogService,
    private readonly organizationApiService: OrganizationApiServiceAbstraction,
    private readonly organizationUserService: OrganizationUserService,
    private readonly i18nService: I18nService,
    private readonly globalStateProvider: GlobalStateProvider,
  ) {
    this.organizationInvitationState = this.globalStateProvider.get(ORGANIZATION_INVITE);
  }

  async getOrganizationInvite(): Promise<any> {
    return await firstValueFrom(this.organizationInvitationState.state$);
  }
  // TODO: add type
  async setOrganizationInvitation(invite: any): Promise<void> {
    if (invite == null) {
      throw new Error("Invite cannot be null. Use clearOrganizationInvitation instead.");
    }
    return await this.organizationInvitationState.update(() => invite);
  }

  async clearOrganizationInvitation(): Promise<void> {
    return await this.organizationInvitationState.update(() => null);
  }

  async initializeInvite(qParams: Params): Promise<Promise<any>> {
    // Creation of a new org
    const initOrganization =
      qParams.initOrganization != null && qParams.initOrganization.toLocaleLowerCase() === "true";
    if (initOrganization) {
      this.inviteType = "accept-init";
      return this.acceptInitOrganizationFlow(qParams);
    }

    // Accepting an org invite from existing org
    const needsReAuth = (await this.getOrganizationInvite()) == null;
    if (needsReAuth) {
      // We must check the MP policy before accepting the invite
      this.authService.logOut(() => {
        /* Do nothing */
      });
      await this.setOrganizationInvitation(qParams);
      return;
    }

    // We know the user has already logged in and passed the MP policy check
    return this.acceptFlow(qParams);
  }

  private async acceptInitOrganizationFlow(qParams: Params): Promise<any> {
    await this.prepareAcceptInitRequest(qParams).then((request) =>
      this.organizationUserService.postOrganizationUserAcceptInit(
        qParams.organizationId,
        qParams.organizationUserId,
        request,
      ),
    );
    await this.apiService.refreshIdentityToken();
    await this.clearOrganizationInvitation();
  }

  private async prepareAcceptInitRequest(
    qParams: Params,
  ): Promise<OrganizationUserAcceptInitRequest> {
    const request = new OrganizationUserAcceptInitRequest();
    request.token = qParams.token;

    const [encryptedOrgKey, orgKey] = await this.cryptoService.makeOrgKey<OrgKey>();
    const [orgPublicKey, encryptedOrgPrivateKey] = await this.cryptoService.makeKeyPair(orgKey);
    const collection = await this.cryptoService.encrypt(
      this.i18nService.t("defaultCollection"),
      orgKey,
    );

    request.key = encryptedOrgKey.encryptedString;
    request.keys = new OrganizationKeysRequest(
      orgPublicKey,
      encryptedOrgPrivateKey.encryptedString,
    );
    request.collectionName = collection.encryptedString;

    return request;
  }

  private async acceptFlow(qParams: Params): Promise<any> {
    await this.prepareAcceptRequest(qParams).then((request) =>
      this.organizationUserService.postOrganizationUserAccept(
        qParams.organizationId,
        qParams.organizationUserId,
        request,
      ),
    );

    await this.apiService.refreshIdentityToken();
    await this.clearOrganizationInvitation();
  }

  private async prepareAcceptRequest(qParams: Params): Promise<OrganizationUserAcceptRequest> {
    const request = new OrganizationUserAcceptRequest();
    request.token = qParams.token;

    if (await this.performResetPasswordAutoEnroll(qParams)) {
      const response = await this.organizationApiService.getKeys(qParams.organizationId);

      if (response == null) {
        throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
      }

      const publicKey = Utils.fromB64ToArray(response.publicKey);

      // RSA Encrypt user's encKey.key with organization public key
      const userKey = await this.cryptoService.getUserKey();
      const encryptedKey = await this.cryptoService.rsaEncrypt(userKey.key, publicKey);

      // Add reset password key to accept request
      request.resetPasswordKey = encryptedKey.encryptedString;
    }
    return request;
  }

  private async performResetPasswordAutoEnroll(qParams: Params): Promise<boolean> {
    let policyList: Policy[] = null;
    try {
      const policies = await this.policyApiService.getPoliciesByToken(
        qParams.organizationId,
        qParams.token,
        qParams.email,
        qParams.organizationUserId,
      );
      policyList = Policy.fromListResponse(policies);
    } catch (e) {
      this.logService.error(e);
    }

    if (policyList != null) {
      const result = this.policyService.getResetPasswordPolicyOptions(
        policyList,
        qParams.organizationId,
      );
      // Return true if policy enabled and auto-enroll enabled
      return result[1] && result[0].autoEnrollEnabled;
    }

    return false;
  }
}
