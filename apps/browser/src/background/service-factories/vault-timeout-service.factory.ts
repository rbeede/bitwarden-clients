import { LogoutReason } from "@bitwarden/auth/common";
import { VaultTimeoutService as AbstractVaultTimeoutService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout.service";

import {
  accountServiceFactory,
  AccountServiceInitOptions,
} from "../../auth/background/service-factories/account-service.factory";
import {
  authServiceFactory,
  AuthServiceInitOptions,
} from "../../auth/background/service-factories/auth-service.factory";
import {
  internalMasterPasswordServiceFactory,
  MasterPasswordServiceInitOptions,
} from "../../auth/background/service-factories/master-password-service.factory";
import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../platform/background/service-factories/factory-options";
import {
  messagingServiceFactory,
  MessagingServiceInitOptions,
} from "../../platform/background/service-factories/messaging-service.factory";
import {
  platformUtilsServiceFactory,
  PlatformUtilsServiceInitOptions,
} from "../../platform/background/service-factories/platform-utils-service.factory";
import {
  stateEventRunnerServiceFactory,
  StateEventRunnerServiceInitOptions,
} from "../../platform/background/service-factories/state-event-runner-service.factory";
import {
  StateServiceInitOptions,
  stateServiceFactory,
} from "../../platform/background/service-factories/state-service.factory";
import VaultTimeoutService from "../../services/vault-timeout/vault-timeout.service";
import {
  cipherServiceFactory,
  CipherServiceInitOptions,
} from "../../vault/background/service_factories/cipher-service.factory";
import {
  collectionServiceFactory,
  CollectionServiceInitOptions,
} from "../../vault/background/service_factories/collection-service.factory";
import {
  folderServiceFactory,
  FolderServiceInitOptions,
} from "../../vault/background/service_factories/folder-service.factory";

import { searchServiceFactory, SearchServiceInitOptions } from "./search-service.factory";
import {
  vaultTimeoutSettingsServiceFactory,
  VaultTimeoutSettingsServiceInitOptions,
} from "./vault-timeout-settings-service.factory";

type VaultTimeoutServiceFactoryOptions = FactoryOptions & {
  vaultTimeoutServiceOptions: {
    lockedCallback: (userId?: string) => Promise<void>;
    loggedOutCallback: (logoutReason: LogoutReason, userId?: string) => Promise<void>;
  };
};

export type VaultTimeoutServiceInitOptions = VaultTimeoutServiceFactoryOptions &
  AccountServiceInitOptions &
  MasterPasswordServiceInitOptions &
  CipherServiceInitOptions &
  FolderServiceInitOptions &
  CollectionServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  MessagingServiceInitOptions &
  SearchServiceInitOptions &
  StateServiceInitOptions &
  AuthServiceInitOptions &
  VaultTimeoutSettingsServiceInitOptions &
  StateEventRunnerServiceInitOptions;

export function vaultTimeoutServiceFactory(
  cache: { vaultTimeoutService?: AbstractVaultTimeoutService } & CachedServices,
  opts: VaultTimeoutServiceInitOptions,
): Promise<AbstractVaultTimeoutService> {
  return factory(
    cache,
    "vaultTimeoutService",
    opts,
    async () =>
      new VaultTimeoutService(
        await accountServiceFactory(cache, opts),
        await internalMasterPasswordServiceFactory(cache, opts),
        await cipherServiceFactory(cache, opts),
        await folderServiceFactory(cache, opts),
        await collectionServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await messagingServiceFactory(cache, opts),
        await searchServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        await authServiceFactory(cache, opts),
        await vaultTimeoutSettingsServiceFactory(cache, opts),
        await stateEventRunnerServiceFactory(cache, opts),
        opts.vaultTimeoutServiceOptions.lockedCallback,
        opts.vaultTimeoutServiceOptions.loggedOutCallback,
      ),
  );
}
