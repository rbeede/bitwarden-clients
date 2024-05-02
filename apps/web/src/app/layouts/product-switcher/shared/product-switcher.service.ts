import { Injectable } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { combineLatest, concatMap, map, Observable } from "rxjs";

import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import {
  canAccessOrgAdmin,
  OrganizationService,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { ProviderService } from "@bitwarden/common/admin-console/abstractions/provider.service";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";

export type ProductSwitcherItem = {
  /**
   * Displayed name
   */
  name: string;

  /**
   * Displayed icon
   */
  icon: string;

  /**
   * Route for items in the `bentoProducts$` section
   */
  appRoute?: string | any[];

  /**
   * Route for items in the `otherProducts$` section
   */
  marketingRoute?: string | any[];

  /**
   * Used to apply css styles to show when a button is selected
   */
  isActive?: boolean;

  /**
   * A product switcher item can be shown in the left navigation menu.
   * When shown under the "other" section the content can be overridden.
   */
  otherProductOverrides?: {
    /** Alternative navigation menu name */
    name?: string;
    /** Supporting text that is shown when the product is rendered in the "other" section */
    supportingText?: string;
  };
};

@Injectable({
  providedIn: "root",
})
export class ProductSwitcherService {
  constructor(
    private organizationService: OrganizationService,
    private providerService: ProviderService,
    private route: ActivatedRoute,
    private router: Router,
    private i18n: I18nPipe,
  ) {}

  products$: Observable<{
    bento: ProductSwitcherItem[];
    other: ProductSwitcherItem[];
  }> = combineLatest([this.organizationService.organizations$, this.route.paramMap]).pipe(
    map(([orgs, paramMap]): [Organization[], ParamMap] => {
      return [
        // Sort orgs by name to match the order within the sidebar
        orgs.sort((a, b) => a.name.localeCompare(b.name)),
        paramMap,
      ];
    }),
    concatMap(async ([orgs, paramMap]) => {
      const routeOrg = orgs.find((o) => o.id === paramMap.get("organizationId"));

      // If the active route org doesn't have access to SM, find the first org that does.
      const smOrg =
        routeOrg?.canAccessSecretsManager && routeOrg?.enabled == true
          ? routeOrg
          : orgs.find((o) => o.canAccessSecretsManager && o.enabled == true);

      // If the active route org doesn't have access to AC, find the first org that does.
      const acOrg =
        routeOrg != null && canAccessOrgAdmin(routeOrg)
          ? routeOrg
          : orgs.find((o) => canAccessOrgAdmin(o));

      // TODO: This should be migrated to an Observable provided by the provider service and moved to the combineLatest above. See AC-2092.
      const providers = await this.providerService.getAll();

      const products = {
        pm: {
          name: "Password Manager",
          icon: "bwi-lock",
          appRoute: "/vault",
          marketingRoute: "https://bitwarden.com/products/personal/",
          isActive:
            !this.router.url.includes("/sm/") &&
            !this.router.url.includes("/organizations/") &&
            !this.router.url.includes("/providers/"),
        },
        sm: {
          name: "Secrets Manager",
          icon: "bwi-cli",
          appRoute: ["/sm", smOrg?.id],
          marketingRoute: "https://bitwarden.com/products/secrets-manager/",
          isActive: this.router.url.includes("/sm/"),
          otherProductOverrides: {
            supportingText: this.i18n.transform("secureYourInfrastructure"),
          },
        },
        ac: {
          name: "Admin Console",
          icon: "bwi-business",
          appRoute: ["/organizations", acOrg?.id],
          marketingRoute: "https://bitwarden.com/products/business/",
          isActive: this.router.url.includes("/organizations/"),
        },
        provider: {
          name: "Provider Portal",
          icon: "bwi-provider",
          appRoute: ["/providers", providers[0]?.id],
          isActive: this.router.url.includes("/providers/"),
        },
        orgs: {
          name: "Organizations",
          icon: "bwi-business",
          marketingRoute: "https://bitwarden.com/products/business/",
          otherProductOverrides: {
            name: "Share your passwords",
            supportingText: this.i18n.transform("protectYourFamilyOrBusiness"),
          },
        },
      } satisfies Record<string, ProductSwitcherItem>;

      const bento: ProductSwitcherItem[] = [products.pm];
      const other: ProductSwitcherItem[] = [];

      if (smOrg) {
        bento.push(products.sm);
      } else {
        other.push(products.sm);
      }

      if (acOrg) {
        bento.push(products.ac);
      } else {
        other.push(products.orgs);
      }

      if (providers.length > 0) {
        bento.push(products.provider);
      }

      return {
        bento,
        other,
      };
    }),
  );
}
