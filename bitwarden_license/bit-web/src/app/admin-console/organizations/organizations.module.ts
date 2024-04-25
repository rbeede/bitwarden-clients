import { NgModule } from "@angular/core";

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
  providers: [OrganizationAuthRequestApiService, OrganizationAuthRequestService],
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
