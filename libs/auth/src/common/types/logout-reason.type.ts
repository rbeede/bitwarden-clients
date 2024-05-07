export type LogoutReason =
  | "sessionExpired"
  | "accessTokenUnableToBeDecrypted"
  | "refreshTokenSecureStorageRetrievalFailure";
