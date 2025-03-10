import { PropsWithChildren } from "react";

export const SearchSuggestionHeader = ({ children }: PropsWithChildren) => {
  return <div className="z-[100] flex justify-between px-5 py-2">{children}</div>;
}
