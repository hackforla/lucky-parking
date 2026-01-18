"use client";

import {
	Command,
	CommandEmpty,
	CommandItem,
	CommandList,
	Input,
	Label,
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@lucky-parking/design/components";
import { useGeocoder } from "hooks/use-geocoder";
import { useStore } from "hooks/use-store";
import { Search } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { PlaceItem } from "@/components/place-item";
import { GeocoderResult } from "@/types";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

export function SearchGeocoder() {
	const { data = [] } = useGeocoder();
	const addPlace = useStore((state) => state.addPlace);
	const [query, clearQuery, setQuery] = useStore((state) => [state.query, state.clearQuery, state.setQuery]);
	const [open, setOpen] = useState<boolean>(false);

	const onSearchChange = async (event: ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	const onSearchFocus = async () => {
		if (query.trim().length > 0 && data.length > 0) {
			setOpen(true);
		}
	};

	const onResultClick = (result: GeocoderResult) => {
		addPlace(result);
		clearQuery();
	};

	useEffect(() => {
		setOpen(query.trim().length > 0 && data.length > 0);
	}, [query, data]);

	return (
		<div className="w-full">
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<div className="relative">
					<Label
						htmlFor="search"
						className="sr-only">
						Geocoder
					</Label>

					<PopoverAnchor asChild>
						<div className="relative">
							<Input
								id="geocoder"
								placeholder="Search..."
								className="pl-8!"
								maxLength={256}
								onChange={onSearchChange}
								onFocus={onSearchFocus}
								value={query}
								role="combobox"
								aria-controls="geocoder-results"
								aria-autocomplete="list"
							/>
							<Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50" />
						</div>
					</PopoverAnchor>

					<PopoverContent
						align="start"
						side="bottom"
						sideOffset={8}
						className="w-xl p-0"
						onOpenAutoFocus={(event) => event.preventDefault()}>
						<Command shouldFilter={false}>
							<CommandList id="geocoder-results">
								<CommandEmpty>No results.</CommandEmpty>

								{data.map((suggestion) => (
									<CommandItem
										key={suggestion.properties.name}
										value={suggestion.properties.name}
										onMouseDown={(event) => event.preventDefault()}
										onSelect={() => onResultClick(suggestion)}
										className="cursor-pointer p-0">
										<div className="w-full">
											<PlaceItem
												name={suggestion.properties.name}
												address={suggestion.properties.full_address}
												type={suggestion.properties.feature_type}
											/>
										</div>
									</CommandItem>
								))}
							</CommandList>
						</Command>
					</PopoverContent>
				</div>
			</Popover>
		</div>
	);
}
