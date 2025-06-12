import { Meta, StoryObj } from "@storybook/react";
import { HorizontalBarGraph, payload } from "@lucky-parking/ui/graphs";

interface Citation {
  _id: string;
  agency: string;
  agency_desc: string;
  body_style: string;
  body_style_desc: string;
  color: string;
  color_desc: string;
  fine_amount: string;
  issue_date: string;
  issue_time: string;
  latitude: string;
  location: string;
  longitude: string;
  make: string;
  marked_time: string;
  plate_expiry_date: string;
  rp_state_plate: string;
  ticket_number: string;
  violation_code: string;
  violation_description: string;
  route: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
}

interface BarGrpahArgs {
  category: string;
  payload: { data: Citation[] };
}

const meta: Meta<typeof HorizontalBarGraph> = {
  title: "Components/Graphs",
  component: HorizontalBarGraph,
};

type ResponsiveBarStory = StoryObj<typeof HorizontalBarGraph>;

export const Horizontal_Bar: ResponsiveBarStory = (args: BarGrpahArgs) => {
  const { category, payload } = args;
  return <HorizontalBarGraph category={category} payload={payload} />;
};

Horizontal_Bar.args = {
  category: "Violation Type",
  payload: payload,
};

const categoryOptions = ["Day of the Week", "Violation Type"];

Horizontal_Bar.argTypes = {
  category: {
    control: { type: "select" },
    options: categoryOptions,
  },
};

export default meta;
