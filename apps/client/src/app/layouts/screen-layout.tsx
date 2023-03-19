import React, { PropsWithChildren } from 'react';
import { FullContainer, ScreenContainer } from '@lucky-parking/ui';

export default function ScreenLayout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <ScreenContainer>
      <FullContainer as="main">{children}</FullContainer>
    </ScreenContainer>
  );
}
