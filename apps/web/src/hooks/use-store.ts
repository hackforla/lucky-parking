import { store, type Store } from "store";
import type { StoreApi } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

/* ——————————————— Overloads ——————————————— */

/**
 * Provides the selected slice of state from the global Zustand store,
 * subscribing only to changes to the slice based on shallow equality.
 * @param selector
 */
export function useStore<TSelected>(selector: (state: Store) => TSelected): TSelected;

/**
 * Provides the full state from the global Zustand store,
 * subscribing to every state change.
 * @remarks Not recommended. This may cause unnecessary re-renders.
 */
export function useStore(): Store;

/* ——————————————— Implementation ——————————————— */

/**
 * Provides the full state from the global Zustand store,
 * subscribing to any relevant changes to the state.
 * @remarks Used only for client components.
 * @param selector
 */
export function useStore<TSelected>(selector?: (state: Store) => TSelected): Store | TSelected {
	return useStoreWithEqualityFn(store as StoreApi<Store>, selector ?? ((s) => s as unknown as TSelected), shallow);
}
