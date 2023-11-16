import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CitationDataCategorySelection from "./citation-data-category-selection";
import { CitationDataCategories } from "../lib";

describe("Citation Data Category Selection", () => {
  const options = Object.values(CitationDataCategories);
  beforeEach(() => {
    render(<CitationDataCategorySelection onSelect={() => {}} />);
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
