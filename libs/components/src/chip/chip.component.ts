import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import { ButtonModule } from "../button";
import { IconButtonModule } from "../icon-button";

@Component({
  selector: "bit-chip",
  templateUrl: "chip.template.html",
  standalone: true,
  imports: [CommonModule, ButtonModule, IconButtonModule],
})
export class ChipComponent {
  @Input()
  get selected() {
    return this._selected;
  }
  set selected(value: BooleanInput) {
    this._selected = coerceBooleanProperty(value);
  }

  private _selected = false;
}
