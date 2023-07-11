import { PropsWithChildren } from "react";

export default function RegionSection(props: PropsWithChildren) {
  const { children } = props;

  return (
    <div className="flex flex-col p-6 space-y-4 bg-white-100">{children}</div>
  );
}
