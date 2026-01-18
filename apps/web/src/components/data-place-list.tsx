import { Button } from "@lucky-parking/design/components";
import { Trash } from "lucide-react";
import { type Result as MapboxGeocoderResult } from "mapbox__mapbox-gl-geocoder";
import { PlaceItem } from "@/components/place-item";
import { useStore } from "@/hooks/use-store";

export const DataPlaceList = () => {
	const [places, removePlace] = useStore((state) => [state.getPlaces(), state.removePlace]);

	const onPlaceClose = (id: MapboxGeocoderResult["id"]) => {
		removePlace(id);
	};

	if (!places.length) {
		return <div>You haven&#39;t selected any places yet.</div>;
	}

	return (
		<ul className="space-y-2">
			{places.map((place) => (
				<li
					key={place.properties.name}
					className="group/place relative rounded-lg border bg-white">
					<PlaceItem
						name={place.properties.name}
						address={place.properties.full_address}
						type={place.properties.feature_type}
					/>

					{/* Delete */}
					<Button
						className="border-l-border/60 absolute inset-y-0 right-0 h-full w-10 translate-x-1 opacity-0 transition-all duration-150 ease-out group-hover/place:translate-x-0 group-hover/place:opacity-75 hover:opacity-100 focus:translate-x-0 focus:opacity-100"
						variant="destructive"
						size="icon-sm"
						onClick={() => onPlaceClose(place.id)}>
						<Trash size={12} />
					</Button>
				</li>
			))}
		</ul>
	);
};
