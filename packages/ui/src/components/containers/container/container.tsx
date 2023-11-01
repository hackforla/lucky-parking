import { ElementType, forwardRef, PropsWithChildren } from "react";
import clsx from "clsx";

interface ContainerProps extends PropsWithChildren {
  as?: ElementType;
  className?: string;
}

function Container(props: ContainerProps, ref: any) {
  const { as: Element = "div", className = "", children } = props;

  return (
    <Element className={clsx("flex", className)} ref={ref}>
      {children}
    </Element>
  );
}

export default forwardRef(Container);
