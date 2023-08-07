import React, { ReactNode } from "react";
import {
  Root,
  Trigger,
  Overlay,
  Portal,
  Content,
  Title,
  Description,
  Close,
} from "@radix-ui/react-dialog";
import CloseIcon from "@mui/icons-material/Close";
import clsx from "clsx";

interface ModalContentProps {
  className?: string;
  title?: string;
  description?: string;
  children: ReactNode | undefined;
  navClose?: boolean
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className='', title, description, children, navClose=true, ...props }, forwardedRef) => (
    <Portal>
      <Overlay className='bg-black-500 opacity-60 fixed inset-0 z-50'/>
      <Content 
        ref={forwardedRef}
        className={clsx(
          "absolute top-[20%] left-0 right-0 m-auto z-50 bg-white-100",
          "flex h-min w-min flex-col rounded-md p-6 shadow-md",
          className
        )}
        {...props}
        >
        {title && navClose && (
          <div
            className={clsx(
              "mb-1 flex justify-end",
              !!title && "items-center justify-between",
            )}>
            {title && (
              <Title className="text-black-500 text-xl leading-5">{title}</Title>
            )}
            {navClose &&
              <Close aria-label="close-modal">
                <CloseIcon sx={{ fontSize: 24, color: "#1F1F1F" }} />
              </Close>
            }
          </div>
        )}
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
export const ModalDescription = Description;
export const ModalTitle = Title;
export const ModalTrigger = Trigger;
export const ModalClose = Close;
