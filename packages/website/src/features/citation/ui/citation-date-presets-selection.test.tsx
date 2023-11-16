import { RelativeDatePresets } from "@/shared/lib/constants/date";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CitationDatePresetsSelection from "./citation-date-presets-selection";

describe("Citation Date Presets Selection", () => {
  const options = Object.values(RelativeDatePresets);
  beforeEach(() => {
    render(<CitationDatePresetsSelection onSelect={() => {}} />);
  });

  test("renders citation data categories with initial placeholder text", async () => {
    const user = userEvent.setup();
    expect(screen.getByText(options[0]));
  });

  test("Allows user to change the current citation data category", async () => {
    const user = userEvent.setup();

    expect(screen.queryByText("Total $ Fine Amount")).toBe(null);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText(options[1]));
    expect(screen.getByText(options[1])).toBeInTheDocument();
  });
});
