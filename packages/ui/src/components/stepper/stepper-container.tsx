import { Children, ReactElement, ReactNode, createElement } from "react";

interface StepperContainerProps {
  currentStep?: number;
  children: ReactNode[];
}

const isReactElement = (child: ReactNode): child is ReactElement => {
  return child !== null && typeof child === "object" && "type" in child;
};

export function StepperContainer({ currentStep = 0, children }: StepperContainerProps) {
  const items = Children.toArray(children) || [];
  const len = items.length;

  return (
    <div className="ml-4 flex flex-col">
      {items.map((child, idx) => {
        if (!isReactElement(child)) return <></>;
        return createElement(child.type, {
          key: idx,
          ...child.props,
          isCurrent: currentStep === idx,
          isLast: idx === len - 1,
        });
      })}
    </div>
  );
}
