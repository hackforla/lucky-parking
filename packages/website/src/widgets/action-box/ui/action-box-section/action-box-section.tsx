import { PropsWithChildren } from "react";

export default function ActionBoxSection(props: PropsWithChildren) {
  const { children } = props;

  return (
    <div className="flex flex-col p-6 space-y-4 bg-white-100">{children}</div>
  );
}
