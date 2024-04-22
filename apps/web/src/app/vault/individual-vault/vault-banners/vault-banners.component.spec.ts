import { ComponentFixture, TestBed } from "@angular/core/testing";
import { mock } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { BannerModule } from "@bitwarden/components";

import { LooseComponentsModule } from "../../../shared";

import { VaultBannersComponent, VisibleVaultBanner } from "./vault-banners.component";

describe("VaultBannersComponent", () => {
  let component: VaultBannersComponent;
  let fixture: ComponentFixture<VaultBannersComponent>;

  const hasPremiumFromAnySource$ = new BehaviorSubject<boolean>(false);
  const isSelfHost = jest.fn().mockReturnValue(false);
  const getEmailVerified = jest.fn().mockResolvedValue(true);

  beforeEach(async () => {
    isSelfHost.mockClear();
    getEmailVerified.mockClear();

    await TestBed.configureTestingModule({
      imports: [BannerModule, LooseComponentsModule],
      declarations: [VaultBannersComponent, I18nPipe],
      providers: [
        {
          provide: BillingAccountProfileStateService,
          useValue: { hasPremiumFromAnySource$: hasPremiumFromAnySource$ },
        },
        {
          provide: PlatformUtilsService,
          useValue: { isSelfHost },
        },
        {
          provide: I18nService,
          useValue: mock<I18nService>({ t: (key) => key }),
        },
        {
          provide: TokenService,
          useValue: { getEmailVerified },
        },
        {
          provide: ApiService,
          useValue: mock<ApiService>(),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    // Refine the userAgent before each test so each run is consistent
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () => "Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/20.0.3",
    });

    fixture = TestBed.createComponent(VaultBannersComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe("determineVisibleBanner", () => {
    describe("premium banner", () => {
      beforeEach(async () => {
        hasPremiumFromAnySource$.next(false);
        isSelfHost.mockReturnValue(false);

        await component.ngOnInit();
        fixture.detectChanges();
      });

      it("shows premium banner", async () => {
        expect(component.visibleBanner).toBe(VisibleVaultBanner.Premium);
      });

      it("dismisses premium banner", async () => {
        const dismissButton = fixture.debugElement.nativeElement.querySelector(
          'button[biticonbutton="bwi-close"]',
        );

        dismissButton.dispatchEvent(new Event("click"));

        expect(component.visibleBanner).toBe(null);
      });
    });

    describe("verify email banner", () => {
      beforeEach(async () => {
        getEmailVerified.mockResolvedValue(false);

        await component.ngOnInit();
        fixture.detectChanges();
      });

      it("shows verify email banner", async () => {
        expect(component.visibleBanner).toBe(VisibleVaultBanner.VerifyEmail);
      });

      it("dismisses verify email banner", async () => {
        const dismissButton = fixture.debugElement.nativeElement.querySelector(
          'button[biticonbutton="bwi-close"]',
        );

        dismissButton.dispatchEvent(new Event("click"));

        expect(component.visibleBanner).toBe(null);
      });
    });

    describe("outdated browser banner", () => {
      beforeEach(async () => {
        // Hardcode `MSIE` in userAgent string
        const userAgent = "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 MSIE";
        Object.defineProperty(navigator, "userAgent", {
          configurable: true,
          get: () => userAgent,
        });

        await component.ngOnInit();
        fixture.detectChanges();
      });

      it("shows outdated browser banner", async () => {
        expect(component.visibleBanner).toBe(VisibleVaultBanner.OutdatedBrowser);
      });

      it("dismisses outdated browser banner", async () => {
        const dismissButton = fixture.debugElement.nativeElement.querySelector(
          'button[biticonbutton="bwi-close"]',
        );

        dismissButton.dispatchEvent(new Event("click"));

        expect(component.visibleBanner).toBe(null);
      });
    });
  });
});
