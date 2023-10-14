import CheckIcon from "@mui/icons-material/Check";
import { twMerge } from "tailwind-merge";

interface CircleProps {
  isCurrent: boolean;
  isFinished: boolean;
}

export default function Circle({ isCurrent, isFinished }: CircleProps) {
  let ariaLabel = isFinished ? "finished" : "incomplete";
  if (isCurrent) ariaLabel = "inProgress";

  return (
    <div
      aria-label={ariaLabel}
      className={twMerge(
        "bg-white-400 flex h-4 w-4 items-center justify-center rounded-lg",
        (isCurrent || isFinished) && "bg-cyan-500",
      )}>
      {isFinished && <CheckIcon sx={{ margin: 1, fontSize: 16, color: "#FBFBFB" }} />}
    </div>
  );
}
