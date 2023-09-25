import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HowItWorksButton from "./how-it-works-button";

describe("Modal and click modal trigger", () => {
  const user = userEvent.setup();
  beforeEach(async () => {
    render(<HowItWorksButton />);

    const openModal = screen.getByRole("button", { name: /open-modal/i });
    await user.click(openModal);
  });

  test("renders title", () => {
    expect(screen.getByText("How it Works")).toBeInTheDocument();
  });

  test("renders description", () => {
    const ele = screen.getByText("Parking Insights", { exact: false });
    expect(ele.textContent).toEqual(
      "Parking Insights lets you get data on Los Angeles parking tickets data on Los Angeles parking tickets using several options:",
    );
  });

  test("renders SearchIcon", () => {
    expect(screen.getByTestId("SearchIcon")).toBeInTheDocument();
  });

  test("renders SearchIcon's title", () => {
    expect(screen.getByText("USE THE SEARCH BAR")).toBeInTheDocument();
  });

  test("renders SearchIcon's first list text", () => {
    const ele = screen.getByText("Search for an", { exact: false });
    expect(ele.textContent).toEqual("Search for an Address/place and get data for the Radius surrounding that place");
  });

  test("renders SearchIcon's second list text", () => {
    const ele = screen.getByText("Search for a ", { exact: false });
    expect(ele.textContent).toEqual(
      "Search for a Neighborhood Council District or Zip Code to get data for that region",
    );
  });

  test("renders DrawIcon", () => {
    expect(screen.getByTestId("DrawIcon")).toBeInTheDocument();
  });

  test("renders DrawIcons's title", () => {
    expect(screen.getByText("DRAW A CUSTOM BOUNDARY")).toBeInTheDocument();
  });

  test("renders CompareIcon", () => {
    expect(screen.getByTestId("CompareArrowsIcon")).toBeInTheDocument();
  });

  test("renders CompareIcons's title", () => {
    expect(screen.getByText("COMPARE TWO REGIONS")).toBeInTheDocument();
  });

  test("renders with close button", () => {
    const closeButton = screen.getByRole("button", { name: "GOT IT!" });
    expect(closeButton).toBeInTheDocument();
  });

  test("pressing close button closes modal", async () => {
    const closeButton = screen.getByRole("button", { name: "GOT IT!" });
    await user.click(closeButton);

    expect(closeButton).not.toBeInTheDocument();
  });
});
