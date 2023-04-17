import _ from "lodash";
import type { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonSize, ButtonVariant } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    children: {
      control: "text",
    },
    isDisabled: {
      control: "boolean",
    },
    size: {
      options: _.keys(ButtonSize),
      control: { type: "radio" },
    },
    variant: {
      options: _.keys(ButtonVariant),
      control: { type: "radio" },
    },
  },
};

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: (args) => <Button {...args} />,
  args: {
    children: "BUTTON",
    isDisabled: false,
    size: ButtonSize.small,
    variant: ButtonVariant.primary,
  },
};

export default meta;
