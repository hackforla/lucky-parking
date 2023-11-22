import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CitationDataFilter from "./citation-data-filter";

describe("Citation-data-filter rendering", () => {
  beforeEach(() => {
    render(<CitationDataFilter onCategorySelect={() => {}} onDatePresetSelect={() => {}} />);
  });

  test("should redner citation data categories with initial placeholder", async () => {
    expect(screen.getByText("Total # Citations"));
  });

  test("should render citation date presets with initial placeholder", async () => {
    expect(screen.getByText("Past 1 Year"));
  });
  test("should render date inputs with initial placeholders", async () => {
    const fromInput = screen.getByText("From");
    const toInput = screen.getByText("To");

    expect(fromInput).toBeInTheDocument();
    expect(toInput).toBeInTheDocument();

    const fromValue = fromInput.nextElementSibling;
    const toValue = toInput.nextElementSibling;

    expect(fromValue).toHaveTextContent("mm/dd/yy");
    expect(toValue).toHaveTextContent("mm/dd/yy");
  });
});
