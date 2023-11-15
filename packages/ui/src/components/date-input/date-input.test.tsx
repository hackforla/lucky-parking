import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateInput from "./date-input";

describe("Default Date Input and click input trigger", () => {
  const user = userEvent.setup();
  beforeEach(async () => {
    render(
      <div>
        <DateInput>From</DateInput>
        <button data-testid="outside-event-listener">Exit calendar</button>
      </div>,
    );
    const openCalendar = screen.getByTestId("date-input-trigger");
    await user.click(openCalendar);
  });

  test("renders Calendar component", () => {
    expect(screen.getByTestId("calendar-input")).toBeInTheDocument();
  });
  test("clicking outside of calendar closes calendar", async () => {
    const exitCalendar = screen.getByTestId("outside-event-listener");
    await user.click(exitCalendar);
    expect(screen.queryByTestId("calendar-input")).not.toBeInTheDocument();
  });
});
