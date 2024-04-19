import { ComponentFixture, TestBed } from "@angular/core/testing";
import { mock } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { BannerModule } from "@bitwarden/components";

import { VaultBannersComponent } from "./vault-banners.component";

describe("VaultBannersComponent", () => {
  let component: VaultBannersComponent;
  let fixture: ComponentFixture<VaultBannersComponent>;

  const hasPremiumFromAnySource$ = new BehaviorSubject<boolean>(false);
  const isSelfHost = jest.fn().mockReturnValue(false);

  beforeEach(async () => {
    isSelfHost.mockClear();

    await TestBed.configureTestingModule({
      imports: [BannerModule],
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
      ],
    }).compileComponents();
  });

  beforeEach(() => {
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
        expect(component.visibleBanner).toBe("premium");
      });

      it("dismisses premium banner", async () => {
        const dismissButton = fixture.debugElement.nativeElement.querySelector(
          'button[biticonbutton="bwi-close"]',
        );

        dismissButton.dispatchEvent(new Event("click"));

        expect(component.visibleBanner).toBe(null);
      });
    });
  });
});
