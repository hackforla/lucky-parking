import { PropsWithChildren } from "react";

export default function CitationExplorerSection({ children }: PropsWithChildren) {
  return <div className="bg-white-100 flex flex-col space-y-4 p-6">{children}</div>;
}
