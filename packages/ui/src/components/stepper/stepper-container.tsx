import { isObject } from "lodash";
import { Children, ReactNode, createElement, isValidElement } from "react";

interface StepperContainerProps {
  currentStep?: number;
  children: ReactNode[];
}

export function StepperContainer({ currentStep = 0, children }: StepperContainerProps) {
  const items = Children.toArray(children);
  const len = items.length;

  return (
    <div className="flex flex-col">
      {items.map((child, idx) => {
        if (!isValidElement(child)) return;
        return createElement(child.type, {
          key: idx,
          isCurrent: currentStep === idx,
          isLast: idx === len - 1,
          ...(isObject(child.props) ? child.props : {}),
        });
      })}
    </div>
  );
}
