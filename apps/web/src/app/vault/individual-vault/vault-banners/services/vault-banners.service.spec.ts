import { TestBed } from "@angular/core/testing";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateProvider } from "@bitwarden/common/platform/state";
import { FakeStateProvider, mockAccountServiceWith } from "@bitwarden/common/spec";
import { UserId } from "@bitwarden/common/types/guid";

import { PREMIUM_BANNER_REPROMPT_KEY, VaultBannersService } from "./vault-banners.service";

describe("VaultBannersService", () => {
  let service: VaultBannersService;
  const isSelfHost = jest.fn().mockReturnValue(false);
  const hasPremiumFromAnySource$ = new BehaviorSubject<boolean>(false);
  const fakeStateProvider = new FakeStateProvider(mockAccountServiceWith("user-id" as UserId));

  beforeEach(() => {
    isSelfHost.mockClear();
    TestBed.configureTestingModule({
      providers: [
        VaultBannersService,
        {
          provide: PlatformUtilsService,
          useValue: { isSelfHost },
        },
        {
          provide: BillingAccountProfileStateService,
          useValue: { hasPremiumFromAnySource$: hasPremiumFromAnySource$ },
        },
        {
          provide: StateProvider,
          useValue: fakeStateProvider,
        },
      ],
    });
  });

  describe("premium banner", () => {
    it("shows premium banner when not self hosted and no premium", async () => {
      hasPremiumFromAnySource$.next(false);
      isSelfHost.mockReturnValue(false);

      service = TestBed.inject(VaultBannersService);

      expect(await service.shouldShowPremiumBanner()).toBe(true);
    });

    describe("dismissing", () => {
      beforeEach(async () => {
        jest.useFakeTimers();
        const date = new Date("2023-06-08");
        date.setHours(0, 0, 0, 0);
        jest.setSystemTime(date.getTime());

        service = TestBed.inject(VaultBannersService);
        await service.dismissPremiumBanner();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it("updates state on first dismiss", async () => {
        const state = await firstValueFrom(
          fakeStateProvider.getActive(PREMIUM_BANNER_REPROMPT_KEY).state$,
        );

        const oneWeekLater = new Date("2023-06-15");
        oneWeekLater.setHours(0, 0, 0, 0);

        expect(state).toEqual({
          numberOfDismissals: 1,
          nextPromptDate: oneWeekLater.getTime(),
        });
      });

      it("updates state on second dismiss", async () => {
        const state = await firstValueFrom(
          fakeStateProvider.getActive(PREMIUM_BANNER_REPROMPT_KEY).state$,
        );

        const oneMonthLater = new Date("2023-07-08");
        oneMonthLater.setHours(0, 0, 0, 0);

        expect(state).toEqual({
          numberOfDismissals: 2,
          nextPromptDate: oneMonthLater.getTime(),
        });
      });

      it("updates state on third dismiss", async () => {
        const state = await firstValueFrom(
          fakeStateProvider.getActive(PREMIUM_BANNER_REPROMPT_KEY).state$,
        );

        const oneYearLater = new Date("2024-06-08");
        oneYearLater.setHours(0, 0, 0, 0);

        expect(state).toEqual({
          numberOfDismissals: 3,
          nextPromptDate: oneYearLater.getTime(),
        });
      });
    });
  });
});
