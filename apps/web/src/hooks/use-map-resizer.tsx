import { useEffect } from "react";
import { MapRef } from "react-map-gl/mapbox";
import { AnyRef } from "@/types";

export const useMapResizer = (mapRef: AnyRef<MapRef>, containerRef: AnyRef<HTMLElement | HTMLDivElement>) => {
	useEffect(() => {
		if (!containerRef.current) return;

		const ro = new ResizeObserver(() => {
			requestAnimationFrame(() => mapRef.current?.resize());
		});

		ro.observe(containerRef.current);
		requestAnimationFrame(() => mapRef.current?.resize());

		return () => ro.disconnect();
	}, [containerRef, mapRef]);
};
