import _ from "lodash";
import { PropsWithChildren } from "react";

interface SearchSuggestionProps extends PropsWithChildren {
  onClick: () => void;
}

export default function SearchSuggestion({ children, ...props }: SearchSuggestionProps) {
  const { onClick = _.noop } = props;

  const onSuggestionClick = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    onClick(event.target.textContent);
  };

  return (
    <li
      className="z-[100] flex h-[50px] cursor-pointer items-center justify-between space-x-3 px-5"
      onClick={onSuggestionClick}>
      {children}
    </li>
  );
}
