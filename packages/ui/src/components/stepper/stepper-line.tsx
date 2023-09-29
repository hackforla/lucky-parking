import { twMerge } from "tailwind-merge";

interface LineProps {
  height?: number;
  isFinished: boolean;
}

export default function Line({ isFinished, height = 0 }: LineProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <span
        className={twMerge(
          `h-full w-0.5 rounded-sm`,
          height && `h-[${height}px]`,
          isFinished ? "bg-cyan-500" : "bg-white-400",
        )}
      />
    </div>
  );
}
