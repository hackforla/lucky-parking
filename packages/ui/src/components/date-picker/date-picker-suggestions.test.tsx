import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DatePickerSuggestions from "./date-picker-suggestions";

describe("Date Range Suggestions Radio Group", () => {
  beforeEach(() => {
    render(<DatePickerSuggestions onSuggestionChange={(value) => console.log(value)} />);
  });

  test("renders radio group and all it's options", () => {
    expect(screen.getByLabelText("Past 1 Year"));
    expect(screen.getByLabelText("Past 3 Months"));
    expect(screen.getByLabelText("Past 1 Month"));
    expect(screen.getByLabelText("Year to Date"));
    expect(screen.queryByLabelText("It's over 9000")).not.toBeInTheDocument();
  });
});
