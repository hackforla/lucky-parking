import React, { ReactNode } from "react";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Title,
  Description,
  Close,
  DialogProps,
} from "@radix-ui/react-dialog";
import CloseIcon from "@mui/icons-material/Close";
import clsx from "clsx";

interface ModalContentProps {
  title?: string;
  description?: string;
  children: ReactNode | undefined;
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ title, description, children, ...props }, forwardedRef) => (
    <Portal>
      <Content
        className="
        absolute left-0 
        right-0 m-auto flex h-min 
        w-min flex-col rounded-md p-6 shadow-md"
        {...props}
        ref={forwardedRef}>
        <div
          className={clsx(
            "mb-1 flex justify-end",
            !!title && "items-center justify-between",
          )}>
          {title && (
            <Title className="text-black-500 text-xl leading-5">{title}</Title>
          )}
          <Close aria-label="close-modal">
            <CloseIcon sx={{ fontSize: 24, color: "#1F1F1F" }} />
          </Close>
        </div>
        {description && (
          <Description className="text-black-400 mb-3">
            {description}
          </Description>
        )}
        {children}
      </Content>
    </Portal>
  ),
);

export const Modal = Root;
export const ModalTrigger = Trigger;
export const ModalClose = Close;
