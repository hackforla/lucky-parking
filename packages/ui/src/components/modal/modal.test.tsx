import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal, ModalClose, ModalContent, ModalDescription, ModalTitle, ModalTrigger } from "./modal";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import Button, { ButtonVariant } from "../button/button";

describe("Default Modal and click modal trigger", () => {
  const user = userEvent.setup();
  beforeEach(async () => {
    render(
      <Modal>
        <ModalTrigger aria-label="open-modal">
          {" "}
          <AnnouncementIcon />{" "}
        </ModalTrigger>
        <ModalContent title={"Messages"} description={"The Slime replied back"}>
          <div className="w-52">Hello World! I`&apos;`m not a bad slime</div>
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
    await user.click(openModal);
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
    expect(screen.getByText("Hello World! I'm not a bad slime")).toBeInTheDocument();
  });

  test("renders submit button", () => {
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  test("clicking submit button closes modal", async () => {
    const submitBttn = screen.getByText("Submit");
    await user.click(submitBttn);
    expect(submitBttn).not.toBeInTheDocument();
  });

  test("renders close trigger button", () => {
    expect(screen.getByRole("button", { name: /close-modal/i })).toBeInTheDocument();
  });

  test("clicking close trigger button should close modal", async () => {
    const closeModal = screen.getByRole("button", { name: /close-modal/i });
    await user.click(closeModal);
    expect(closeModal).not.toBeInTheDocument();
  });
});

describe("Custom Modal Description and Title and click modal trigger", () => {
  beforeEach(async () => {
    const user = userEvent.setup();
    render(
      <Modal>
        <ModalTrigger asChild aria-label="open-modal">
          <Button>
            <p>Custom</p>
          </Button>
        </ModalTrigger>
        <ModalContent className="w-[200px]">
          <ModalTitle className="mb-4 text-3xl">Kamina</ModalTitle>
          <ModalDescription className="mb-3">
            Believe In The <span className="font-bold">Me</span> That Believe In <span className="font-bold">You</span>
          </ModalDescription>
          <ModalClose asChild>
            <Button variant={ButtonVariant.primary}>
              <p>Ok!</p>
            </Button>
          </ModalClose>
        </ModalContent>
      </Modal>,
    );

    const openModal = screen.getByRole("button", { name: /open-modal/i });
    await user.click(openModal);
  });

  test("renders custom title", () => {
    expect(screen.getByText("Kamina")).toBeInTheDocument();
  });

  test("renders custom description", () => {
    const ele = screen.getByText("Believe ", { exact: false });
    expect(ele.textContent).toEqual("Believe In The Me That Believe In You");
  });
});
