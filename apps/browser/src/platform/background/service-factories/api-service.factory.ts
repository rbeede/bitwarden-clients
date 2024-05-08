import { LogoutReason } from "@bitwarden/auth/common";
import { ApiService as AbstractApiService } from "@bitwarden/common/abstractions/api.service";
import { ApiService } from "@bitwarden/common/services/api.service";

import {
  tokenServiceFactory,
  TokenServiceInitOptions,
} from "../../../auth/background/service-factories/token-service.factory";
import {
  CachedServices,
  factory,
  FactoryOptions,
} from "../../background/service-factories/factory-options";

import { AppIdServiceInitOptions, appIdServiceFactory } from "./app-id-service.factory";
import {
  environmentServiceFactory,
  EnvironmentServiceInitOptions,
} from "./environment-service.factory";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  PlatformUtilsServiceInitOptions,
  platformUtilsServiceFactory,
} from "./platform-utils-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type ApiServiceFactoryOptions = FactoryOptions & {
  apiServiceOptions: {
    refreshAccessTokenErrorCallback?: () => Promise<void>;
    logoutCallback: (logoutReason: LogoutReason) => Promise<void>;
    customUserAgent?: string;
  };
};

export type ApiServiceInitOptions = ApiServiceFactoryOptions &
  TokenServiceInitOptions &
  PlatformUtilsServiceInitOptions &
  EnvironmentServiceInitOptions &
  AppIdServiceInitOptions &
  StateServiceInitOptions &
  LogServiceInitOptions;

export function apiServiceFactory(
  cache: { apiService?: AbstractApiService } & CachedServices,
  opts: ApiServiceInitOptions,
): Promise<AbstractApiService> {
  return factory(
    cache,
    "apiService",
    opts,
    async () =>
      new ApiService(
        await tokenServiceFactory(cache, opts),
        await platformUtilsServiceFactory(cache, opts),
        await environmentServiceFactory(cache, opts),
        await appIdServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts),
        opts.apiServiceOptions.refreshAccessTokenErrorCallback ??
          (() => {
            return Promise.reject("No callback");
          }),
        await logServiceFactory(cache, opts),
        opts.apiServiceOptions.logoutCallback,
        opts.apiServiceOptions.customUserAgent,
      ),
  );
}
