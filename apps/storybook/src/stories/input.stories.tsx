import { Meta, StoryObj } from "@storybook/react";
import { Input } from "@lucky-parking/ui/input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
};

type Stories = StoryObj<typeof Input>;

export const Default: Stories = {
  args: {
    id: "input-test",
    type: "text",
    className: "w-[120px]",
    value: "Stop! In the name of the Law",
    onChange: (value) => console.log(value),
  },
  render: (args) => {
    return (
      <div className="w-[500px]">
        <Input {...args} />
      </div>
    );
  },
};

export default meta;
