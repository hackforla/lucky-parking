import _ from "lodash";
import type { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonSize, ButtonVariant } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    children: {
      name: "text",
      control: "text",
    },
    isDisabled: {
      name: "is disabled",
      control: "boolean",
    },
    size: {
      options: _.keys(ButtonSize),
      control: { type: "radio" },
    },
    variant: {
      table: { disable: true },
      options: _.keys(ButtonVariant),
      control: { type: "radio", disable: true },
    },
  },
};

type ButtonStory = StoryObj<typeof Button>;

export const Primary: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: "BUTTON",
    isDisabled: false,
    size: ButtonSize.small,
    variant: ButtonVariant.primary,
  },
};

export const Secondary: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: "BUTTON",
    isDisabled: false,
    size: ButtonSize.small,
    variant: ButtonVariant.secondary,
  },
};

export const Outline: ButtonStory = {
  render: (args) => <Button {...args} />,
  args: {
    children: "BUTTON",
    isDisabled: false,
    size: ButtonSize.small,
    variant: ButtonVariant.outline,
  },
};

export default meta;
