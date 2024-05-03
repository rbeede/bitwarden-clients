import { NgModule } from "@angular/core";

import { NoItemsModule } from "@bitwarden/components";
import { CoreOrganizationModule } from "@bitwarden/web-vault/app/admin-console/organizations/core";
import { LooseComponentsModule } from "@bitwarden/web-vault/app/shared";
import { SharedModule } from "@bitwarden/web-vault/app/shared/shared.module";

import { SsoComponent } from "../../auth/sso/sso.component";

import { DomainAddEditDialogComponent } from "./manage/domain-verification/domain-add-edit-dialog/domain-add-edit-dialog.component";
import { DomainVerificationComponent } from "./manage/domain-verification/domain-verification.component";
import { ScimComponent } from "./manage/scim.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";

@NgModule({
  imports: [
    SharedModule,
    CoreOrganizationModule,
    OrganizationsRoutingModule,
    NoItemsModule,
    LooseComponentsModule,
  ],
  declarations: [
    SsoComponent,
    ScimComponent,
    DomainVerificationComponent,
    DomainAddEditDialogComponent,
  ],
})
export class OrganizationsModule {}
