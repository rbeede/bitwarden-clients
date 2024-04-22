import { Component, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

export enum VisibleVaultBanner {
  Premium = "premium",
  OutdatedBrowser = "outdated-browser",
  VerifyEmail = "verify-email",
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
    private tokenService: TokenService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.determineVisibleBanner();
  }

  private async determineVisibleBanner(): Promise<void> {
    const showBrowserOutdated = window.navigator.userAgent.indexOf("MSIE") !== -1;

    const canAccessPremium = await firstValueFrom(
      this.billingAccountProfileStateService.hasPremiumFromAnySource$,
    );

    const showPremiumBanner = !canAccessPremium && !this.platformUtilsService.isSelfHost();

    const showVerifyEmail = !(await this.tokenService.getEmailVerified());

    switch (true) {
      case showBrowserOutdated:
        this.visibleBanner = VisibleVaultBanner.OutdatedBrowser;
        break;
      case showVerifyEmail:
        this.visibleBanner = VisibleVaultBanner.VerifyEmail;
        break;
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
