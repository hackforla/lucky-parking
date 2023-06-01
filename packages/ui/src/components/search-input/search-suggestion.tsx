import _ from "lodash";
import { PropsWithChildren } from "react";

interface SearchSuggestionProps extends PropsWithChildren {
  onClick: () => void;
}

export default function SearchSuggestion({
  children,
  ...props
}: SearchSuggestionProps) {
  const { onClick = _.noop } = props;

  const onSuggestionClick = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    onClick(event.target.textContent);
  };

  return (
    <div
      className="flex items-center justify-between h-[50px] px-5 space-x-3 cursor-pointer"
      onClick={onSuggestionClick}
    >
      {children}
    </div>
  );
}
