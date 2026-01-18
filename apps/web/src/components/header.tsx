import { SidebarTrigger } from "@lucky-parking/design/components";
import { Loader } from "@/components/loader";
import { SearchDateRange } from "@/components/search-date-range";
import { SearchGeocoder } from "@/components/search-geocoder";

export function AppHeader() {
	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-2" />

				<div className="flex w-full items-center space-x-2">
					<div className="-1 flex w-96">
						<SearchGeocoder />
					</div>

					<div className="shrink-0">
						<SearchDateRange />
					</div>
				</div>

				<div className="ml-auto">
					<Loader />
				</div>
			</div>
		</header>
	);
}
