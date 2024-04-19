import { Component, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

export enum VisibleVaultBanner {
  Premium = "premium",
}

@Component({
  selector: "app-vault-banners",
  templateUrl: "./vault-banners.component.html",
})
export class VaultBannersComponent implements OnInit {
  visibleBanner: VisibleVaultBanner | null;

  VisibleVaultBanner = VisibleVaultBanner;

  constructor(
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private platformUtilsService: PlatformUtilsService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.determineVisibleBanner();
  }

  private async determineVisibleBanner(): Promise<void> {
    const canAccessPremium = await firstValueFrom(
      this.billingAccountProfileStateService.hasPremiumFromAnySource$,
    );

    const showPremiumBanner = !canAccessPremium && !this.platformUtilsService.isSelfHost();

    switch (true) {
      case showPremiumBanner:
        this.visibleBanner = VisibleVaultBanner.Premium;
        break;
      default:
        this.visibleBanner = null;
    }
  }

  dismissBanner(): void {
    this.visibleBanner = null;
  }
}
