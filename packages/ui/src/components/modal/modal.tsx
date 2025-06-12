import { ReactNode, forwardRef } from "react";
import { Dialog as RadixDialog } from "radix-ui";
import CloseIcon from "@mui/icons-material/Close";
import clsx from "clsx";

interface ModalContentProps {
  className?: string;
  title?: string;
  description?: string;
  children: ReactNode | undefined;
  showTopRightCloseButton?: boolean;
}

function ModalContentComponent(props: ModalContentProps, ref: any) {
	const { className = "", title, description, children, showTopRightCloseButton = true, ...rest } = props;

  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="bg-black-500 fixed inset-0 z-50 opacity-60" />
      <RadixDialog.Content
        ref={ref}
        className={clsx(
          "bg-white-100 absolute left-0 right-0 top-[20%] z-50 m-auto",
          "flex h-min w-min flex-col rounded-md p-6 shadow-md",
          className,
        )}
        {...props}>
        {title && showTopRightCloseButton && (
          <div className={clsx("mb-1 flex justify-end", !!title && "items-center justify-between")}>
            {title && <RadixDialog.Title className="text-black-500 text-xl leading-5">{title}</RadixDialog.Title>}
            {showTopRightCloseButton && (
              <RadixDialog.Close aria-label="close-modal">
                <CloseIcon sx={{ fontSize: 24, color: "#1F1F1F" }} />
              </RadixDialog.Close>
            )}
          </div>
        )}
        {description && <RadixDialog.Description className="text-black-400 mb-3">{description}</RadixDialog.Description>}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
};

export const Modal = RadixDialog.Root;
export const ModalDescription = RadixDialog.Description;
export const ModalTitle = RadixDialog.Title;
export const ModalContent = forwardRef(ModalContentComponent);
export const ModalTrigger = RadixDialog.Trigger;
export const ModalClose = RadixDialog.Close;
