import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AnonLayoutComponent } from "./anon-layout.component";

@Component({
  standalone: true,
  templateUrl: "anon-layout-wrapper.component.html",
  imports: [AnonLayoutComponent, RouterModule],
})
export class AnonLayoutWrapperComponent implements OnInit, OnDestroy {
  async ngOnInit() {
    document.body.classList.add("layout_frontend");
  }
  ngOnDestroy() {
    document.body.classList.remove("layout_frontend");
  }
}
