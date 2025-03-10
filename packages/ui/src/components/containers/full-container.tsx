import { ElementType, forwardRef, PropsWithChildren, Ref } from "react";
import { Container } from "../containers";
import clsx from "clsx";

interface Props extends PropsWithChildren {
  as?: ElementType;
  className?: string;
}

function FullContainerComponent(props: Props, ref: Ref<unknown> | undefined) {
  const { as: Element = "div", className = "", children } = props;

  return (
    <Container as={Element} className={clsx("h-full w-full", className)} ref={ref}>
      {children}
    </Container>
  );
}

export const FullContainer = forwardRef(FullContainerComponent);
