import { Meta, StoryObj } from "@storybook/react";
import DatePicker from "./date-picker";

const meta: Meta<typeof DatePicker> = {
  title: "Components/Date Picker",
  component: DatePicker,
};

type DatePickerStory = StoryObj<typeof DatePicker>;

export const Default: DatePickerStory = {
  render: (args) => <DatePicker {...args} />,
  args: {
    //todo
  },
};

export default meta;
