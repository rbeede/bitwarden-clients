import { MockProxy, any } from "jest-mock-extended";

import { MigrationHelper } from "../migration-helper";
import { mockMigrationHelper } from "../migration-helper.spec";

import {
  VAULT_TIMEOUT,
  VAULT_TIMEOUT_ACTION,
  VaultTimeoutSettingsServiceStateProviderMigrator,
} from "./59-migrate-vault-timeout-settings-svc-to-state-provider";

// Represents data in state service pre-migration
function preMigrationJson() {
  return {
    global: {
      vaultTimeout: 30,
      vaultTimeoutAction: "lock",
      otherStuff: "otherStuff",
    },
    authenticatedAccounts: ["user1", "user2", "user3", "user4", "user5", "user6", "user7"],
    user1: {
      settings: {
        vaultTimeout: 30,
        vaultTimeoutAction: "lock",
        otherStuff: "otherStuff",
      },
      otherStuff: "otherStuff",
    },
    user2: {
      settings: {
        vaultTimeout: null as any,
        vaultTimeoutAction: "logOut",
        otherStuff: "overStuff",
      },
      otherStuff: "otherStuff",
    },
    user3: {
      settings: {
        vaultTimeout: -1, // onRestart
        vaultTimeoutAction: "lock",
        otherStuff: "overStuff",
      },
      otherStuff: "otherStuff",
    },
    user4: {
      settings: {
        vaultTimeout: -2, // onLocked
        vaultTimeoutAction: "logOut",
        otherStuff: "overStuff",
      },
      otherStuff: "otherStuff",
    },
    user5: {
      settings: {
        vaultTimeout: -3, // onSleep
        vaultTimeoutAction: "lock",
        otherStuff: "overStuff",
      },
      otherStuff: "otherStuff",
    },
    user6: {
      settings: {
        vaultTimeout: -4, // onIdle
        vaultTimeoutAction: "logOut",
        otherStuff: "overStuff",
      },
      otherStuff: "otherStuff",
    },
    user7: {
      settings: {
        // no vault timeout data to migrate
        otherStuff: "overStuff",
      },
      otherStuff: "otherStuff",
    },
  };
}

function rollbackJSON() {
  return {
    // User specific state provider data
    // use pattern user_{userId}_{stateDefinitionName}_{keyDefinitionKey} for user data

    // User1 migrated data
    user_user1_vaultTimeoutSettings_vaultTimeout: 30,
    user_user1_vaultTimeoutSettings_vaultTimeoutAction: "lock",

    // User2 migrated data
    user_user2_vaultTimeoutSettings_vaultTimeou: null as any,
    user_user2_vaultTimeoutSettings_vaultTimeoutAction: "logOut",

    // User3 migrated data
    user_user3_vaultTimeoutSettings_vaultTimeou: "onRestart",
    user_user3_vaultTimeoutSettings_vaultTimeoutAction: "lock",

    // User4 migrated data
    user_user4_vaultTimeoutSettings_vaultTimeou: "onLocked",
    user_user4_vaultTimeoutSettings_vaultTimeoutAction: "logOut",

    // User5 migrated data
    user_user5_vaultTimeoutSettings_vaultTimeou: "onSleep",
    user_user5_vaultTimeoutSettings_vaultTimeoutAction: "lock",

    // User6 migrated data
    user_user6_vaultTimeoutSettings_vaultTimeou: "onIdle",
    user_user6_vaultTimeoutSettings_vaultTimeoutAction: "logOut",

    // User7 migrated data
    // user_user7_vaultTimeoutSettings_vaultTimeout: null as any,
    // user_user7_vaultTimeoutSettings_vaultTimeoutAction: null as any,

    // Global state provider data
    // use pattern global_{stateDefinitionName}_{keyDefinitionKey} for global data
    // Not migrating global data

    global: {
      // no longer has vault timeout data
      otherStuff: "otherStuff",
    },
    authenticatedAccounts: ["user1", "user2", "user3"],
    user1: {
      settings: {
        otherStuff: "otherStuff",
      },
      otherStuff: "otherStuff",
    },
    user2: {
      settings: {
        otherStuff: "otherStuff",
      },
      otherStuff: "otherStuff",
    },
    user3: {
      settings: {
        otherStuff: "otherStuff",
      },
      otherStuff: "otherStuff",
    },
    user4: {
      settings: {
        otherStuff: "otherStuff",
      },
      otherStuff: "otherStuff",
    },
    user5: {
      settings: {
        otherStuff: "otherStuff",
      },
      otherStuff: "otherStuff",
    },
    user6: {
      settings: {
        otherStuff: "otherStuff",
      },
      otherStuff: "otherStuff",
    },
    user7: {
      settings: {
        otherStuff: "otherStuff",
      },
      otherStuff: "otherStuff",
    },
  };
}

describe("VaultTimeoutSettingsServiceStateProviderMigrator", () => {
  let helper: MockProxy<MigrationHelper>;
  let sut: VaultTimeoutSettingsServiceStateProviderMigrator;

  describe("migrate", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(preMigrationJson(), 58);
      sut = new VaultTimeoutSettingsServiceStateProviderMigrator(58, 59);
    });

    it("should remove state service data from all accounts that have it", async () => {
      await sut.migrate(helper);

      // Global data
      expect(helper.set).toHaveBeenCalledWith("global", {
        // no longer has vault timeout data
        otherStuff: "otherStuff",
      });

      // User data
      expect(helper.set).toHaveBeenCalledWith("user1", {
        settings: {
          otherStuff: "otherStuff",
        },
        otherStuff: "otherStuff",
      });

      expect(helper.set).toHaveBeenCalledWith("user2", {
        settings: {
          otherStuff: "overStuff",
        },
        otherStuff: "otherStuff",
      });

      expect(helper.set).toHaveBeenCalledWith("user3", {
        settings: {
          otherStuff: "overStuff",
        },
        otherStuff: "otherStuff",
      });

      expect(helper.set).toHaveBeenCalledWith("user4", {
        settings: {
          otherStuff: "overStuff",
        },
        otherStuff: "otherStuff",
      });

      expect(helper.set).toHaveBeenCalledWith("user5", {
        settings: {
          otherStuff: "overStuff",
        },
        otherStuff: "otherStuff",
      });

      expect(helper.set).toHaveBeenCalledWith("user6", {
        settings: {
          otherStuff: "overStuff",
        },
        otherStuff: "otherStuff",
      });

      expect(helper.set).toHaveBeenCalledTimes(7); // 6 users + 1 global
      expect(helper.set).not.toHaveBeenCalledWith("user7", any());
    });

    it("should migrate data to state providers for defined accounts that have the data", async () => {
      await sut.migrate(helper);

      expect(helper.setToUser).toHaveBeenCalledWith("user1", VAULT_TIMEOUT, 30);
      expect(helper.setToUser).toHaveBeenCalledWith("user1", VAULT_TIMEOUT_ACTION, "lock");

      expect(helper.setToUser).toHaveBeenCalledWith("user2", VAULT_TIMEOUT, "never");
      expect(helper.setToUser).toHaveBeenCalledWith("user2", VAULT_TIMEOUT_ACTION, "logOut");

      expect(helper.setToUser).toHaveBeenCalledWith("user3", VAULT_TIMEOUT, "onRestart");
      expect(helper.setToUser).toHaveBeenCalledWith("user3", VAULT_TIMEOUT_ACTION, "lock");

      expect(helper.setToUser).toHaveBeenCalledWith("user4", VAULT_TIMEOUT, "onLocked");
      expect(helper.setToUser).toHaveBeenCalledWith("user4", VAULT_TIMEOUT_ACTION, "logOut");

      expect(helper.setToUser).toHaveBeenCalledWith("user5", VAULT_TIMEOUT, "onSleep");
      expect(helper.setToUser).toHaveBeenCalledWith("user5", VAULT_TIMEOUT_ACTION, "lock");

      expect(helper.setToUser).toHaveBeenCalledWith("user6", VAULT_TIMEOUT, "onIdle");
      expect(helper.setToUser).toHaveBeenCalledWith("user6", VAULT_TIMEOUT_ACTION, "logOut");

      // Expect that we didn't migrate anything to user 7 or 8
      expect(helper.setToUser).not.toHaveBeenCalledWith("user7", VAULT_TIMEOUT, any());
      expect(helper.setToUser).not.toHaveBeenCalledWith("user7", VAULT_TIMEOUT_ACTION, any());
      expect(helper.setToUser).not.toHaveBeenCalledWith("user8", VAULT_TIMEOUT, any());
      expect(helper.setToUser).not.toHaveBeenCalledWith("user8", VAULT_TIMEOUT_ACTION, any());
    });
  });

  describe("rollback", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(rollbackJSON(), 59);
      sut = new VaultTimeoutSettingsServiceStateProviderMigrator(58, 59);
    });

    it("should null out newly migrated entries in state provider framework", async () => {
      await sut.rollback(helper);

      expect(helper.setToUser).toHaveBeenCalledWith("user1", VAULT_TIMEOUT, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user1", VAULT_TIMEOUT_ACTION, null);

      expect(helper.setToUser).toHaveBeenCalledWith("user2", VAULT_TIMEOUT, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user2", VAULT_TIMEOUT_ACTION, null);

      expect(helper.setToUser).toHaveBeenCalledWith("user3", VAULT_TIMEOUT, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user3", VAULT_TIMEOUT_ACTION, null);

      expect(helper.setToUser).toHaveBeenCalledWith("user4", VAULT_TIMEOUT, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user4", VAULT_TIMEOUT_ACTION, null);

      expect(helper.setToUser).toHaveBeenCalledWith("user5", VAULT_TIMEOUT, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user5", VAULT_TIMEOUT_ACTION, null);

      expect(helper.setToUser).toHaveBeenCalledWith("user6", VAULT_TIMEOUT, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user6", VAULT_TIMEOUT_ACTION, null);

      expect(helper.setToUser).toHaveBeenCalledWith("user7", VAULT_TIMEOUT, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user7", VAULT_TIMEOUT_ACTION, null);
    });

    it("should add back data to all accounts that had migrated data (only user 1)", async () => {
      await sut.rollback(helper);

      expect(helper.set).toHaveBeenCalledWith("user1", {
        settings: {
          vaultTimeout: 30,
          vaultTimeoutAction: "lock",
          otherStuff: "otherStuff",
        },
        otherStuff: "otherStuff",
      });

      // expect(helper.set).toHaveBeenCalledWith("user2", {
      //   settings: {
      //     vaultTimeout: null as any,
      //     vaultTimeoutAction: "logOut",
      //     otherStuff: "overStuff",
      //   },
      //   otherStuff: "otherStuff",
      // });
    });

    it("should not add back the global vault timeout data", async () => {
      await sut.rollback(helper);

      expect(helper.set).not.toHaveBeenCalledWith("global", any());
    });

    it("should not add data back if data wasn't migrated or acct doesn't exist", async () => {
      await sut.rollback(helper);

      // no data to add back for user3 (acct exists but no migrated data) and user4 (no acct)
      expect(helper.set).not.toHaveBeenCalledWith("user3", any());
      expect(helper.set).not.toHaveBeenCalledWith("user4", any());
    });
  });
});
