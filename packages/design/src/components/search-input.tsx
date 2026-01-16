import { Search } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

type SearchInputProps = {
	label: string;
	placeholder: string;
	suggestions: unknown[];
};

export const SearchInput = ({ label, placeholder = "Search...", suggestions = [] }: SearchInputProps) => {
	return (
		<>
			{/* Input */}
			<div>
				<Label
					htmlFor="search"
					className="sr-only">
					{label}
				</Label>
				<Input
					id="search"
					placeholder={placeholder}
					className="!pl-8"
				/>
				<Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
			</div>

			<div>
				{/* Suggestions */}
				<ul>
					{suggestions.map((suggestion, index) => (
						<li key={index}>{suggestion}</li>
					))}
				</ul>
			</div>
		</>
	);
};
