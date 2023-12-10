import { PropsWithChildren } from "react";
import type { onEvent } from "@lucky-parking/typings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";

interface FakeInputProps extends PropsWithChildren {
  onClose: onEvent;
}

// TODO: This component may be unnecessary. Research into the `readonly` property for `input` element should be conducted.
export default function FakeInput({ children, ...props }: FakeInputProps) {
  const { onClose } = props;

  return (
    <div className="w-full">
      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 flex cursor-pointer items-center pl-3 text-blue-500"
          onClick={onClose}>
          <ArrowBackIcon />
        </div>

        <div className="ring-black-200 flex h-[48px] w-full select-none items-center rounded border-0 bg-white py-1.5 pl-10 pr-10 ring-1 ring-inset">
          <p className="truncate">{children}</p>
        </div>

        <div className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3" onClick={onClose}>
          {/* STUB */}
          <CloseIcon />
        </div>
      </div>
    </div>
  );
}
