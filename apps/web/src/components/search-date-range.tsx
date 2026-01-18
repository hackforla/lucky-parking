import {
	Button,
	Calendar,
	Card,
	CardContent,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Separator,
} from "@lucky-parking/design/components";
import { endOfDay, startOfDay, startOfYear, subDays, subMonths, subYears } from "date-fns";
import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { StrictDataRange } from "@/store";

const presets = [
	{ label: "Year to Date", range: { from: startOfDay(startOfYear(new Date())), to: endOfDay(new Date()) } },
	{ label: "Last 12 Months", range: { from: startOfDay(subYears(new Date(), 1)), to: endOfDay(new Date()) } },
	{ label: "Last 6 Months", range: { from: startOfDay(subMonths(new Date(), 6)), to: endOfDay(new Date()) } },
	{ label: "Last 3 Months", range: { from: startOfDay(subMonths(new Date(), 3)), to: endOfDay(new Date()) } },
	{ label: "Last 30 Days", range: { from: startOfDay(subMonths(new Date(), 29)), to: endOfDay(new Date()) } },
	{ label: "Last 7 Days", range: { from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) } },
];

export const SearchDateRange = () => {
	const [range, setRange] = useStore((state) => [state.range, state.setRange]);
	const [month, setMonth] = useState<Date>(new Date());

	const onPresetClick = (range: StrictDataRange) => {
		setRange(range);
		setMonth(range.from);
	};

	const onTodayClick = () => {
		setMonth(new Date());
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className="w-auto px-4"
					variant="outline"
					size="icon">
					<CalendarRange />
					{range?.from?.toLocaleDateString()} - {range?.to?.toLocaleDateString()}
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className="w-auto p-0"
				align="start">
				<Card>
					<CardContent className="flex space-x-4">
						<Calendar
							mode="range"
							month={month}
							onMonthChange={setMonth}
							selected={range}
							onSelect={setRange}
							numberOfMonths={2}
							required
							className="rounded-lg border"
						/>
						<div className="flex flex-col space-y-2">
							<Button onClick={onTodayClick}>Today</Button>

							<Separator />

							{presets.map(({ label, range }) => (
								<Button
									key={label}
									onClick={() => onPresetClick(range)}
									size="sm"
									variant="outline">
									{label}
								</Button>
							))}
						</div>
					</CardContent>
				</Card>
			</PopoverContent>
		</Popover>
	);
};
