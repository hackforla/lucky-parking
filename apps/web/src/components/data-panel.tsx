import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@lucky-parking/design/components";
import { DataAbout } from "@/components/data-about";
import { DataLegeend } from "@/components/data-legend";
import { DataPlaceList } from "@/components/data-place-list";
import { useStore } from "@/hooks/use-store";
import { MAX_PLACES } from "@/store";
import { DataVisuals } from "./data-visuals";

export const DataPanel = () => {
	const places = useStore((state) => state.getPlaces());

	const items = [
		{ label: `Places (${places.length}/${MAX_PLACES})`, DataPanelItem: DataPlaceList },
		{ label: "Data", DataPanelItem: DataVisuals },
		{ label: "Legend", DataPanelItem: DataLegeend },
		{ label: "About", DataPanelItem: DataAbout },
	];

	return (
		<Accordion
			type="multiple"
			className="w-full"
			defaultValue={["0", "1"]}>
			{items.map(({ label, DataPanelItem }, index) => (
				<AccordionItem
					key={`data-panel-${index + 1}`}
					value={String(index)}>
					<AccordionTrigger>{label}</AccordionTrigger>
					<AccordionContent className="flex flex-col gap-4 text-balance">
						<DataPanelItem />
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
};
