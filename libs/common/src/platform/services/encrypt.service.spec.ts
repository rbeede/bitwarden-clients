import { mockReset, mock } from "jest-mock-extended";

import { makeStaticByteArray } from "../../../spec";
import { CsprngArray } from "../../types/csprng";
import { CryptoFunctionService } from "../abstractions/crypto-function.service";
import { LogService } from "../abstractions/log.service";
import { EncryptionType } from "../enums";
import { Utils } from "../misc/utils";
import { EncArrayBuffer } from "../models/domain/enc-array-buffer";
import { EncString } from "../models/domain/enc-string";
import { SymmetricCryptoKey } from "../models/domain/symmetric-crypto-key";
import { EncryptServiceImplementation } from "../services/cryptography/encrypt.service.implementation";

describe("EncryptService", () => {
  const cryptoFunctionService = mock<CryptoFunctionService>();
  const logService = mock<LogService>();

  let encryptService: EncryptServiceImplementation;

  beforeEach(() => {
    mockReset(cryptoFunctionService);
    mockReset(logService);

    encryptService = new EncryptServiceImplementation(cryptoFunctionService, logService, true);
  });

  describe("stringIsEncString", () => {
    const encryptedAccessToken =
      "2.rFNYSTJoljn8h6GOSNVYdQ==|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";
    const standardAccessToken =
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IkY5NjBFQzY4RThEMTBDMUEzNEE0OUYwODkwQkExQkExMDk4QUIzMjFSUzI1NiIsIng1dCI6Ii1XRHNhT2pSREJvMHBKOElrTG9ib1FtS3N5RSIsInR5cCI6ImF0K2p3dCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0IiwibmJmIjoxNzE0NjAwNzI3LCJpYXQiOjE3MTQ2MDA3MjcsImV4cCI6MTcxNDYwNDMyNywic2NvcGUiOlsiYXBpIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbIkFwcGxpY2F0aW9uIl0sImNsaWVudF9pZCI6ImRlc2t0b3AiLCJzdWIiOiJlY2U3MGExMy03MjE2LTQzYzQtOTk3Ny1iMTAzMDE0NmUxZTciLCJhdXRoX3RpbWUiOjE3MTQ2MDA3MjcsImlkcCI6ImJpdHdhcmRlbiIsInByZW1pdW0iOmZhbHNlLCJlbWFpbCI6ImpzbmlkZXJcdTAwMkJsb2NhbEBiaXR3YXJkZW4uY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJzc3RhbXAiOiJHWTdKQU82NENLS1RLQkI2WkVBVVlMMldPUVU3QVNUMiIsIm5hbWUiOiJKYXJlZCBTbmlkZXIgMSIsIm9yZ293bmVyIjpbIjkyYjQ5OTA4LWI1MTQtNDVhOC1iYWRiLWIxMDMwMTQ4ZmU1MyIsIjM4ZWRlMzIyLWI0YjQtNGJkOC05ZTA5LWIxMDcwMTEyZGMxMSIsImIyZDA3MDI4LWE1ODMtNGMzZS04ZDYwLWIxMDcwMTE5OGMyOSIsImJmOTM0YmEyLTBmZDQtNDlmMi1hOTVlLWIxMDcwMTFmYzllNiIsImMwYjdmNzVkLTAxNWYtNDJjOS1iM2E2LWIxMDgwMTc2MDdjYSJdLCJkZXZpY2UiOiIwYmQzZWFmZC0yYjE3LTRiNGItYmUzNS1kMjIxNTE5MTA1ZmUiLCJqdGkiOiI0MEVGNjlEQ0QyNkI4MERDMkJFQ0UwODZDOTIxNDg5OSJ9.pRaZphZ8pygx3gHMdsKnCHWSBFAvm6gJ5aCLKbXIfx6Zc-LtQ_CkjO17rQaXlE4MwDt_n_wMzA38SDG2WzwjJrF3rWziPJrOMEdMGXLvVHyqxh0gcIiAQXZMYq0PdCYPBSDmsRZUZqg5BXFb9ylZjC0-m-EqDgl-i6OfxaHTPBCosX4_fr4bcyZtAaoaSeY4ZWf_1T8HrEzTlEyYKepHFzWdG3e4pJKHfs4sNGfs0uiW1awMqtRIPYI1n1F--oF5Hkm6jUJOdtrCKU0mKntyF4v7YRxgXdxUDqKw08nkk11vdPFVG87kWhR6ARYBWDp4AASy66YewqGhX7BNaekSTqK7DKxzQ9Adiv4XvmNEz3JO8tQrEFfE_mz9-WZiS6PlUipCxW-UtFp093_gHZh9_xgbuTdaO1u5_8Y42v0V_69v9WgzCGQGEWZ3PPaJsARGDO7FVKdPxP2S2lWIu22gydNHhfDZrOpBGHD1FpByfd5DbhKk0JdhHEPObs8RwNEweK-jlKmQpc_8bnhXFRUeMFrDL2Q2pNrYcDOpF1crIePPcWBk2_YdcWTqYVnGewT0toJ8sGlaAuAe6uOUZkBG3sxkOttkLYQtkxJYqt54gjazJ0N0GxAc0UBUDt0JnuLqk-cuxXiQO2_vHomTf7dilPq8fvqffrtrISxDVZenceg";

    it("should return false if a null string is passed in", () => {
      // Act
      const result = encryptService.stringIsEncString(null);
      // Assert
      expect(result).toBe(false);
    });

    it("should return false if a non-encrypted string is passed in", () => {
      // Act
      const result = encryptService.stringIsEncString(standardAccessToken);
      // Assert
      expect(result).toBe(false);
    });

    it("should return true if an encrypted string is passed in", () => {
      // Act
      const result = encryptService.stringIsEncString(encryptedAccessToken);
      // Assert
      expect(result).toBe(true);
    });
  });

  describe("encryptToBytes", () => {
    const plainValue = makeStaticByteArray(16, 1);
    const iv = makeStaticByteArray(16, 30);
    const mac = makeStaticByteArray(32, 40);
    const encryptedData = makeStaticByteArray(20, 50);

    it("throws if no key is provided", () => {
      return expect(encryptService.encryptToBytes(plainValue, null)).rejects.toThrow(
        "No encryption key",
      );
    });

    describe("encrypts data", () => {
      beforeEach(() => {
        cryptoFunctionService.randomBytes.calledWith(16).mockResolvedValueOnce(iv as CsprngArray);
        cryptoFunctionService.aesEncrypt.mockResolvedValue(encryptedData);
      });

      it("using a key which supports mac", async () => {
        const key = mock<SymmetricCryptoKey>();
        const encType = EncryptionType.AesCbc128_HmacSha256_B64;
        key.encType = encType;

        key.macKey = makeStaticByteArray(16, 20);

        cryptoFunctionService.hmac.mockResolvedValue(mac);

        const actual = await encryptService.encryptToBytes(plainValue, key);

        expect(actual.encryptionType).toEqual(encType);
        expect(actual.ivBytes).toEqualBuffer(iv);
        expect(actual.macBytes).toEqualBuffer(mac);
        expect(actual.dataBytes).toEqualBuffer(encryptedData);
        expect(actual.buffer.byteLength).toEqual(
          1 + iv.byteLength + mac.byteLength + encryptedData.byteLength,
        );
      });

      it("using a key which doesn't support mac", async () => {
        const key = mock<SymmetricCryptoKey>();
        const encType = EncryptionType.AesCbc256_B64;
        key.encType = encType;

        key.macKey = null;

        const actual = await encryptService.encryptToBytes(plainValue, key);

        expect(cryptoFunctionService.hmac).not.toBeCalled();

        expect(actual.encryptionType).toEqual(encType);
        expect(actual.ivBytes).toEqualBuffer(iv);
        expect(actual.macBytes).toBeNull();
        expect(actual.dataBytes).toEqualBuffer(encryptedData);
        expect(actual.buffer.byteLength).toEqual(1 + iv.byteLength + encryptedData.byteLength);
      });
    });
  });

  describe("decryptToBytes", () => {
    const encType = EncryptionType.AesCbc256_HmacSha256_B64;
    const key = new SymmetricCryptoKey(makeStaticByteArray(64, 100), encType);
    const computedMac = new Uint8Array(1);
    const encBuffer = new EncArrayBuffer(makeStaticByteArray(60, encType));

    beforeEach(() => {
      cryptoFunctionService.hmac.mockResolvedValue(computedMac);
    });

    it("throws if no key is provided", () => {
      return expect(encryptService.decryptToBytes(encBuffer, null)).rejects.toThrow(
        "No encryption key",
      );
    });

    it("throws if no encrypted value is provided", () => {
      return expect(encryptService.decryptToBytes(null, key)).rejects.toThrow(
        "Nothing provided for decryption",
      );
    });

    it("decrypts data with provided key", async () => {
      const decryptedBytes = makeStaticByteArray(10, 200);

      cryptoFunctionService.hmac.mockResolvedValue(makeStaticByteArray(1));
      cryptoFunctionService.compare.mockResolvedValue(true);
      cryptoFunctionService.aesDecrypt.mockResolvedValueOnce(decryptedBytes);

      const actual = await encryptService.decryptToBytes(encBuffer, key);

      expect(cryptoFunctionService.aesDecrypt).toBeCalledWith(
        expect.toEqualBuffer(encBuffer.dataBytes),
        expect.toEqualBuffer(encBuffer.ivBytes),
        expect.toEqualBuffer(key.encKey),
        "cbc",
      );

      expect(actual).toEqualBuffer(decryptedBytes);
    });

    it("compares macs using CryptoFunctionService", async () => {
      const expectedMacData = new Uint8Array(
        encBuffer.ivBytes.byteLength + encBuffer.dataBytes.byteLength,
      );
      expectedMacData.set(new Uint8Array(encBuffer.ivBytes));
      expectedMacData.set(new Uint8Array(encBuffer.dataBytes), encBuffer.ivBytes.byteLength);

      await encryptService.decryptToBytes(encBuffer, key);

      expect(cryptoFunctionService.hmac).toBeCalledWith(
        expect.toEqualBuffer(expectedMacData),
        key.macKey,
        "sha256",
      );

      expect(cryptoFunctionService.compare).toBeCalledWith(
        expect.toEqualBuffer(encBuffer.macBytes),
        expect.toEqualBuffer(computedMac),
      );
    });

    it("returns null if macs don't match", async () => {
      cryptoFunctionService.compare.mockResolvedValue(false);

      const actual = await encryptService.decryptToBytes(encBuffer, key);
      expect(cryptoFunctionService.compare).toHaveBeenCalled();
      expect(cryptoFunctionService.aesDecrypt).not.toHaveBeenCalled();
      expect(actual).toBeNull();
    });

    it("returns null if encTypes don't match", async () => {
      key.encType = EncryptionType.AesCbc256_B64;
      cryptoFunctionService.compare.mockResolvedValue(true);

      const actual = await encryptService.decryptToBytes(encBuffer, key);

      expect(actual).toBeNull();
      expect(cryptoFunctionService.aesDecrypt).not.toHaveBeenCalled();
    });
  });

  describe("rsa", () => {
    const data = makeStaticByteArray(10, 100);
    const encryptedData = makeStaticByteArray(10, 150);
    const publicKey = makeStaticByteArray(10, 200);
    const privateKey = makeStaticByteArray(10, 250);
    const encString = makeEncString(encryptedData);

    function makeEncString(data: Uint8Array): EncString {
      return new EncString(EncryptionType.Rsa2048_OaepSha1_B64, Utils.fromBufferToB64(data));
    }

    describe("rsaEncrypt", () => {
      it("throws if no data is provided", () => {
        return expect(encryptService.rsaEncrypt(null, publicKey)).rejects.toThrow("No data");
      });

      it("throws if no public key is provided", () => {
        return expect(encryptService.rsaEncrypt(data, null)).rejects.toThrow("No public key");
      });

      it("encrypts data with provided key", async () => {
        cryptoFunctionService.rsaEncrypt.mockResolvedValue(encryptedData);

        const actual = await encryptService.rsaEncrypt(data, publicKey);

        expect(cryptoFunctionService.rsaEncrypt).toBeCalledWith(
          expect.toEqualBuffer(data),
          expect.toEqualBuffer(publicKey),
          "sha1",
        );

        expect(actual).toEqual(encString);
        expect(actual.dataBytes).toEqualBuffer(encryptedData);
      });
    });

    describe("rsaDecrypt", () => {
      it("throws if no data is provided", () => {
        return expect(encryptService.rsaDecrypt(null, privateKey)).rejects.toThrow("No data");
      });

      it("throws if no private key is provided", () => {
        return expect(encryptService.rsaDecrypt(encString, null)).rejects.toThrow("No private key");
      });

      it.each([
        EncryptionType.AesCbc256_B64,
        EncryptionType.AesCbc128_HmacSha256_B64,
        EncryptionType.AesCbc256_HmacSha256_B64,
      ])("throws if encryption type is %s", async (encType) => {
        encString.encryptionType = encType;

        await expect(encryptService.rsaDecrypt(encString, privateKey)).rejects.toThrow(
          "Invalid encryption type",
        );
      });

      it("decrypts data with provided key", async () => {
        cryptoFunctionService.rsaDecrypt.mockResolvedValue(data);

        const actual = await encryptService.rsaDecrypt(makeEncString(data), privateKey);

        expect(cryptoFunctionService.rsaDecrypt).toBeCalledWith(
          expect.toEqualBuffer(data),
          expect.toEqualBuffer(privateKey),
          "sha1",
        );

        expect(actual).toEqualBuffer(data);
      });
    });
  });

  describe("resolveLegacyKey", () => {
    it("creates a legacy key if required", async () => {
      const key = new SymmetricCryptoKey(makeStaticByteArray(32), EncryptionType.AesCbc256_B64);
      const encString = mock<EncString>();
      encString.encryptionType = EncryptionType.AesCbc128_HmacSha256_B64;

      const actual = encryptService.resolveLegacyKey(key, encString);

      const expected = new SymmetricCryptoKey(key.key, EncryptionType.AesCbc128_HmacSha256_B64);
      expect(actual).toEqual(expected);
    });

    it("does not create a legacy key if not required", async () => {
      const encType = EncryptionType.AesCbc256_HmacSha256_B64;
      const key = new SymmetricCryptoKey(makeStaticByteArray(64), encType);
      const encString = mock<EncString>();
      encString.encryptionType = encType;

      const actual = encryptService.resolveLegacyKey(key, encString);

      expect(actual).toEqual(key);
    });
  });
});
