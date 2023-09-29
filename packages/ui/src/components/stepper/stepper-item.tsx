import { ReactNode } from "react";
import Circle from "./stepper-circle";
import Line from "./stepper-line";

interface StepperItemProps {
  children?: ReactNode;
  title?: string;
  isCurrent?: boolean;
  isFinished?: boolean;
  isLast?: boolean;
}

export function StepperItem({
  children,
  title = "",
  isCurrent = false,
  isFinished = false,
  isLast = false,
}: StepperItemProps) {
  return (
    <div className="flex flex-col">
      <div className="flex h-5 items-center space-x-4">
        <div className="flex w-4 justify-center">
          <Circle isCurrent={isCurrent} isFinished={isFinished} />
        </div>
        {title.length !== 0 && <div className="black-500 l-[19.2px] text-base font-semibold">{title}</div>}
      </div>

      <div className="flex space-x-4">
        <div className="flex w-4 items-stretch">{!isLast && <Line isFinished={isFinished} />}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}
