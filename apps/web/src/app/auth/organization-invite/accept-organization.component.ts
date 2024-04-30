import { Component } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";

import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { BaseAcceptComponent } from "../../common/base.accept.component";

import { AcceptOrganizationInviteService } from "./services/accept-organization.service";

@Component({
  templateUrl: "accept-organization.component.html",
})
export class AcceptOrganizationComponent extends BaseAcceptComponent {
  orgName$ = this.acceptOrganizationInviteService.orgName$;
  protected requiredParameters: string[] = ["organizationId", "organizationUserId", "token"];

  constructor(
    router: Router,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    route: ActivatedRoute,
    authService: AuthService,
    private acceptOrganizationInviteService: AcceptOrganizationInviteService,
  ) {
    super(router, platformUtilsService, i18nService, route, authService);
  }

  async authedHandler(qParams: Params): Promise<void> {
    this.actionPromise = await this.acceptOrganizationInviteService.initializeInvite(qParams);
    await this.actionPromise;

    this.platformUtilService.showToast(
      "success",
      this.i18nService.t("inviteAccepted"),
      this.acceptOrganizationInviteService.inviteType === "accept-init"
        ? this.i18nService.t("inviteInitAcceptedDesc")
        : this.i18nService.t("inviteAcceptedDesc"),
      { timeout: 10000 },
    );

    await this.router.navigate(["/vault"]);
  }

  async unauthedHandler(qParams: Params): Promise<void> {
    await this.acceptOrganizationInviteService.setOrganizationInvitation(qParams);
    await this.accelerateInviteAcceptIfPossible(qParams);
  }

  /**
   * In certain scenarios, we want to accelerate the user through the accept org invite process
   * For example, if the user has a BW account already, we want them to be taken to login instead of creation.
   */
  private async accelerateInviteAcceptIfPossible(qParams: Params): Promise<void> {
    // Extract the query params we need to make routing acceleration decisions
    const orgSsoIdentifier = qParams.orgSsoIdentifier;
    const orgUserHasExistingUser = this.stringToNullOrBool(qParams.orgUserHasExistingUser);

    // if orgUserHasExistingUser is null, short circuit for backwards compatibility w/ older servers
    if (orgUserHasExistingUser == null) {
      return;
    }

    // if user exists, send user to login
    if (orgUserHasExistingUser) {
      await this.router.navigate(["/login"], {
        queryParams: { email: qParams.email },
      });
      return;
    }

    if (orgSsoIdentifier) {
      // We only send sso org identifier if the org has SSO enabled and the SSO policy required.
      // Will JIT provision the user.
      await this.router.navigate(["/sso"], {
        queryParams: { email: qParams.email, identifier: orgSsoIdentifier },
      });
      return;
    }

    // if SSO is disabled OR if sso is enabled but the SSO login required policy is not enabled
    // then send user to create account
    await this.router.navigate(["/register"], {
      queryParams: { email: qParams.email, fromOrgInvite: true },
    });
    return;
  }

  private stringToNullOrBool(s: string | undefined): boolean | null {
    if (s === undefined) {
      return null;
    }
    return s.toLowerCase() === "true";
  }
}
