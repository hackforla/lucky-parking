import { ElementType, forwardRef, PropsWithChildren, Ref } from "react";
import Container from "../container/container";

interface Props extends PropsWithChildren {
  as?: ElementType;
}

function ScreenContainer(props: Props, ref: Ref<unknown> | undefined) {
  const { as: Element = "div", children } = props;

  return (
    <Container as={Element} className="h-screen w-screen" ref={ref}>
      {children}
    </Container>
  );
}

export default forwardRef(ScreenContainer);
