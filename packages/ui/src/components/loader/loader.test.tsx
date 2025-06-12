import { render, screen } from "@testing-library/react";
import { Loader } from "./loader";

// Test case for basic rendering and text
test("Renders the Loader component correctly", () => {
  render(<Loader />);
  const loader = screen.getByTestId("loader");
  expect(loader).toBeInTheDocument();
  expect(loader).toHaveTextContent("Loading...");
});

// Test case for styling props
test("Renders loader with custom background color", () => {
  render(<Loader backgroundColor="amber-500" />);
  const loader = screen.getByTestId("loader");
  expect(loader).toHaveStyle({ backgroundColor: "rgb(245 158 11)" });
});

test("Renders loader with custom height", () => {
  render(<Loader height="40" />);
  const loader = screen.getByTestId("loader");
  expect(loader).toHaveClass("h-40");
});
