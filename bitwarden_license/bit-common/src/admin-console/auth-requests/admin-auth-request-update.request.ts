export class AdminAuthRequestUpdateRequest {
  /**
   *
   * @param requestApproved - Whether the request was approved/denied. If true, the key must be provided.
   * @param encryptedUserKey The user key that has been encrypted with a device public key if the request was approved.
   */
  constructor(
    public requestApproved: boolean,
    public encryptedUserKey?: string,
  ) {}
}

export class AdminAuthRequestUpdateWithIdRequest extends AdminAuthRequestUpdateRequest {
  constructor(
    public id: string,
    public requestApproved: boolean,
    public encryptedUserKey?: string,
  ) {
    super(requestApproved, encryptedUserKey);
  }
}
