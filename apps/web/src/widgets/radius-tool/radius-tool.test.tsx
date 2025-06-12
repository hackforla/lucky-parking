import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RadiusTool from "./radius-tool";

describe("Radius Tool UI", () => {
  beforeEach(() => {
    render(<RadiusTool onSubmit={(value: string) => console.log(value)} />);
  });

  test("renders default Select Option", () => {
    expect(screen.getByText("Miles")).toBeInTheDocument();
  });

  test("renders default input", () => {
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
  });

  test("renders apply button", () => {
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });
});

describe("Radius Tool Interaction", () => {
  const user = userEvent.setup();

  beforeEach(async () => {
    render(<RadiusTool onSubmit={(value) => console.log(value)} />);

    const list = screen.getByRole("combobox");
    await user.click(list);
  });

  test("renders select list", () => {
    expect(screen.getByText("Feet")).toBeInTheDocument();
    expect(screen.getByText("KM")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  test("should render Feet", async () => {
    const feetOption = screen.getByRole("option", { name: "Feet" });
    await user.click(feetOption);
    expect(screen.getByText("Feet")).toBeInTheDocument();
  });

  test("should convert miles to feet", async () => {
    const feetOption = screen.getByRole("option", { name: "Feet" });
    await user.click(feetOption);
    expect(screen.getByDisplayValue("5280")).toBeInTheDocument();
  });

  test("should convert miles to kilometer", async () => {
    const feetOption = screen.getByRole("option", { name: "KM" });
    await user.click(feetOption);
    expect(screen.getByDisplayValue("1.6")).toBeInTheDocument();
  });

  test("should convert miles to meter", async () => {
    const feetOption = screen.getByRole("option", { name: "M" });
    await user.click(feetOption);
    expect(screen.getByDisplayValue("1609.3")).toBeInTheDocument();
  });
});
