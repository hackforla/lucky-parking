import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { StepperContainer } from "./stepper-container";
import { StepperItem } from "./stepper-item";

describe("Renders Step Component", () => {
  beforeEach(async () => {
    render(
      <StepperContainer currentStep={1}>
        <StepperItem title="Hey, I just met you, and this is crazy" isFinished={true}>
          <div>uh...</div>
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
      </StepperContainer>,
    );
  });

  test("renders check icon", () => {
    expect(screen.getByTestId("CheckIcon")).toBeInTheDocument();
  });

  test("renders 1 finished circle", () => {
    expect(screen.getAllByLabelText("finished"));
  });

  test("renders 1 inProgress circle", () => {
    expect(screen.getAllByLabelText("inProgress"));
  });

  test("renders 1 incomplete circle", () => {
    expect(screen.getAllByLabelText("incomplete"));
  });

  test("renders first Step title", () => {
    expect(screen.getByText("Hey, I just met you, and this is crazy")).toBeInTheDocument();
  });

  test("renders first content text", () => {
    expect(screen.getByText("uh...")).toBeInTheDocument();
  });
});
