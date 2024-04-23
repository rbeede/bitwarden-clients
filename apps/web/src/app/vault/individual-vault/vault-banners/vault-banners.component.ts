import { Component, OnInit } from "@angular/core";

import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { KdfType, PBKDF2_ITERATIONS } from "@bitwarden/common/platform/enums";

import { VaultBannersService } from "./services/vault-banners.service";

export enum VisibleVaultBanner {
  KDFSettings = "kdf-settings",
  OutdatedBrowser = "outdated-browser",
  Premium = "premium",
  VerifyEmail = "verify-email",
}

@Component({
  selector: "app-vault-banners",
  templateUrl: "./vault-banners.component.html",
})
export class VaultBannersComponent implements OnInit {
  visibleBanners: VisibleVaultBanner[] = [];
  VisibleVaultBanner = VisibleVaultBanner;

  constructor(
    private tokenService: TokenService,
    private userVerificationService: UserVerificationService,
    private stateService: StateService,
    private vaultBannerService: VaultBannersService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.determineVisibleBanner();
  }

  async dismissBanner(banner: VisibleVaultBanner): Promise<void> {
    if (banner === VisibleVaultBanner.Premium) {
      await this.vaultBannerService.dismissPremiumBanner();
    }

    await this.determineVisibleBanner();
  }

  /** Determine which banners should be present */
  private async determineVisibleBanner(): Promise<void> {
    const showBrowserOutdated = window.navigator.userAgent.indexOf("MSIE") !== -1;
    const showVerifyEmail = !(await this.tokenService.getEmailVerified());
    const showLowKdf = (await this.userVerificationService.hasMasterPassword())
      ? await this.isLowKdfIteration()
      : false;

    const showPremiumBanner = await this.vaultBannerService.shouldShowPremiumBanner();

    this.visibleBanners = [
      showBrowserOutdated ? VisibleVaultBanner.OutdatedBrowser : null,
      showVerifyEmail ? VisibleVaultBanner.VerifyEmail : null,
      showLowKdf ? VisibleVaultBanner.KDFSettings : null,
      showPremiumBanner ? VisibleVaultBanner.Premium : null,
    ].filter(Boolean); // remove all falsy values, i.e. null
  }

  private async isLowKdfIteration() {
    const kdfType = await this.stateService.getKdfType();
    const kdfOptions = await this.stateService.getKdfConfig();
    return (
      kdfType === KdfType.PBKDF2_SHA256 && kdfOptions.iterations < PBKDF2_ITERATIONS.defaultValue
    );
  }
}
