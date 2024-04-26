import { NgModule } from "@angular/core";

import { safeProvider } from "@bitwarden/angular/platform/utils/safe-provider";
import { LOGOUT_CALLBACK } from "@bitwarden/angular/services/injection-tokens";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { ApiService } from "@bitwarden/common/services/api.service";
import { NoItemsModule } from "@bitwarden/components";
import { LooseComponentsModule } from "@bitwarden/web-vault/app/shared";
import { SharedModule } from "@bitwarden/web-vault/app/shared/shared.module";

import { OrganizationAuthRequestApiService } from "../../../../../bit-common/src/admin-console/services/auth-requests/organization-auth-request-api.service";
import { OrganizationAuthRequestService } from "../../../../../bit-common/src/admin-console/services/auth-requests/organization-auth-request.service";
import { SsoComponent } from "../../auth/sso/sso.component";

import { DeviceApprovalsComponent } from "./manage/device-approvals/device-approvals.component";
import { DomainAddEditDialogComponent } from "./manage/domain-verification/domain-add-edit-dialog/domain-add-edit-dialog.component";
import { DomainVerificationComponent } from "./manage/domain-verification/domain-verification.component";
import { ScimComponent } from "./manage/scim.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";

@NgModule({
  providers: [
    safeProvider({
      provide: ApiService,
      deps: [
        TokenService,
        PlatformUtilsService,
        EnvironmentService,
        AppIdService,
        StateService,
        LOGOUT_CALLBACK,
      ],
    }),
    safeProvider({
      provide: OrganizationAuthRequestApiService,
      deps: [ApiService],
    }),
    safeProvider({
      provide: OrganizationAuthRequestService,
      deps: [OrganizationAuthRequestApiService, CryptoService, OrganizationUserService],
    }),
  ],
  imports: [SharedModule, OrganizationsRoutingModule, NoItemsModule, LooseComponentsModule],
  declarations: [
    SsoComponent,
    ScimComponent,
    DomainVerificationComponent,
    DomainAddEditDialogComponent,
    DeviceApprovalsComponent,
  ],
})
export class OrganizationsModule {}
