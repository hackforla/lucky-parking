import "@testing-library/jest-dom";
import RegionTypesSelection from "./region-types-selection";
import { render, screen, fireEvent } from "@/shared/lib/utilities/testing";

describe("Region Types Selection", () => {
  it("should render all available Region Types", async () => {
    render(<RegionTypesSelection onChange={() => {}} />);
    fireEvent.click(screen.getByRole("group"));
    expect(screen.getByText("Neighborhood Council"));
    expect(screen.getByText("Zip Code"));
    expect(screen.getByText("Place (Radius)"));
    expect(screen.getByText("Custom Drawing"));
  });

  it("should allow user select specific region type", async () => {
    const onChangeMock = jest.fn();
    render(<RegionTypesSelection onChange={onChangeMock} />);
    fireEvent.click(screen.getByRole("group"));
    fireEvent.click(screen.getByText("Custom Drawing"));
    expect(onChangeMock).toHaveBeenCalledWith("Custom Drawing");
  });
});
