import { Card, CardDescription, CardHeader, CardTitle } from "@lucky-parking/design/components";
import { useIsFetching } from "@tanstack/react-query";
import { useCitations } from "@/hooks/use-citations";

export const DataVisuals = () => {
	const { data, error } = useCitations();
	const isFetching = useIsFetching({ queryKey: ["citations"] });
	const meta = data?.meta;

	const items = [
		{ label: "Total Citations", value: meta?.total.toLocaleString() ?? "--" },
		{ label: "Total Fines", value: meta ? `$${meta.total_fine.toFixed(2)}` : "--" },
		{ label: "Average Fine", value: meta ? `$${meta.average_fine.toFixed(2)}` : "--" },
	];

	return (
		<div className="flex flex-col gap-4">
			{error ? <p role="alert">{error.message}</p> : null}
			{meta?.truncated ? (
				<p>
					Map shows the newest {meta.returned.toLocaleString()} of {meta.total.toLocaleString()} matches. Totals include
					all matches.
				</p>
			) : null}
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
		</div>
	);
};
