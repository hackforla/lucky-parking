import { ReactNode, createElement } from "react";

interface StepperContainerProps {
  currentStep?: number;
  children: ReactNode[];
}

export function StepperContainer({ currentStep = 0, children }: StepperContainerProps) {
  const len = children?.length;

  return (
    <div className="ml-4 flex flex-col">
      {children?.map((child: any, idx: number) => {
        const isLast = idx === len - 1;
        return createElement(child.type, { key: idx, ...child.props, isCurrent: currentStep === idx, isLast });
      })}
    </div>
  );
}
