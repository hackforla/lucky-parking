import _ from "lodash";
import SearchIcon from "@mui/icons-material/Search";
import { ChangeEvent, PropsWithChildren, useMemo, useState } from "react";

interface SearchInputProps extends PropsWithChildren {
  onChange?: (arg0: any) => void;
  placeholder?: string;
  value: string;
}

export default function SearchInput(props: SearchInputProps) {
  const { children, onChange = _.noop, placeholder = "Search", value } = props;

  const hasSuggestions = useMemo(
    () => children && !_.isEmpty(children),
    [children]
  );

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    onChange(value);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute flex items-center pr-3 right-0 inset-y-0 pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="search"
          className="block w-full h-[48px] py-1.5 pl-5 pr-10 bg-white rounded border-0 ring-1 ring-inset ring-black-200"
          placeholder={placeholder}
          onChange={onSearchChange}
          value={value}
        />
      </div>
      {hasSuggestions && (
        <div className="absolute mt-1.5 bg-white-100 shadow-[0px_0px_8px_rgba(26,26,30,0.2)] divide-y-2 divide-white-500">
          {children}
        </div>
      )}
    </div>
  );
}
