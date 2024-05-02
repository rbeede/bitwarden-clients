import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";

import { ChipComponent } from "./chip.component";

export default {
  title: "Component Library/Chip",
  component: ChipComponent,
  decorators: [
    moduleMetadata({
      imports: [],
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
      </bit-chip>

      <bit-chip selected>
        <i class="bwi bwi-folder" aria-hidden="true" slot="start"></i>
        Label
      </bit-chip>
    `,
  }),
};
