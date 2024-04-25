import { Injectable } from "@angular/core";

import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { SymmetricCryptoKey } from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";

import { PendingAuthRequestView } from "../../views/auth-requests/pending-auth-request.view";

import { OrganizationAuthRequestApiService } from "./organization-auth-request-api.service";

@Injectable()
export class OrganizationAuthRequestService {
  constructor(
    private organizationAuthRequestApiService: OrganizationAuthRequestApiService,
    private cryptoService: CryptoService,
  ) {}

  async listPendingRequests(organizationId: string): Promise<PendingAuthRequestView[]> {
    return await this.organizationAuthRequestApiService.listPendingRequests(organizationId);
  }

  async denyPendingRequests(organizationId: string, ...requestIds: string[]): Promise<void> {
    await this.organizationAuthRequestApiService.denyPendingRequests(organizationId, ...requestIds);
  }

  async approvePendingRequest(
    organizationId: string,
    encryptedUserKey: string,
    encryptedOrgPrivateKey: string,
    devicePublicKey: string,
    requestId: string,
  ) {
    const encryptedKey = await this.getEncryptedUserKey(
      organizationId,
      encryptedUserKey,
      encryptedOrgPrivateKey,
      devicePublicKey,
    );

    await this.organizationAuthRequestApiService.approvePendingRequest(
      organizationId,
      requestId,
      encryptedKey,
    );
  }

  /**
   * Creates a copy of the user key that has been encrypted with the provided device's public key.
   * @param devicePublicKey
   * @param resetPasswordDetails
   * @private
   */
  private async getEncryptedUserKey(
    organizationId: string,
    encryptedUserKey: string,
    encryptedOrgPrivateKey: string,
    devicePublicKey: string,
  ): Promise<EncString> {
    const devicePubKey = Utils.fromB64ToArray(devicePublicKey);

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
