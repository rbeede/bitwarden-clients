import { ComponentFixture, TestBed } from "@angular/core/testing";
import { mock } from "jest-mock-extended";

import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { KdfType } from "@bitwarden/common/platform/enums";
import { BannerModule } from "@bitwarden/components";

import { LooseComponentsModule } from "../../../shared";

import { VaultBannersService } from "./services/vault-banners.service";
import { VaultBannersComponent, VisibleVaultBanner } from "./vault-banners.component";

describe("VaultBannersComponent", () => {
  let component: VaultBannersComponent;
  let fixture: ComponentFixture<VaultBannersComponent>;

  const isSelfHost = jest.fn().mockReturnValue(false);
  const getEmailVerified = jest.fn().mockResolvedValue(true);
  const hasMasterPassword = jest.fn().mockResolvedValue(true);
  const getKdfType = jest.fn().mockResolvedValue(KdfType.PBKDF2_SHA256);
  const getKdfConfig = jest.fn().mockResolvedValue({ iterations: 600000 });
  const bannerService = mock<VaultBannersService>({
    shouldShowPremiumBanner: jest.fn(),
    dismissPremiumBanner: jest.fn(),
  });

  beforeEach(async () => {
    bannerService.shouldShowPremiumBanner.mockResolvedValue(false);
    isSelfHost.mockClear();
    getEmailVerified.mockClear();
    getEmailVerified.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [BannerModule, LooseComponentsModule],
      declarations: [VaultBannersComponent, I18nPipe],
      providers: [
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
        {
          provide: UserVerificationService,
          useValue: { hasMasterPassword },
        },
        {
          provide: StateService,
          useValue: { getKdfType, getKdfConfig },
        },
        {
          provide: VaultBannersService,
          useValue: bannerService,
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
        bannerService.shouldShowPremiumBanner.mockResolvedValue(true);

        await component.ngOnInit();
        fixture.detectChanges();
      });

      it("shows premium banner", async () => {
        expect(component.visibleBanners).toEqual([VisibleVaultBanner.Premium]);
      });

      it("dismisses premium banner", async () => {
        const dismissButton = fixture.debugElement.nativeElement.querySelector(
          'button[biticonbutton="bwi-close"]',
        );

        // Mock out the banner service returning false after dismissing
        bannerService.shouldShowPremiumBanner.mockResolvedValue(false);

        dismissButton.dispatchEvent(new Event("click"));

        expect(bannerService.dismissPremiumBanner).toHaveBeenCalled();

        expect(component.visibleBanners).toEqual([]);
      });
    });

    describe("verify email banner", () => {
      beforeEach(async () => {
        getEmailVerified.mockResolvedValue(false);

        await component.ngOnInit();
        fixture.detectChanges();
      });

      it("shows verify email banner", async () => {
        expect(component.visibleBanners).toEqual([VisibleVaultBanner.VerifyEmail]);
      });

      it("dismisses verify email banner", async () => {
        const dismissButton = fixture.debugElement.nativeElement.querySelector(
          'button[biticonbutton="bwi-close"]',
        );

        dismissButton.dispatchEvent(new Event("click"));

        expect(component.visibleBanners).toEqual([]);
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
        expect(component.visibleBanners).toEqual([VisibleVaultBanner.OutdatedBrowser]);
      });

      it("dismisses outdated browser banner", async () => {
        const dismissButton = fixture.debugElement.nativeElement.querySelector(
          'button[biticonbutton="bwi-close"]',
        );

        dismissButton.dispatchEvent(new Event("click"));

        expect(component.visibleBanners).toEqual([]);
      });
    });

    describe("low KDF iteration banner", () => {
      beforeEach(async () => {
        hasMasterPassword.mockResolvedValue(true);
        getKdfType.mockResolvedValue(KdfType.PBKDF2_SHA256);
        getKdfConfig.mockResolvedValue({ iterations: 599999 });

        await component.ngOnInit();
        fixture.detectChanges();
      });

      it("shows low KDF iteration banner", async () => {
        expect(component.visibleBanners).toEqual([VisibleVaultBanner.KDFSettings]);
      });

      it("does not show low KDF iteration banner if KDF type is not PBKDF2_SHA256", async () => {
        getKdfType.mockResolvedValue(KdfType.Argon2id);

        await component.ngOnInit();
        fixture.detectChanges();

        expect(component.visibleBanners).toEqual([]);
      });

      it("does not show low KDF for iterations about 600,000", async () => {
        getKdfConfig.mockResolvedValue({ iterations: 600001 });

        await component.ngOnInit();
        fixture.detectChanges();

        expect(component.visibleBanners).toEqual([]);
      });

      it("dismisses low KDF iteration banner", async () => {
        const dismissButton = fixture.debugElement.nativeElement.querySelector(
          'button[biticonbutton="bwi-close"]',
        );

        dismissButton.dispatchEvent(new Event("click"));

        expect(component.visibleBanners).toEqual([]);
      });
    });
  });
});
