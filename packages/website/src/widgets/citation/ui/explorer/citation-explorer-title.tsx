import { PropsWithChildren } from "react";
import type { onEvent } from "@lucky-parking/typings";
import CloseIcon from "@mui/icons-material/Close";

interface CitationExplorerTitleProps extends PropsWithChildren {
  onClose?: onEvent;
}

export default function CitationExplorerTitle({ children, ...props }: CitationExplorerTitleProps) {
  const { onClose } = props;

  return (
    <div className="flex h-[55px] w-full items-center justify-center">
      {onClose && (
        // TODO: Create button icon component
        <div className="absolute left-5 hover:cursor-pointer" onClick={onClose}>
          <CloseIcon />
        </div>
      )}

      <p className="heading-4 text-black-500">{children}</p>
    </div>
  );
}
