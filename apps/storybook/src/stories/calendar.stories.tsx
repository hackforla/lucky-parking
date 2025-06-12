import { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@lucky-parking/ui/calendar";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
};

type CalendarStory = StoryObj<typeof Calendar>;

export const Primary: CalendarStory = {
  render: (args) => <Calendar {...args} />,
  args: {
    initDate: new Date(2024, 0, 1),
    onSelectValueChange: (value) => console.log(value),
  },
};

export default meta;
