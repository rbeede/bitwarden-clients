import { Component, HostBinding } from "@angular/core";
import { map, Observable } from "rxjs";

import { ProductSwitcherItem, ProductSwitcherService } from "../shared/product-switcher.service";

@Component({
  selector: "navigation-product-switcher",
  templateUrl: "./navigation-switcher.component.html",
})
export class NavigationProductSwitcherComponent {
  // Use margin-top: auto to push the component to the bottom of the parent flex container
  @HostBinding("style.margin-top") marginTop = "auto";

  constructor(private productSwitcherService: ProductSwitcherService) {}

  accessibleProducts$: Observable<ProductSwitcherItem[]> =
    this.productSwitcherService.products$.pipe(
      map((products) => (products.bento ?? []).filter((item) => !item.isActive)),
    );

  moreProducts$: Observable<ProductSwitcherItem[]> = this.productSwitcherService.products$.pipe(
    map((products) => (products.other ?? []).filter((item) => !item.isActive)),
  );
}
