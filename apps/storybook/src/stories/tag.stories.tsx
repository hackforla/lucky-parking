import _ from "lodash";
import type { Meta, StoryObj } from "@storybook/react";
import { Tag, TagColor } from "@lucky-parking/ui/tag";

const meta: Meta<typeof Tag> = {
  title: "Components/Tag",
  component: Tag,
  argTypes: {
    children: {
      name: "text",
      control: "text",
    },
    color: {
      control: "select",
      options: _.keys(TagColor),
    },
  },
};

type TagStory = StoryObj<typeof Tag>;

export const Default: TagStory = {
  render: (args) => <Tag {...args} />,
  args: {
    children: "Place (Radius)",
    color: TagColor.black,
  },
};

export default meta;
