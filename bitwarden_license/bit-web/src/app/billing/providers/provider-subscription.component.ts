import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject, concatMap, firstValueFrom, takeUntil } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { BillingApiServiceAbstraction } from "@bitwarden/common/billing/abstractions/billilng-api.service.abstraction";
import { ProviderSubscriptionResponse } from "@bitwarden/common/billing/models/response/provider-subscription-response";
import { BillingSubscriptionItemResponse } from "@bitwarden/common/billing/models/response/subscription.response";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components";

import { I18nService } from "src/app/core/i18n.service";

@Component({
  selector: "app-provider-subscription",
  templateUrl: "./provider-subscription.component.html",
})
export class ProviderSubscriptionComponent {
  sub: ProviderSubscriptionResponse;
  lineItems: BillingSubscriptionItemResponse[] = [];
  providerId: string;
  firstLoaded = false;
  loading: boolean;
  locale: string;
  private destroy$ = new Subject<void>();
  showUpdatedSubscriptionStatusSection$: Observable<boolean>;

  protected enableConsolidatedBilling$ = this.configService.getFeatureFlag$(
    FeatureFlag.EnableConsolidatedBilling,
  );

  constructor(
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private logService: LogService,
    private organizationService: OrganizationService,
    private billingApiService: BillingApiServiceAbstraction,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private configService: ConfigService,
  ) {}

  async ngOnInit() {
    if (this.route.snapshot.queryParamMap.get("upgrade")) {
      // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
    }

    this.route.params
      .pipe(
        concatMap(async (params) => {
          this.providerId = params.providerId;
          await this.load();
          this.firstLoaded = true;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.showUpdatedSubscriptionStatusSection$ = this.configService.getFeatureFlag$(
      FeatureFlag.AC1795_UpdatedSubscriptionStatusSection,
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.locale = await firstValueFrom(this.i18nService.locale$);
    this.sub = await this.billingApiService.getProviderSubscription(this.providerId);

    this.loading = false;
  }
}
