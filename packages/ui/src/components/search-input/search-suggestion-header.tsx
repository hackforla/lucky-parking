import { PropsWithChildren } from "react";

export default function SearchSuggestionHeader({
  children,
}: PropsWithChildren) {
  return <div className="flex justify-between px-5 py-2">{children}</div>;
}
