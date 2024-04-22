import { Component, OnInit } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { KdfType, PBKDF2_ITERATIONS } from "@bitwarden/common/platform/enums";

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
  visibleBanner: VisibleVaultBanner | null;

  VisibleVaultBanner = VisibleVaultBanner;

  constructor(
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private platformUtilsService: PlatformUtilsService,
    private tokenService: TokenService,
    private userVerificationService: UserVerificationService,
    private stateService: StateService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.determineVisibleBanner();
  }

  dismissBanner(): void {
    this.visibleBanner = null;
  }

  private async determineVisibleBanner(): Promise<void> {
    const showBrowserOutdated = window.navigator.userAgent.indexOf("MSIE") !== -1;
    const showVerifyEmail = !(await this.tokenService.getEmailVerified());
    const showLowKdf = (await this.userVerificationService.hasMasterPassword())
      ? await this.isLowKdfIteration()
      : false;

    const canAccessPremium = await firstValueFrom(
      this.billingAccountProfileStateService.hasPremiumFromAnySource$,
    );

    const showPremiumBanner = !canAccessPremium && !this.platformUtilsService.isSelfHost();

    switch (true) {
      case showBrowserOutdated:
        this.visibleBanner = VisibleVaultBanner.OutdatedBrowser;
        break;
      case showLowKdf:
        this.visibleBanner = VisibleVaultBanner.KDFSettings;
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

  private async isLowKdfIteration() {
    const kdfType = await this.stateService.getKdfType();
    const kdfOptions = await this.stateService.getKdfConfig();
    return (
      kdfType === KdfType.PBKDF2_SHA256 && kdfOptions.iterations < PBKDF2_ITERATIONS.defaultValue
    );
  }
}
