import { PropsWithChildren } from "react";
import { FullContainer } from "@lucky-parking/ui/src/components/containers";

export default function Page(props: PropsWithChildren) {
  const { children } = props;

  return (
    <FullContainer as="main" className="flex flex-col">
      {children}
    </FullContainer>
  );
}
