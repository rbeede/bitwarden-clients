import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, withDebugTracing } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { MockProxy, mock } from "jest-mock-extended";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { OrganizationBillingServiceAbstraction } from "@bitwarden/common/billing/abstractions/organization-billing.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { RouterService } from "../../core/router.service";
import { ServiceAccountView } from "../../models/view/service-account.view";
import { ServiceAccountService } from "../service-account.service";

import { serviceAccountAccessGuard } from "./service-account-access.guard";

@Component({
  template: "",
})
export class GuardedRouteTestComponent {}

@Component({
  template: "",
})
export class RedirectTestComponent {}

describe("Service account Redirect Guard", () => {
  let syncService: MockProxy<SyncService>;
  let organizationService: MockProxy<OrganizationService>;
  let organizationBillingService: MockProxy<OrganizationBillingServiceAbstraction>;
  let stateService: MockProxy<StateService>;
  let routerService: MockProxy<RouterService>;
  let routerHarness: RouterTestingHarness;
  let routerSpy: jest.SpyInstance;
  let serviceAccountService: MockProxy<ServiceAccountService>;

  const smOrg1 = { id: "123", canAccessSecretsManager: true } as Organization;
  const nonSmOrg1 = { id: "124", canAccessSecretsManager: false } as Organization;
  const serviceAccountView = {
    id: "123",
    organizationId: "123",
    name: "service-account-name",
  } as ServiceAccountView;

  beforeEach(async () => {
    syncService = mock<SyncService>();
    organizationService = mock<OrganizationService>();
    organizationBillingService = mock<OrganizationBillingServiceAbstraction>();
    stateService = mock<StateService>();
    routerService = mock<RouterService>();

    TestBed.configureTestingModule({
      providers: [
        { provide: SyncService, useValue: syncService },
        { provide: OrganizationService, useValue: organizationService },
        { provide: OrganizationBillingServiceAbstraction, useValue: organizationBillingService },
        { provide: StateService, useValue: stateService },
        { provide: RouterService, useValue: routerService },
        provideRouter(
          [
            {
              path: "guarded-route",
              component: GuardedRouteTestComponent,
              canActivate: [serviceAccountAccessGuard],
            },
            {
              path: "sm",
              component: RedirectTestComponent,
            },
          ],
          withDebugTracing(),
        ),
      ],
    });

    routerHarness = await RouterTestingHarness.create();
  });

  it("should navigate successfully if the org has access to sm and service account exists", async () => {
    // Arrange
    organizationService.getAll.mockResolvedValue([smOrg1]);
    routerService.getPreviousUrl.mockReturnValue(undefined);
    serviceAccountService.getByServiceAccountId.mockResolvedValue(serviceAccountView);

    // Act
    await routerHarness.navigateByUrl("guarded-route");

    // Assert
    expect(routerSpy).toHaveBeenCalled();
  });

  it("redirects to pw manager if org does not exist or doesn't have access to sm", async () => {
    // Arrange
    organizationService.getAll.mockResolvedValue([nonSmOrg1]);
    routerService.getPreviousUrl.mockReturnValue(undefined);

    // Act
    await routerHarness.navigateByUrl("guarded-route");

    // Assert
    expect(routerSpy).not.toHaveBeenCalledWith(["/sm"]);
  });

  it("redirects to sm/machine-accounts if machine account does not exist", async () => {
    // Arrange
    organizationService.getAll.mockResolvedValue([smOrg1]);
    serviceAccountService.getByServiceAccountId.mockResolvedValue(serviceAccountView);
    routerService.getPreviousUrl.mockReturnValue(undefined);

    // Act
    await routerHarness.navigateByUrl("guarded-route");

    // Assert
    expect(routerSpy).toHaveBeenCalledWith(["/sm/machine-accounts/"]);
  });
});
