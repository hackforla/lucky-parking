import SearchIcon from "@mui/icons-material/Search";

interface SearchInputProps {
  placeholder?: string;
}

export default function SearchInput(props: SearchInputProps) {
  const { placeholder = "Search" } = props;

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
        />
      </div>
    </div>
  );
}
