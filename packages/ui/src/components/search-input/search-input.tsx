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
    [children],
  );

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    onChange(value);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <SearchIcon />
        </div>
        <input
          type="search"
          className="ring-black-200 block h-[48px] w-full rounded border-0 bg-white py-1.5 pl-5 pr-10 ring-1 ring-inset"
          placeholder={placeholder}
          onChange={onSearchChange}
          value={value}
        />
      </div>
      {hasSuggestions && (
        <div className="bg-white-100 divide-white-500 absolute mt-1.5 divide-y-2 shadow-[0px_0px_8px_rgba(26,26,30,0.2)]">
          {children}
        </div>
      )}
    </div>
  );
}
