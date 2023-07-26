import { Meta, StoryObj } from "@storybook/react";
import AnnouncementIcon from '@mui/icons-material/Announcement';
import Button, { ButtonVariant } from "../button";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "./modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal
}

type Content  = StoryObj<typeof ModalContent>;

export const Basic: Content = {
  args: {
    title: 'Message',
    description: 'The slime replies back',
  },
  render: (args) => (
    <Modal>
      <ModalTrigger > <AnnouncementIcon /> </ModalTrigger>
      <ModalContent {...args}>
        <div className="w-52"> Hello World! I'm not a bad slime </div>
        <div className="flex justify-end mt-6">
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

export default meta
