import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CitationDataCategorySelection from "./citation-data-category-selection";

describe("Citation-data-category-selection rendering", () => {
  beforeEach(() => {
    render(<CitationDataCategorySelection onSelect={() => {}} />);
  });

  test("should render citation data categories with initial placeholder", async () => {
    expect(screen.getByText("Total # Citations"));
  });

  test("should render all citation data categories options", async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Total # Citations" }));
    expect(screen.getByRole("option", { name: "Citations per Sq. Mile (Density)" }));
    expect(screen.getByRole("option", { name: "Violation Type" }));
    expect(screen.getByRole("option", { name: "Total $ Fine Amount" }));
    expect(screen.getByRole("option", { name: "Fine $ Amount per Sq. Mile (Density)" }));
    expect(screen.getByRole("option", { name: "Day of the Week" }));
  });
});

describe("Citation-data-category-selection interactions", () => {
  const onSelectMock = jest.fn();
  beforeEach(async () => {
    const user = userEvent.setup();
    render(<CitationDataCategorySelection onSelect={onSelectMock} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Day of the Week" }));
  });

  test("should not render with default option", () => {
    expect(screen.queryByText("Total # Citations")).toBe(null);
  });

  test("should render with selected option", async () => {
    expect(screen.getByText("Day of the Week"));
  });

  test("should return selected option", async () => {
    expect(onSelectMock).toHaveBeenCalledWith("Day of the Week");
  });
});
