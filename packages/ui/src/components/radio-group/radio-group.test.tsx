import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { RadioGroup } from "./index";

describe("Radio Group Component", () => {
  let currOption: string;
  beforeEach(async () => {
    const lyrics = ["Never", "Gonna", "Give", "You", "Up"];
    render(
      <RadioGroup
        name="rick-roll"
        options={lyrics}
        onChange={(e: string) => {
          currOption = e;
        }}
      />,
    );
  });

  test("renders radio group and all it's options", () => {
    expect(screen.getByLabelText("Never"));
    expect(screen.getByLabelText("Gonna"));
    expect(screen.getByLabelText("Give"));
    expect(screen.getByLabelText("You"));
    expect(screen.getByLabelText("Up"));
    expect(screen.queryByLabelText("rick-roll")).not.toBeInTheDocument();
    expect(screen.getByRole("group"));
  });

  test("able to select and re-slect one radio option at a time", () => {
    const neverInput = screen.getByRole("radio", { name: "Never" });
    const gonnaInput = screen.getByRole("radio", { name: "Gonna" });
    fireEvent.click(neverInput);
    expect(neverInput).toBeChecked();
    expect(gonnaInput).not.toBeChecked();
    fireEvent.click(gonnaInput);
    expect(gonnaInput).toBeChecked();
    expect(neverInput).not.toBeChecked();
  });

  test("should return the selected option", () => {
    const neverInput = screen.getByText("Never");
    const upInput = screen.getByText("Up");
    fireEvent.click(neverInput);
    expect(currOption).toBe("Never");
    fireEvent.click(upInput);
    expect(currOption).toBe("Up");
  });
});
