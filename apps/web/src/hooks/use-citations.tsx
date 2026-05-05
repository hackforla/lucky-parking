import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { usePublicConfig } from "@/hooks/use-public-config";
import { fetchParkingCitations } from "@/lib/socrata/parking-citations";
import { useStore } from "./use-store";

export const useCitations = () => {
	const { data } = usePublicConfig();
	const { places, range } = useStore((state) => ({ places: state.getPlaces(), range: state.range }));

	const placeIds = _.chain(places).map("id").compact().uniq().sort().value();

	return useQuery({
		queryKey: ["citations", range.from.toISOString(), range.to.toISOString(), placeIds],
		queryFn: () =>
			fetchParkingCitations({
				token: data?.socrataAppToken,
				places,
				range,
			}),
		staleTime: 60_000, // 1 minute
	});
};
