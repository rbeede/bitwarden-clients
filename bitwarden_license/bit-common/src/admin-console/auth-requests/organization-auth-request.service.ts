import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { AdminAuthRequestUpdateWithIdRequest } from "./admin-auth-request-update.request";
import { OrganizationAuthRequestApiService } from "./organization-auth-request-api.service";
import { PendingAuthRequestView } from "./pending-auth-request.view";

export class OrganizationAuthRequestService {
  constructor(
    private organizationAuthRequestApiService: OrganizationAuthRequestApiService,
    private cryptoService: CryptoService,
    private organizationUserService: OrganizationUserService,
  ) {}

  async listPendingRequests(organizationId: string): Promise<PendingAuthRequestView[]> {
    return await this.organizationAuthRequestApiService.listPendingRequests(organizationId);
  }

  async denyPendingRequests(organizationId: string, ...requestIds: string[]): Promise<void> {
    await this.organizationAuthRequestApiService.denyPendingRequests(organizationId, ...requestIds);
  }

  async approvePendingRequests(
    organizationId: string,
    authRequests: PendingAuthRequestView[],
  ): Promise<void> {
    const items = await Promise.all(
      authRequests.map(async (r) => {
        const encryptedKey = await this.getEncryptedUserKey(organizationId, r);

        return new AdminAuthRequestUpdateWithIdRequest(r.id, true, encryptedKey.encryptedString);
      }),
    );

    await this.organizationAuthRequestApiService.approvePendingRequests(organizationId, items);
  }

  async approvePendingRequest(organizationId: string, authRequest: PendingAuthRequestView) {
    const encryptedKey = await this.getEncryptedUserKey(organizationId, authRequest);

    await this.organizationAuthRequestApiService.approvePendingRequest(
      organizationId,
      authRequest.id,
      encryptedKey,
    );
  }

  /**
   * Creates a copy of the user key that has been encrypted with the provided device's public key.
   * @param organizationId
   * @param authRequest
   * @private
   */
  private async getEncryptedUserKey(
    organizationId: string,
    authRequest: PendingAuthRequestView,
  ): Promise<EncString> {
    const resetPasswordDetails =
      await this.organizationUserService.getOrganizationUserResetPasswordDetails(
        organizationId,
        authRequest.organizationUserId,
      );

    if (resetPasswordDetails == null || resetPasswordDetails.resetPasswordKey == null) {
      throw new Error(
        "The user must be enrolled in account recovery (password reset) in order for the request to be approved.",
      );
    }

    const encryptedUserKey = resetPasswordDetails.resetPasswordKey;
    const encryptedOrgPrivateKey = resetPasswordDetails.encryptedPrivateKey;
    const devicePubKey = Utils.fromB64ToArray(authRequest.publicKey);

    // Decrypt Organization's encrypted Private Key with org key
    const orgSymKey = await this.cryptoService.getOrgKey(organizationId);
    const decOrgPrivateKey = await this.cryptoService.decryptToBytes(
      new EncString(encryptedOrgPrivateKey),
      orgSymKey,
    );

    // Decrypt user key with decrypted org private key
    const decValue = await this.cryptoService.rsaDecrypt(encryptedUserKey, decOrgPrivateKey);
    const userKey = new SymmetricCryptoKey(decValue);

    // Re-encrypt user Key with the Device Public Key
    return await this.cryptoService.rsaEncrypt(userKey.key, devicePubKey);
  }
}
