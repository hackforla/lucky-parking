import { Meta, StoryObj } from "@storybook/react";
import HorizontalBarGraph from "./HorrizontalBarGraph";

const meta: Meta<typeof HorizontalBarGraph> = {
  title: "Components/Graphs",
  component: HorizontalBarGraph,
};

type ResponsiveBarStory = StoryObj<typeof HorizontalBarGraph>;

export const Horrizontal_Bar: ResponsiveBarStory = {
  render: () => <HorizontalBarGraph />,
};

export default meta;
