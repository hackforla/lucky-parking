import { useStore } from "./use-store";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import _ from "lodash";
import { CitationsResultSchema } from "@/lib/citations/schema";

export const useCitations = () => {
	const { places, range } = useStore((state) => ({ places: state.getPlaces(), range: state.range }));

	const placeIds = _.chain(places).map("id").compact().uniq().sort().value();

	return useQuery({
		enabled: places.length > 0,
		queryKey: ["citations", range.from.toISOString(), range.to.toISOString(), placeIds],
		queryFn: async ({ signal }) => {
			const response = await fetch("/api/v1/citations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					date_min: format(range.from, "yyyy-MM-dd"),
					date_max: format(range.to, "yyyy-MM-dd"),
					geometries: places.map((place) => place.geometry),
					limit: 1000,
				}),
				signal,
			});
			if (!response.ok) {
				const message =
					response.status === 422
						? "Choose valid locations and a date range of ten years or less."
						: "Parking data is unavailable. Check the data service and try again.";
				throw new Error(message);
			}
			return CitationsResultSchema.parse(await response.json());
		},
		retry: 1,
		staleTime: 60_000, // 1 minute
	});
};
