import { AdminAuthRequestUpdateWithIdRequest } from "./admin-auth-request-update.request";

export class BulkApproveAuthRequestsRequest {
  private requests: AdminAuthRequestUpdateWithIdRequest[];
  constructor(requests: AdminAuthRequestUpdateWithIdRequest[]) {
    this.requests = requests;
  }
}
