import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { Icon } from "../../../../components/src/icon";
import { IconLock } from "../../icons/icon-lock";

import { AnonLayoutComponent } from "./anon-layout.component";

export type IconType = "lock"; // add more options as we use more icons

@Component({
  standalone: true,
  templateUrl: "anon-layout-wrapper.component.html",
  imports: [AnonLayoutComponent, RouterModule],
})
export class AnonLayoutWrapperComponent implements OnInit, OnDestroy {
  protected pageTitle: string;
  protected pageSubtitle: string;
  protected pageIcon: IconType;

  protected icon: Icon;

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
  ) {
    this.pageTitle = this.i18nService.t(this.route.snapshot.firstChild.data["pageTitle"]);
    this.pageSubtitle = this.i18nService.t(this.route.snapshot.firstChild.data["pageSubtitle"]);

    this.pageIcon = this.route.snapshot.firstChild.data["pageIcon"]; // don't translate
  }

  ngOnInit() {
    document.body.classList.add("layout_frontend");

    switch (this.pageIcon) {
      case "lock":
        this.icon = IconLock;
        break;
      default:
        this.icon = null;
    }
  }

  ngOnDestroy() {
    document.body.classList.remove("layout_frontend");
  }
}
