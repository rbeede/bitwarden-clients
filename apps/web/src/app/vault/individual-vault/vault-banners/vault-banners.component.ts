import { Component, OnInit } from "@angular/core";

import { VaultBannersService, VisibleVaultBanner } from "./services/vault-banners.service";

@Component({
  selector: "app-vault-banners",
  templateUrl: "./vault-banners.component.html",
})
export class VaultBannersComponent implements OnInit {
  visibleBanners: VisibleVaultBanner[] = [];
  VisibleVaultBanner = VisibleVaultBanner;

  constructor(private vaultBannerService: VaultBannersService) {}

  async ngOnInit(): Promise<void> {
    await this.determineVisibleBanner();
  }

  async dismissBanner(banner: VisibleVaultBanner): Promise<void> {
    await this.vaultBannerService.bannerDismissed(banner);

    await this.determineVisibleBanner();
  }

  /** Determine which banners should be present */
  private async determineVisibleBanner(): Promise<void> {
    const showBrowserOutdated = await this.vaultBannerService.shouldShowUpdateBrowserBanner();
    const showVerifyEmail = await this.vaultBannerService.shouldShowVerifyEmailBanner();
    const showLowKdf = await this.vaultBannerService.shouldShowLowKDFBanner();
    const showPremiumBanner = await this.vaultBannerService.shouldShowPremiumBanner();

    this.visibleBanners = [
      showBrowserOutdated ? VisibleVaultBanner.OutdatedBrowser : null,
      showVerifyEmail ? VisibleVaultBanner.VerifyEmail : null,
      showLowKdf ? VisibleVaultBanner.KDFSettings : null,
      showPremiumBanner ? VisibleVaultBanner.Premium : null,
    ].filter(Boolean); // remove all falsy values, i.e. null
  }
}
