import { Meta, StoryObj } from "@storybook/react";
import Calendar from "./calendar";

const meta: Meta<typeof Calendar> = {
 title: "Components/Calendar",
 component: Calendar
}

type CalendarStory = StoryObj<typeof Calendar>;

export const Primary: CalendarStory = {
  render: (args) => <Calendar {...args}/>,
  args : {},
};

export default meta
