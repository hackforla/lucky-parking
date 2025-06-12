import { PropsWithChildren } from "react";

export default function MockComponent({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}
