import { ElementType, forwardRef, PropsWithChildren, Ref } from "react";
import { Container } from "../containers";

interface Props extends PropsWithChildren {
  as?: ElementType;
}

function ScreenContainerComponent(props: Props, ref: Ref<unknown> | undefined) {
  const { as: Element = "div", children } = props;

  return (
    <Container as={Element} className="h-screen w-screen" ref={ref}>
      {children}
    </Container>
  );
}

export const ScreenContainer = forwardRef(ScreenContainerComponent);
