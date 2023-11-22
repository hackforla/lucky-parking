import { Meta, StoryObj } from "@storybook/react";
import RadioGroup from "./radio-group";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/Radio-Group",
  component: RadioGroup,
  argTypes: {
    options: {
      controls: "object",
    },
    onChange: { action: "clicked" },
  },
};

type radioGroupStory = StoryObj<typeof RadioGroup>;

export const Default: radioGroupStory = {
  render: (args: any) => <RadioGroup {...args} />,
  args: {
    name: "rick-roll",
    options: ["Never", "Gonna", "Give", "You", "Up"],
  },
};

export default meta;
