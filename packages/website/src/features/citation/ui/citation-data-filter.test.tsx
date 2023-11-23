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

describe("Citation-data-filter interactions", () => {
  const onCategorySelectMock = jest.fn();
  const onDatePresetSelectMock = jest.fn();
  beforeEach(async () => {
    const user = userEvent.setup();
    render(<CitationDataFilter onCategorySelect={onCategorySelectMock} onDatePresetSelect={onDatePresetSelectMock} />);

    await user.click(screen.getByRole("combobox", { name: "citation-data-categories" }));
    await user.click(screen.getByRole("option", { name: "Violation Type" }));

    await user.click(screen.getByRole("combobox", { name: "citation-date-presets" }));
    await user.click(screen.getByRole("option", { name: "Year to Date" }));
  });

  test("should not render with default options", () => {
    expect(screen.queryByText("Total # Citations")).toBe(null);
    expect(screen.queryByText("Past 1 Year")).toBe(null);
  });

  test("should render with selected options", async () => {
    expect(screen.getByText("Violation Type"));
    expect(screen.getByText("Year to Date"));
  });

  test("should return selected options", async () => {
    expect(onCategorySelectMock).toHaveBeenCalledWith("Violation Type");
    expect(onDatePresetSelectMock).toHaveBeenCalledWith("Year to Date");
  });
});
