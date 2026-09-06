import { useCallback, useSyncExternalStore } from "react";

export function useIsMobile(mobileBreakpoint = 768) {
	const mediaQuery = `(max-width: ${mobileBreakpoint - 1}px)`;
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			const mql = window.matchMedia(mediaQuery);
			mql.addEventListener("change", onStoreChange);
			return () => mql.removeEventListener("change", onStoreChange);
		},
		[mediaQuery]
	);
	const getSnapshot = useCallback(() => window.matchMedia(mediaQuery).matches, [mediaQuery]);
	const getServerSnapshot = useCallback(() => false, []);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
