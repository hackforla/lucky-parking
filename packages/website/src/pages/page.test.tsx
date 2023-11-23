import { MockComponent, render, screen } from "@/shared/lib/utilities/testing";
import Page from "./page";

const TEST_CONTENT = "Test Content";

describe("Page", () => {
  it("renders content", () => {
    render(
      <Page>
        <MockComponent>{TEST_CONTENT}</MockComponent>
      </Page>,
    );

    expect(screen.getByText(TEST_CONTENT)).toBeInTheDocument();
    expect(screen.getByText(TEST_CONTENT)).toBeVisible();
  });
});
