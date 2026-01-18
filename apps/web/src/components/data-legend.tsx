// TODO: Refactor to use actual legend information
export const DataLegeend = () => {
	return (
		<>
			<div className="space-y-2">
				<div className="text-muted-foreground text-sm font-medium">Citation Density</div>

				<div className="flex items-center gap-2">
					<span className="text-muted-foreground text-xs">Low</span>

					<div className="h-3 w-40 rounded-sm bg-gradient-to-r from-transparent via-[#67a9cf] via-[#d1e5f0] via-[#fddbc7] to-[#ef8a62]" />

					<span className="text-muted-foreground text-xs">High</span>
				</div>
			</div>
			<div className="space-y-2">
				<div className="text-muted-foreground text-sm font-medium">Individual Citations</div>

				<div className="flex items-center gap-2">
					<span className="inline-block h-3 w-3 rounded-full border border-white bg-[#ef8a62] shadow-sm" />
					<span className="text-muted-foreground text-xs">One parking citation</span>
				</div>
			</div>
		</>
	);
};
