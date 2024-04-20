// Note: the below comments are just for documenting what they used to be.
export type VaultTimeout =
  | number // 0 for immediately; otherwise positive numbers
  | "never" // null
  | "onRestart" // -1
  | "onLocked" // -2
  | "onSleep" // -3
  | "onIdle"; // -4

export interface VaultTimeoutOption {
  name: string;
  value: VaultTimeout;
}
