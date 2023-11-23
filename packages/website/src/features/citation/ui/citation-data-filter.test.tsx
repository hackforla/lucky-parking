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
    expect(screen.getByLabelText("From")).toHaveTextContent("mm/dd/yy");
    expect(screen.getByLabelText("To")).toHaveTextContent("mm/dd/yy");
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

    await user.click(screen.getByLabelText("From"));
    await user.click(screen.getByRole("combobox", { name: "Month" }));
    await user.click(screen.getByRole("option", { name: "January" }));
    await user.click(screen.getByRole("combobox", { name: "Year" }));
    await user.click(screen.getByRole("option", { name: "2020" }));
    await user.click(screen.getByText("25"));

    await user.click(screen.getByLabelText("To"));
    await user.click(screen.getByRole("combobox", { name: "Month" }));
    await user.click(screen.getByRole("option", { name: "February" }));
    await user.click(screen.getByRole("combobox", { name: "Year" }));
    await user.click(screen.getByRole("option", { name: "2023" }));
    await user.click(screen.getByText("27"));
  });

  test("should not render with default options", () => {
    expect(screen.queryByText("Total # Citations")).toBe(null);
    expect(screen.queryByText("Past 1 Year")).toBe(null);
    expect(screen.queryByText("mm/dd/yy")).toBe(null);
  });

  test("should render with selected options", async () => {
    expect(screen.getByText("Violation Type"));
    expect(screen.getByText("Year to Date"));
    expect(screen.getByText("01/25/2020"));
    expect(screen.getByText("02/27/2023"));
  });

  test("should return selected options", async () => {
    expect(onCategorySelectMock).toHaveBeenCalledWith("Violation Type");
    expect(onDatePresetSelectMock).toHaveBeenCalledWith("Year to Date");
  });
});
