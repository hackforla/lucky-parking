import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Header from "./header";

describe("Header", () => {
  beforeEach(() => {
    render(<Header />);
  });

  test("renders with branding", () => {
    expect(screen.getByRole("logo")).toBeInTheDocument();
  });
  test("renders with description", () => {
    //description
    expect(
      screen.getByText("Los Angeles Parking Citation Data"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Helping L.A. make informed decisions about parking policies",
      ),
    ).toBeInTheDocument();
  });

  test("renders with action button", () => {
    const button = screen.getByRole("button", { name: "HOW IT WORKS" });
    expect(button).toBeInTheDocument();
  });
});
