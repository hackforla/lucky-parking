import Button, { ButtonVariant } from "@lucky-parking/ui/src/components/button";
//TODO figure out how to configure the config
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalTitle,
  ModalTrigger,
} from "@lucky-parking/ui/src/components/modal";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DrawIcon from "@mui/icons-material/Draw";
import SearchIcon from "@mui/icons-material/Search";

export default function HowItWorksButton() {
  return (
    <Modal>
      <ModalTrigger aria-label="open-modal" asChild>
        <Button variant={ButtonVariant.secondary}>HOW IT WORKS</Button>
      </ModalTrigger>
      <ModalContent className="flex h-auto !w-[448px] flex-col">
        <ModalTitle className="text-black-500 mb-6 text-3xl font-medium leading-9">How it Works</ModalTitle>
        <ModalDescription className="mb-4 text-base leading-6">
          Parking Insights lets you get <span className="font-semibold">data on Los Angeles parking tickets</span> data
          on Los Angeles parking tickets using several options:
        </ModalDescription>
        <div className="flex flex-col space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1">
              <SearchIcon sx={{ color: "#205CA2" }} />
              <div className="text-base font-semibold leading-5">USE THE SEARCH BAR</div>
            </div>
            <ol className="list-decimal px-11 text-sm leading-5">
              <li>
                Search for an <span className="font-semibold">Address/place</span> and get data for the{" "}
                <span className="font-semibold">Radius</span> surrounding that place
              </li>
              <li>
                Search for a <span className="font-semibold">Neighborhood Council District</span> or{" "}
                <span className="font-semibold">Zip Code</span> to get data for that region
              </li>
            </ol>
          </div>
          <div className="flex items-center space-x-1">
            <DrawIcon sx={{ color: "#205CA2" }} />
            <div className="text-base font-semibold leading-5">DRAW A CUSTOM BOUNDARY</div>
          </div>
          <div className="flex items-center space-x-1">
            <CompareArrowsIcon sx={{ color: "#205CA2" }} />
            <div className="text-base font-semibold leading-5">COMPARE TWO REGIONS</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <ModalClose asChild>
            <Button variant={ButtonVariant.outline}>
              <p>GOT IT!</p>
            </Button>
          </ModalClose>
        </div>
      </ModalContent>
    </Modal>
  );
}
