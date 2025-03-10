import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DatePicker } from "./date-picker";
import userEvent from "@testing-library/user-event";

describe("Date Input", () => {
  beforeEach(() => {
    render(
      <DatePicker key="date-picker-init-test" onDateRangeValueChange={(value) => console.log(JSON.stringify(value))} />,
    );
  });

  test("renders DateRangeIcon", () => {
    expect(screen.getByTestId("DateRangeIcon")).toBeInTheDocument();
  });

  test("renders start date text", () => {
    expect(screen.getByText("start date")).toBeInTheDocument();
  });
  -test("renders ChevronRightIcon", () => {
    expect(screen.getByTestId("ChevronRightIcon")).toBeInTheDocument();
  });

  test("renders end date text", () => {
    expect(screen.getByText("end date")).toBeInTheDocument();
  });
});

describe("Date Input's Modal", () => {
  const user = userEvent.setup();
  beforeEach(async () => {
    render(
      <DatePicker
        key="date-picker-modal-test"
        onDateRangeValueChange={(value) => console.log(JSON.stringify(value))}
      />,
    );

    const dateRangeModalTrigger = screen.getByLabelText("open-date-range-modal");
    await user.click(dateRangeModalTrigger);
  });

  test("renders date-range-picker trigger button", () => {
    expect(screen.getByLabelText("open-date-range-modal")).toBeInTheDocument();
  });

  test("renders Exact button", async () => {
    expect(screen.getByRole("button", { name: /Exact/i })).toBeInTheDocument();
  });

  test("renders Suggestions button", () => {
    expect(screen.getByRole("button", { name: /Suggestions/i })).toBeInTheDocument();
  });

  test("renders Reset button", () => {
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  test("renders Clear button", () => {
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  test("renders Apply button", () => {
    expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
  });

  test("renders Start Date Label Text", () => {
    expect(screen.getByText("Start Date")).toBeInTheDocument();
  });

  test("renders End Date Label Text", () => {
    expect(screen.getByText("End Date")).toBeInTheDocument();
  });
});
