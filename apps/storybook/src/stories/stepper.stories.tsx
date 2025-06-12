import { Meta, StoryObj } from "@storybook/react";
import { StepperContainer, StepperItem } from "@lucky-parking/ui/stepper";

const meta: Meta<typeof StepperContainer> = {
  title: "Components/Stepper",
  component: StepperContainer,
};

type Stories = StoryObj<typeof StepperContainer>;

export const Basic: Stories = {
  render: () => (
    <div className="w-[500px]">
      <StepperContainer currentStep={1}>
        <StepperItem title="Hey, I just met you, and this is crazy" isFinished={true}>
          <div>uh....</div>
        </StepperItem>

        <StepperItem title="But here's my number, so call me, maybe" isFinished={false}>
          <div className="h-[200px]">
            <div>Hello World</div>
            <div>Hello World</div>
            <div>Hello World</div>
            <div>Hello World</div>
            <div>Hello World</div>
          </div>
        </StepperItem>
        <StepperItem title="The End">
          <div>...</div>
        </StepperItem>
      </StepperContainer>
    </div>
  ),
};

export default meta;
