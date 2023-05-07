import { ElementType, forwardRef, PropsWithChildren, Ref } from "react";
import Container from "../container";
import clsx from "clsx";

interface Props extends PropsWithChildren {
  as?: ElementType;
  className?: string;
}

function FullContainer(props: Props, ref: Ref<unknown> | undefined) {
  const { as: Element = "div", className = "", children } = props;

  return (
    <Container
      as={Element}
      className={clsx("w-full h-full", className)}
      ref={ref}
    >
      {children}
    </Container>
  );
}

export default forwardRef(FullContainer);
