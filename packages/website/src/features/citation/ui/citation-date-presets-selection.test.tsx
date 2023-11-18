import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CitationDatePresetsSelection from "./citation-date-presets-selection";

describe("Citation-date-presets-selection rendering", () => {
  beforeEach(() => {
    render(<CitationDatePresetsSelection onSelect={() => {}} />);
  });

  test("should render citation date presets with initial placeholder", async () => {
    expect(screen.getByText("Past 1 Year"));
  });

  test("should render all citation date presets options", async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Past 1 Year" }));
    expect(screen.getByRole("option", { name: "Year to Date" }));
    expect(screen.getByRole("option", { name: "3 Months" }));
    expect(screen.getByRole("option", { name: "1 Month" }));
  });
});

describe("Citation-date-presets-selection interactions", () => {
  const onSelectMock = jest.fn();
  beforeEach(async () => {
    const user = userEvent.setup();
    render(<CitationDatePresetsSelection onSelect={onSelectMock} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "1 Month" }));
  });

  test("should not render with default option", () => {
    expect(screen.queryByText("Past 1 Year")).toBe(null);
  });

  test("should render with selected option", async () => {
    expect(screen.getByText("1 Month"));
  });

  test("should return selected option", async () => {
    expect(onSelectMock).toHaveBeenCalledWith("1 Month");
  });
});
