import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { BehaviorSubject, Subject, switchMap, takeUntil, tap } from "rxjs";

import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { TableDataSource } from "@bitwarden/components";
import { Devices } from "@bitwarden/web-vault/app/admin-console/icons";

import { OrganizationAuthRequestService } from "../../../../../../../bit-common/src/admin-console/services/auth-requests/organization-auth-request.service";
import { PendingAuthRequestView } from "../../../../../../../bit-common/src/admin-console/views/auth-requests/pending-auth-request.view";
@Component({
  selector: "app-org-device-approvals",
  templateUrl: "./device-approvals.component.html",
})
export class DeviceApprovalsComponent implements OnInit, OnDestroy {
  tableDataSource = new TableDataSource<PendingAuthRequestView>();
  organizationId: string;
  loading = true;
  actionInProgress = false;

  protected readonly Devices = Devices;

  private destroy$ = new Subject<void>();
  private refresh$ = new BehaviorSubject<void>(null);

  constructor(
    private organizationAuthRequestService: OrganizationAuthRequestService,
    private organizationUserService: OrganizationUserService,
    private route: ActivatedRoute,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private logService: LogService,
    private validationService: ValidationService,
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        tap((params) => (this.organizationId = params.organizationId)),
        switchMap(() =>
          this.refresh$.pipe(
            tap(() => (this.loading = true)),
            switchMap(() =>
              this.organizationAuthRequestService.listPendingRequests(this.organizationId),
            ),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((r) => {
        this.tableDataSource.data = r;
        this.loading = false;
      });
  }

  async approveRequest(authRequest: PendingAuthRequestView) {
    await this.performAsyncAction(async () => {
      const details = await this.organizationUserService.getOrganizationUserResetPasswordDetails(
        this.organizationId,
        authRequest.organizationUserId,
      );

      // The user must be enrolled in account recovery (password reset) in order for the request to be approved.
      if (details == null || details.resetPasswordKey == null) {
        this.platformUtilsService.showToast(
          "error",
          null,
          this.i18nService.t("resetPasswordDetailsError"),
        );
        return;
      }

      await this.organizationAuthRequestService.approvePendingRequest(
        this.organizationId,
        details.resetPasswordKey,
        details.encryptedPrivateKey,
        authRequest.publicKey,
        authRequest.id,
      );

      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("loginRequestApproved"),
      );
    });
  }

  async denyRequest(requestId: string) {
    await this.performAsyncAction(async () => {
      await this.organizationAuthRequestService.denyPendingRequests(this.organizationId, requestId);
      this.platformUtilsService.showToast("error", null, this.i18nService.t("loginRequestDenied"));
    });
  }

  async denyAllRequests() {
    if (this.tableDataSource.data.length === 0) {
      return;
    }

    await this.performAsyncAction(async () => {
      await this.organizationAuthRequestService.denyPendingRequests(
        this.organizationId,
        ...this.tableDataSource.data.map((r) => r.id),
      );
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("allLoginRequestsDenied"),
      );
    });
  }

  private async performAsyncAction(action: () => Promise<void>) {
    if (this.actionInProgress) {
      return;
    }
    this.actionInProgress = true;
    try {
      await action();
      this.refresh$.next();
    } catch (err: unknown) {
      this.logService.error(err.toString());
      this.validationService.showError(err);
    } finally {
      this.actionInProgress = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
