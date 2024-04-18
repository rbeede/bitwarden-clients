import { VaultTimeoutAction } from "../../enums/vault-timeout-action.enum";
import { UserKeyDefinition, VAULT_TIMEOUT_SETTINGS_DISK_LOCAL } from "../../platform/state";
import { VaultTimeout } from "../../types/vault-timeout.type";

/**
 * Settings use disk storage and local storage on web so settings can persist after logout.
 */
export const VAULT_TIMEOUT_ACTION = new UserKeyDefinition<VaultTimeoutAction>(
  VAULT_TIMEOUT_SETTINGS_DISK_LOCAL,
  "vaultTimeoutAction",
  {
    deserializer: (vaultTimeoutAction) => vaultTimeoutAction,
    clearOn: [], // persisted on logout
  },
);

export const VAULT_TIMEOUT = new UserKeyDefinition<VaultTimeout>(
  VAULT_TIMEOUT_SETTINGS_DISK_LOCAL,
  "vaultTimeout",
  {
    deserializer: (vaultTimeout) => vaultTimeout,
    clearOn: [], // persisted on logout
  },
);
