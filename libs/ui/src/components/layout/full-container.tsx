import { ElementType, forwardRef, PropsWithChildren, Ref } from 'react';
import Container from './container';

interface Props extends PropsWithChildren {
  as?: ElementType;
}

function FullContainer(props: Props, ref: Ref<unknown> | undefined) {
  const { as: Element = 'div', children } = props;

  return (
    <Container as={Element} className="w-full h-full" ref={ref}>
      {children}
    </Container>
  );
}

export default forwardRef(FullContainer);
