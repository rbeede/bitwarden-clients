import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  StateProvider,
  ActiveUserState,
  KeyDefinition,
  PREMIUM_BANNER_DISK_LOCAL,
} from "@bitwarden/common/platform/state";

type PremiumBannerReprompt = {
  numberOfDismissals: number;
  /** Timestamp representing when to show the prompt next */
  nextPromptDate: number;
};

export const PREMIUM_BANNER_REPROMPT_KEY = new KeyDefinition<PremiumBannerReprompt>(
  PREMIUM_BANNER_DISK_LOCAL,
  "bannerReprompt",
  {
    deserializer: (bannerReprompt) => bannerReprompt,
  },
);

@Injectable()
export class VaultBannersService {
  private bannerState: ActiveUserState<PremiumBannerReprompt>;

  constructor(
    protected stateProvider: StateProvider,
    private billingAccountProfileStateService: BillingAccountProfileStateService,
    private platformUtilsService: PlatformUtilsService,
  ) {
    this.bannerState = this.stateProvider.getActive(PREMIUM_BANNER_REPROMPT_KEY);
  }

  /** Determine if the premium banner should be shown */
  async shouldShowPremiumBanner(): Promise<boolean> {
    const canAccessPremium = await firstValueFrom(
      this.billingAccountProfileStateService.hasPremiumFromAnySource$,
    );

    const shouldShowPremiumBanner = !canAccessPremium && !this.platformUtilsService.isSelfHost();

    const dismissedState = await firstValueFrom(this.bannerState.state$);

    // Check if nextPromptDate is in the past passed
    if (shouldShowPremiumBanner && dismissedState?.nextPromptDate) {
      const nextPromptDate = new Date(dismissedState.nextPromptDate);
      const now = new Date();

      return now >= nextPromptDate;
    }

    return shouldShowPremiumBanner;
  }

  /** Increment dismissal state of the premium banner  */
  async dismissPremiumBanner(): Promise<void> {
    await this.bannerState.update((current) => {
      const numberOfDismissals = current?.numberOfDismissals ?? 0;
      const now = new Date();

      // Set midnight of the current day
      now.setHours(0, 0, 0, 0);

      // First dismissal, re-prompt in 1 week
      if (numberOfDismissals === 0) {
        now.setDate(now.getDate() + 7);
        return {
          numberOfDismissals: 1,
          nextPromptDate: now.getTime(),
        };
      }

      // Second dismissal, re-prompt in 1 month
      if (numberOfDismissals === 1) {
        now.setMonth(now.getMonth() + 1);
        return {
          numberOfDismissals: 2,
          nextPromptDate: now.getTime(),
        };
      }

      // 3+ dismissals, re-prompt each year
      // Avoid day/month edge cases and only increment year
      const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      nextYear.setHours(0, 0, 0, 0);
      return {
        numberOfDismissals: numberOfDismissals + 1,
        nextPromptDate: nextYear.getTime(),
      };
    });
  }
}
