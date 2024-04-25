import { NgModule } from "@angular/core";

import { AcceptOrganizationComponent } from "./accept-organization.component";
import { AcceptOrganizationInviteService } from "./services/accept-organization.service";

@NgModule({
  declarations: [AcceptOrganizationComponent],
  imports: [],
  providers: [AcceptOrganizationInviteService],
})
export class AcceptOrganizationInviteModule {}
