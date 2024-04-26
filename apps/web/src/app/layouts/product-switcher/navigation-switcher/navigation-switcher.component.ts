import { Component } from "@angular/core";
import { map, Observable } from "rxjs";

import { ProductSwitcherItem, ProductSwitcherService } from "../shared/product-switcher.service";

@Component({
  selector: "navigation-product-switcher",
  templateUrl: "./navigation-switcher.component.html",
})
export class NavigationProductSwitcherComponent {
  constructor(private productSwitcherService: ProductSwitcherService) {}

  protected readonly accessibleProducts$: Observable<ProductSwitcherItem[]> =
    this.productSwitcherService.products$.pipe(
      map((products) => (products.bento ?? []).filter((item) => !item.isActive)),
    );

  protected readonly moreProducts$: Observable<ProductSwitcherItem[]> =
    this.productSwitcherService.products$.pipe(
      map((products) => (products.other ?? []).filter((item) => !item.isActive)),
    );
}
