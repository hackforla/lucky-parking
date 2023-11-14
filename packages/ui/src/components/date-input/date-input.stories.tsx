import { Meta, StoryObj } from "@storybook/react";
import DateInput from "./date-input";

const meta: Meta<typeof DateInput> = {
  title: "Components/Date Input",
  component: DateInput,
};

type DateInputStory = StoryObj<typeof DateInput>;

export const Default: DateInputStory = {
  render: (args) => <DateInput {...args} />,
  args: {
    children: "From",
  },
};

export default meta;
