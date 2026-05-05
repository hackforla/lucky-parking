import { Card, CardDescription, CardHeader, CardTitle } from "@lucky-parking/design/components";
import { useIsFetching } from "@tanstack/react-query";
import { useCitations } from "hooks/use-citations";
import { ParkingCitationFeature } from "@/lib/socrata/parking-citations.schema";

const calculateStatistics = (citations: ParkingCitationFeature[] = []) => {
	const empty = { citations: { total: "--" }, fines: { total: "--", average: "--" } };
	if (citations.length === 0) return empty;

	const totalFine = citations.reduce((sum, { properties }) => sum + Number(properties.fine_amount), 0);

	return {
		citations: { total: citations.length },
		fines: {
			total: `$${totalFine.toFixed(2)}`,
			average: `$${(totalFine / citations.length).toFixed(2)}`,
		},
	};
};

export const DataVisuals = () => {
	const { data } = useCitations();
	const isFetching = useIsFetching({ queryKey: ["citations"] });
	const stats = calculateStatistics(data?.features);

	const items = [
		{ label: "Total Citations", value: stats.citations.total },
		{ label: "Total Fines", value: stats.fines.total },
		{ label: "Average Fine", value: stats.fines.average },
	];

	return (
		<div className="grid grid-cols-3 gap-4">
			{items.map(({ label, value }) => (
				<Card
					key={label}
					className="@container/card">
					<CardHeader>
						<CardDescription>{label}</CardDescription>
						<CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-2xl">
							{isFetching ? "--" : value}
						</CardTitle>
					</CardHeader>
				</Card>
			))}
		</div>
	);
};
