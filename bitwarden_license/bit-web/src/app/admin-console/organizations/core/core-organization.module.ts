import { NgModule } from "@angular/core";

import { OrganizationAuthRequestService } from "../../../../../../bit-common/src/admin-console/services/auth-requests";

@NgModule({
  providers: [OrganizationAuthRequestService],
})
export class CoreOrganizationModule {}
