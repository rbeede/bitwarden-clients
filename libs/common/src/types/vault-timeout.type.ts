export type VaultTimeout =
  | number
  | "never" // null
  | "immediately" // 0
  | "onRestart" // -1
  | "onLocked" // -2
  | "onSleep" // -3
  | "onIdle"; // -4
