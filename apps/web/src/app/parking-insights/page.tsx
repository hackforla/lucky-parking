"use client";

import { SidebarInset, SidebarProvider } from "@lucky-parking/design/components";
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MapProvider, useMap } from "react-map-gl/mapbox";
import { AppHeader } from "@/components/header";
import { ParkingCitationsMap } from "@/components/map";
import { AppSidebar } from "@/components/sidebar";
import { useStore } from "@/hooks/use-store";

const queryClient = new QueryClient();

export default function App() {
	const store = useStore((state) => ({ isHydrated: state.isHydrated }));
	const { map } = useMap();

	if (!store.isHydrated) return null;

	return (
		<QueryClientProvider client={queryClient}>
			<MapProvider>
				<div className="flex h-screen flex-col">
					<SidebarProvider
						style={
							{
								"--sidebar-width": "calc(var(--spacing) * 128)",
								"--header-height": "calc(var(--spacing) * 12)",
							} as React.CSSProperties
						}>
						<AppSidebar variant="inset" />

						{/* make sure the inset area can be a full-height flex column */}
						<SidebarInset className="relative flex min-h-0 flex-1 flex-col">
							<AppHeader />

							{/* THIS is the “rest of the screen under the header” */}
							<div className="flex min-h-0 flex-1 flex-col">
								{/* if you want padding around the map, keep it here */}
								<div className="flex min-h-0 flex-1 flex-col px-4 py-4 md:py-6 lg:px-6">
									{/* map must have a parent with an actual height */}
									<div className="min-h-0 flex-1">
										<ParkingCitationsMap />
									</div>
								</div>
							</div>
						</SidebarInset>
					</SidebarProvider>
				</div>
			</MapProvider>

			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}
