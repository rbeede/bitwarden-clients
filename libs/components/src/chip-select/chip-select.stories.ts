import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { MenuModule } from "../menu";

import { ChipComponent } from "./chip-select.component";

export default {
  title: "Component Library/Chip",
  component: ChipComponent,
  decorators: [
    moduleMetadata({
      imports: [MenuModule],
      providers: [],
    }),
  ],
} as Meta;

type Story = StoryObj<ChipComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: /* html */ `
      <bit-chip>
        <i class="bwi bwi-folder" aria-hidden="true" slot="start"></i>
        Label
        <ng-container slot="menuItems">
          <a href="#" bitMenuItem>Anchor link</a>
          <a href="#" bitMenuItem>Another link</a>
        </ng-container>
      </bit-chip>

      <bit-chip selected>
        <i class="bwi bwi-folder" aria-hidden="true" slot="start"></i>
        Label
        <ng-container slot="menuItems">
          <a href="#" bitMenuItem>Anchor link</a>
          <a href="#" bitMenuItem>Another link</a>
        </ng-container>
      </bit-chip>
    `,
  }),
};
