import { MockProxy, mock } from "jest-mock-extended";

import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";

import { PendingAuthRequestView } from "../../views/auth-requests/pending-auth-request.view";

import { OrganizationAuthRequestApiService } from "./organization-auth-request-api.service";
import { OrganizationAuthRequestService } from "./organization-auth-request.service";

describe("OrganizationAuthRequestService", () => {
  let organizationAuthRequestApiService: MockProxy<OrganizationAuthRequestApiService>;
  let cryptoService: MockProxy<CryptoService>;
  let organizationUserService: MockProxy<OrganizationUserService>;
  let organizationAuthRequestService: OrganizationAuthRequestService;

  beforeEach(() => {
    organizationAuthRequestApiService = mock<OrganizationAuthRequestApiService>();
    cryptoService = mock<CryptoService>();
    organizationUserService = mock<OrganizationUserService>();
    organizationAuthRequestService = new OrganizationAuthRequestService(
      organizationAuthRequestApiService,
      cryptoService,
      organizationUserService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("listPendingRequests", () => {
    it("should return a list of pending auth requests", async () => {
      spyOn(organizationAuthRequestApiService, "listPendingRequests");

      const pendingAuthRequest = new PendingAuthRequestView();
      pendingAuthRequest.id = "requestId1";
      pendingAuthRequest.userId = "userId1";
      pendingAuthRequest.organizationUserId = "userId1";
      pendingAuthRequest.email = "email1";
      pendingAuthRequest.publicKey = "publicKey1";
      pendingAuthRequest.requestDeviceIdentifier = "requestDeviceIdentifier1";
      pendingAuthRequest.requestDeviceType = "requestDeviceType1";
      pendingAuthRequest.requestIpAddress = "requestIpAddress1";
      pendingAuthRequest.creationDate = new Date();
      const mockPendingAuthRequests = [pendingAuthRequest];
      organizationAuthRequestApiService.listPendingRequests.mockResolvedValue(
        mockPendingAuthRequests,
      );

      const result = await organizationAuthRequestService.listPendingRequests("organizationId");

      expect(result).toHaveLength(1);
      expect(result).toEqual(mockPendingAuthRequests);
      expect(organizationAuthRequestApiService.listPendingRequests).toHaveBeenCalledWith(
        "organizationId",
      );
    });
  });

  describe("denyPendingRequests", () => {
    it("should deny the specified pending auth requests", async () => {
      spyOn(organizationAuthRequestApiService, "denyPendingRequests");

      await organizationAuthRequestService.denyPendingRequests(
        "organizationId",
        "requestId1",
        "requestId2",
      );
    });
  });

  describe("approvePendingRequest", () => {
    it("should approve the specified pending auth request", async () => {
      const mockPendingAuthRequest = new PendingAuthRequestView();

      await organizationAuthRequestService.approvePendingRequest(
        "organizationId",
        mockPendingAuthRequest,
      );
    });
  });
});
