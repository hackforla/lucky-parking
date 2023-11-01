import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PickList from "./pick-list";
import { LIST_OPTIONS } from "./pick-list-test-data";

describe("Pick List", () => {
  beforeEach(() => {
    render(
      <PickList
        id="Cars"
        key={1}
        placeholder="Select a Manufacturer"
        onChange={(val) => console.log(val)}
        options={LIST_OPTIONS}
      />,
    );
  });
  test("renders placeholder text", () => {
    expect(screen.getByText("Select a Manufacturer")).toBeInTheDocument();
  });

  test("renders ArrowDropDown icon", () => {
    expect(screen.getByTestId("ArrowDropDownIcon")).toBeInTheDocument();
  });
});

describe("Pick List's User Interaction", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    render(
      <PickList
        id="Car2"
        key={2}
        placeholder="Select a car"
        onChange={(val) => console.log(val)}
        options={LIST_OPTIONS}
      />,
    );

    const ele = screen.getByRole("combobox");
    await user.click(ele);
  });

  test("renders ArrowDropUp icon", () => {
    expect(screen.getByTestId("ArrowDropUpIcon")).toBeInTheDocument();
  });

  test("renders list of items", () => {
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
