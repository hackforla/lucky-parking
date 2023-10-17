import "@testing-library/jest-dom";
import { render, screen } from "@/shared/lib/utilities/testing";
import Header from "./header";

describe("Header", () => {
  beforeEach(() => {
    render(<Header />);
  });

  test("renders with branding", () => {
    expect(screen.getByRole("img", { name: "Parking Insights brand mark" })).toBeInTheDocument();
  });
  test("renders with description", () => {
    //description
    expect(screen.getByText("Los Angeles Parking Citation Data")).toBeInTheDocument();
    expect(screen.getByText("Helping L.A. make informed decisions about parking policies")).toBeInTheDocument();
  });

  test("renders with action button", () => {
    const button = screen.getByText("HOW IT WORKS");
    expect(button).toBeInTheDocument();
  });
});
