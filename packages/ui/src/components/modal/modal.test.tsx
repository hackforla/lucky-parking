import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "./modal";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import Button, { ButtonVariant } from "../button/button";

describe("Modal and click modal trigger", () => {
  beforeEach(() => {
    render(
      <Modal>
        <ModalTrigger aria-label="open-modal">
          {" "}
          <AnnouncementIcon />{" "}
        </ModalTrigger>
        <ModalContent title={"Messages"} description={"The Slime replied back"}>
          <div className="w-52">Hello World! I'm not a bad slime</div>
          <div className="mt-6 flex justify-end space-x-2">
            <ModalClose asChild>
              <Button variant={ButtonVariant.primary}>
                <p>Submit</p>
              </Button>
            </ModalClose>
          </div>
        </ModalContent>
      </Modal>,
    );

    const openModal = screen.getByRole("button", { name: /open-modal/i });
    fireEvent.click(openModal);
  });

  test("renders announcement icon", () => {
    expect(screen.getByTestId("AnnouncementIcon")).toBeInTheDocument();
  });

  test("renders title", () => {
    expect(screen.getByText("Messages")).toBeInTheDocument();
  });

  test("renders description", () => {
    expect(screen.getByText("The Slime replied back")).toBeInTheDocument();
  });

  test("renders content test", () => {
    expect(
      screen.getByText("Hello World! I'm not a bad slime"),
    ).toBeInTheDocument();
  });

  test("renders submit button", () => {
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  test("clicking submit button closes modal", () => {
    const submitBttn = screen.getByText("Submit");
    fireEvent.click(submitBttn);
    expect(submitBttn).not.toBeInTheDocument();
  });

  test("renders close trigger button", () => {
    expect(
      screen.getByRole("button", { name: /close-modal/i }),
    ).toBeInTheDocument();
  });

  test("clicking close trigger button should close modal", () => {
    const closeModal = screen.getByRole("button", { name: /close-modal/i });
    fireEvent.click(closeModal);
    expect(closeModal).not.toBeInTheDocument();
  });
});
