import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Input from "./input";

describe("Input", () => {
  render(<Input id="Tyrell Corp Corporation" value="More human than human is our motto" />);

  test("renders input value value", () => {
    expect(screen.getByDisplayValue("More human than human is our motto")).toBeInTheDocument();
  });
});
