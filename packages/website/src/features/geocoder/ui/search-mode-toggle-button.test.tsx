import { render, screen } from "@/shared/lib/utilities/testing";
import SearchModeToggleButton from "./search-mode-toggle-button";

const MOCK_ON_CLICK = jest.fn();

describe("Search Mode Toggle Button", () => {
  it("renders visibly", () => {
    render(<SearchModeToggleButton />);

    const button = screen.getByRole("button", { name: "Compare Mode" });
    expect(button).toBeInTheDocument();
    expect(button).toBeVisible();
  });

  it("invokes onclick handler when clicked", async () => {
    const { user } = render(<SearchModeToggleButton onClick={MOCK_ON_CLICK} />);

    const button = screen.getByRole("button", { name: "Compare Mode" });
    await user.click(button);

    expect(MOCK_ON_CLICK).toBeCalledTimes(1);
  });
});
