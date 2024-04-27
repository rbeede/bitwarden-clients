import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { AnonLayoutComponent, IconType } from "./anon-layout.component";

@Component({
  standalone: true,
  templateUrl: "anon-layout-wrapper.component.html",
  imports: [AnonLayoutComponent, RouterModule],
})
export class AnonLayoutWrapperComponent implements OnInit, OnDestroy {
  protected pageTitle: string;
  protected pageSubtitle: string;
  protected pageIcon: IconType;

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
  ) {
    this.pageTitle = this.i18nService.t(this.route.snapshot.firstChild.data["pageTitle"]);
    this.pageSubtitle = this.i18nService.t(this.route.snapshot.firstChild.data["pageSubtitle"]);
    this.pageIcon = this.route.snapshot.firstChild.data["pageIcon"];
  }

  ngOnInit() {
    document.body.classList.add("layout_frontend");
  }

  ngOnDestroy() {
    document.body.classList.remove("layout_frontend");
  }
}
