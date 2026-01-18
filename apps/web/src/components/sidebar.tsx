import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@lucky-parking/design/components";
import { IconInnerShadowTop } from "@tabler/icons-react";
import Link from "next/link";
import { ComponentProps } from "react";
import { DataPanel } from "@/components/data-panel";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar
			collapsible="offcanvas"
			{...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!">
							<Link href="/">
								<IconInnerShadowTop className="size-5!" />
								<span className="text-base font-semibold">Lucky Parking</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="px-4">
				<DataPanel />
			</SidebarContent>
		</Sidebar>
	);
}
