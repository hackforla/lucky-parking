export function useMultiRefs() {
  const set = new Set();

  function getMultiRef() {
    return Array.from(set);
  }

  function addRef(ref: any): void {
    if (!ref) return;
    set.add(ref);
  }

  return [getMultiRef, addRef] as const;
}
