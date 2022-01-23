import { atom, useAtom, type PrimitiveAtom } from "jotai";
import { useEffect, useMemo } from "react";

export type LoaderState<Data = unknown> = {
  /** last successfully loaded value */
  readonly data?: Awaited<Data>;
  /** current loading promise (will be unset when loaded) */
  readonly loading?: Data;
  /** last error (will be unset when successfully loaded) */
  readonly error?: unknown;
};

type LoaderStateAtomStore = WeakMap<object, PrimitiveAtom<LoaderState>>;

type LoaderStateAtomStoreStore = WeakMap<object, LoaderStateAtomStore>;

const loaderStateAtomStoreStoreAtom = atom(
  () => new WeakMap() as LoaderStateAtomStoreStore
);

const undefinedSourceAtom = atom({} as LoaderState<unknown>, () => {
  throw new Error(`invalid operation: source is undefined`);
});

export function useAtomCache<Source extends object, Data>(
  loadFrom: (source: Source) => Data,
  source: Source | undefined
) {
  const loaderStateAtomStoreStore = useAtom(loaderStateAtomStoreStoreAtom)[0];

  const loaderStateAtom =
    source === undefined
      ? undefinedSourceAtom
      : (() => {
          const loaderStateAtomStore =
            loaderStateAtomStoreStore.get(loadFrom) ??
            (() => {
              const loaderStateAtomStore =
                new WeakMap() as LoaderStateAtomStore;
              loaderStateAtomStoreStore.set(loadFrom, loaderStateAtomStore);
              return loaderStateAtomStore;
            })();
          const loaderStateAtom =
            loaderStateAtomStore.get(source) ??
            (() => {
              const loaderStateAtom = atom({} as LoaderState);
              loaderStateAtomStore.set(source, loaderStateAtom);
              return loaderStateAtom;
            })();
          return loaderStateAtom;
        })();

  const reloadAtom = useMemo(
    () =>
      source === undefined
        ? undefinedSourceAtom
        : atom(undefined, async (get, set) => {
            const loading = get(loaderStateAtom).loading;
            if (loading !== undefined) {
              try {
                await loading;
              } catch {
                return;
              }
            } else {
              const loading = loadFrom(source);
              set(loaderStateAtom, (state) => ({ ...state, loading }));
              try {
                set(loaderStateAtom, { data: await loading });
              } catch (error) {
                set(loaderStateAtom, (state) => ({ data: state.data, error }));
              }
            }
          }),
    [loadFrom, loaderStateAtom, source]
  );

  const loadAtom = useMemo(
    () =>
      source === undefined
        ? undefinedSourceAtom
        : atom(undefined, async (get, set) => {
            const loaderState = get(loaderStateAtom);
            if ("data" in loaderState || "error" in loaderState) {
              return;
            }
            await set(reloadAtom);
          }),
    [loaderStateAtom, reloadAtom, source]
  );

  const loaderState = useAtom(loaderStateAtom)[0] as LoaderState<Data>;
  const { data, loading } = loaderState;
  const load: () => Promise<void> = useAtom(loadAtom)[1];
  const reload: () => Promise<void> = useAtom(reloadAtom)[1];

  const loader = useMemo(
    () =>
      ({
        ...("error" in loaderState ? { error: loaderState.error } : {}),
        ...(source !== undefined ? { load, reload } : {}),
        loading: !!loading,
      } as const),
    [loaderState, source, load, reload, loading]
  );

  useEffect(() => {
    if (source !== undefined) {
      load();
    }
  }, [load, source]);

  return useMemo(
    () => [data, loader] as readonly [data: typeof data, loader: typeof loader],
    [data, loader]
  );
}

export default useAtomCache;
