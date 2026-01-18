import { endOfDay, startOfDay, subDays } from "date-fns";
import { enableMapSet } from "immer";
import { type Result as MapboxGeocoderResult } from "mapbox__mapbox-gl-geocoder";
import { type DateRange } from "react-day-picker";
import { Mutate, StoreApi } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";
import { GeocoderResult, NonNullableProperties } from "@/types";

enableMapSet();

export const MAX_PLACES = 2;

export type StrictDataRange = Required<NonNullableProperties<DateRange>>;

export type Store = {
	/* ——————————————— State ——————————————— */
	query: string;
	range: StrictDataRange;
	places: Map<string, GeocoderResult>;
	isHydrated: boolean;
	/* ——————————————— Selectors ——————————————— */
	getPlaces: () => GeocoderResult[];
	/* ——————————————— Actions ——————————————— */
	setQuery: (query: string) => void;
	clearQuery: () => void;
	setRange: (range: DateRange) => void;
	addPlace: (place: GeocoderResult) => void;
	removePlace: (id: MapboxGeocoderResult["id"]) => void;
	clearPlaces: () => void;
	setIsHydrated: (value: boolean) => void;
};

type PersistedStore = { range: readonly [string, string]; places: [string, GeocoderResult][] };

type BoundStore = Mutate<
	StoreApi<Store>,
	[["zustand/immer", never], ["zustand/persist", unknown], ["zustand/devtools", never]]
>;

export const store: BoundStore = createStore<Store>()(
	devtools(
		persist(
			/* ——————————————— Store ——————————————— */
			immer((set, get) => ({
				/* ——————————————— Query Slice ——————————————— */
				query: "",
				setQuery: (query) =>
					set((state) => {
						state.query = query;
					}),
				clearQuery: () =>
					set((state) => {
						state.query = "";
					}),

				/* ——————————————— Range Slice ——————————————— */
				range: { from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) },
				setRange: (range) =>
					set((state) => {
						if (!range?.from || !range?.to) return;
						state.range = { from: startOfDay(range.from), to: endOfDay(range.to) };
					}),

				/* ——————————————— Place Slice ——————————————— */
				places: new Map(),
				getPlaces: () => Array.from(get().places.values()),
				addPlace: (place) =>
					set((state) => {
						if (state.places.size >= MAX_PLACES) return;
						state.places.set(String(place.id), place);
					}),
				removePlace: (id) =>
					set((state) => {
						if (!id) return;
						state.places.delete(String(id));
					}),
				clearPlaces: () =>
					set((state) => {
						state.places.clear();
					}),

				/* ——————————————— Metadata Slice ——————————————— */
				isHydrated: false,
				setIsHydrated: (value) =>
					set((state) => {
						state.isHydrated = value;
					}),
			})),
			/* ——————————————— Persistence ——————————————— */
			{
				name: "luckyparking",
				storage: createJSONStorage(() => localStorage),
				// skipHydration: true, // Manual hydration
				partialize: (state): PersistedStore => ({
					range: [state.range.from.toISOString(), state.range.to.toISOString()] as const,
					places: Array.from(state.places.entries()),
				}),
				merge: (persisted, current) => {
					const p = persisted as PersistedStore;
					return {
						...current,
						range: p?.range ? { from: new Date(p.range[0]), to: new Date(p.range[1]) } : current.range,
						places: new Map(p?.places ?? []),
					};
				},
				onRehydrateStorage: () => (state) => {
					state?.setIsHydrated?.(true);
				},
			}
		),
		/* ——————————————— Devtools ——————————————— */
		{ name: "Store" }
	)
);
