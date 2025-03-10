import { Meta, StoryObj } from "@storybook/react";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import { Button, ButtonVariant } from "@lucky-parking/ui/button";
import { Modal, ModalClose, ModalContent, ModalDescription, ModalTitle, ModalTrigger } from "@lucky-parking/ui/modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
};

type Content = StoryObj<typeof ModalContent>;

export const Default: Content = {
  args: {
    title: "Message",
    description: "The slime replies back",
  },
  render: (args) => (
    <Modal key="default">
      <ModalTrigger>
        <AnnouncementIcon />
      </ModalTrigger>
      <ModalContent {...args}>
        <div className="w-52"> Hello World! I&#39;m not a bad slime </div>
        <div className="mt-6 flex justify-end">
          <ModalClose asChild>
            <Button variant={ButtonVariant.primary}>
              <p>Submit</p>
            </Button>
          </ModalClose>
        </div>
      </ModalContent>
    </Modal>
  ),
};

export const CustomTitleAndDescription: Content = {
  render: () => (
    <Modal key="custom">
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
    </Modal>
  ),
};

export default meta;
