import { NgModule } from "@angular/core";

import { OrganizationAuthRequestApiService } from "../../../../../../bit-common/src/admin-console/services/auth-requests";

@NgModule({
  providers: [OrganizationAuthRequestApiService],
})
export class CoreOrganizationModule {}
