import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";

import { AnonLayoutComponent } from "./anon-layout.component";

@Component({
  standalone: true,
  templateUrl: "anon-layout-wrapper.component.html",
  imports: [AnonLayoutComponent, RouterModule],
})
export class AnonLayoutWrapperComponent implements OnInit, OnDestroy {
  pageTitle: string;

  constructor(private route: ActivatedRoute) {
    this.pageTitle = this.route.snapshot.firstChild.data["pageTitle"];
  }

  async ngOnInit() {
    document.body.classList.add("layout_frontend");
  }
  ngOnDestroy() {
    document.body.classList.remove("layout_frontend");
  }
}
