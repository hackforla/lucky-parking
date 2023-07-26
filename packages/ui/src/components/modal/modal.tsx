import React, { ReactNode } from 'react'
import { Root, Trigger, Portal, Content, Title, Description, Close, DialogProps } from '@radix-ui/react-dialog'
import CloseIcon from '@mui/icons-material/Close';
import clsx from 'clsx';

interface ModalContentProps {
  title?: string,
  description?: string,
  children: ReactNode | undefined,
}

export const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ title, description, children, ...props },forwardedRef) => (
    <Portal>
      <Content className="
        flex flex-col 
        absolute m-auto left-0 right-0 
        w-min h-min p-6 rounded-md shadow-md"
        {...props} ref={forwardedRef}
      >
        <div className={clsx(
          "flex justify-end mb-1",
          !!title && "justify-between items-center"
        )}>
          {title &&
            <Title className='text-black-500 text-xl leading-5'>
              {title}
            </Title>
          }
          <Close aria-label='close-modal'>
            <CloseIcon sx={{ fontSize: 24, color: '#1F1F1F' }} />
          </Close>
        </div>
        {description &&
          <Description className='text-black-400 mb-3'>
            {description}
          </Description>
        }
        {children}
      </Content>
    </Portal>
  )
);

export const Modal = Root
export const ModalTrigger = Trigger
export const ModalClose = Close

