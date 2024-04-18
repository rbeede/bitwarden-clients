import { NgModule } from "@angular/core";

import { OrganizationAuthRequestApiService } from "../../../../../../bit-common/src/admin-console/services/auth-requests/organization-auth-request-api.service";
import { OrganizationAuthRequestService } from "../../../../../../bit-common/src/admin-console/services/auth-requests/organization-auth-request.service";

@NgModule({
  providers: [OrganizationAuthRequestApiService, OrganizationAuthRequestService],
})
export class CoreOrganizationModule {}
