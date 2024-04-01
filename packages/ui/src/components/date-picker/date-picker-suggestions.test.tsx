import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DatePickerSuggestions from "./date-picker-suggestions";

describe("Date Input", () => {
  beforeEach(() => {
    render(<DatePickerSuggestions onSuggestionChange={(value) => console.log(value)} />);
  });

  test("renders radio group and all it's options", () => {
    expect(screen.getByLabelText("Past 1 Year"));
    expect(screen.getByLabelText("Year to Date"));
    expect(screen.getByLabelText("3 Months"));
    expect(screen.getByLabelText("1 Month"));
    expect(screen.queryByLabelText("It's over 9000")).not.toBeInTheDocument();
  });
});
