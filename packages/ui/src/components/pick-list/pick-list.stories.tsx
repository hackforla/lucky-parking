import { Meta, StoryObj } from "@storybook/react";
import PickList from "./pick-list";
import { LIST_OPTIONS } from "./pick-list-test-data";

const meta: Meta<typeof PickList> = {
  title: "Components/Pick List",
  component: PickList,
};

type Stories = StoryObj<typeof PickList>;

export const widthFillToParentContainer: Stories = {
  args: {
    id: "year",
    onChange: (val: any) => console.log(val),
    options: LIST_OPTIONS,
    placeholder: "Select a Car",
  },
  render: (args) => (
    <div className="w-[500px]">
      <PickList {...args} />
    </div>
  ),
};

export const customWidth: Stories = {
  args: {
    id: "year",
    onChange: (val: any) => console.log(val),
    options: LIST_OPTIONS,
    placeholder: "Select a Car",
  },
  render: (args) => <PickList className="w-[250px]" {...args} />,
};

export default meta;
