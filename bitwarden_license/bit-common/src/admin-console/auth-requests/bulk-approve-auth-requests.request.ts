export class BulkApproveAuthRequestsRequest {
  private ids: string[];
  constructor(authRequestIds: string[]) {
    this.ids = authRequestIds;
  }
}
