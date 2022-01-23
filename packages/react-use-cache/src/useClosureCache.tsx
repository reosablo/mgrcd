import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LoaderState } from "./useAtomCache";

export function useClosureCache<Source extends object, Data>(
  loadFrom: (source: Source) => Data,
  source: Source | undefined
) {
  const [loaderState, setLoaderState] = useState({} as LoaderState<Data>);
  const { data, loading } = loaderState;
  const loadingRef = useRef(loaderState.loading);

  const reload = useCallback(async () => {
    if (source === undefined) {
      throw new Error(`invalid operation: source is undefined`);
    }
    if (loadingRef.current !== undefined) {
      try {
        await loadingRef.current;
      } catch {
        return;
      }
    } else {
      const loading = loadFrom(source);
      loadingRef.current = loading;
      setLoaderState((state) => ({ ...state, loading }));
      try {
        setLoaderState({ data: await loading });
      } catch (error) {
        setLoaderState((state) => ({ data: state.data, error }));
      } finally {
        loadingRef.current = undefined;
      }
    }
  }, [loadFrom, source]);

  const load = useCallback(async () => {
    if ("data" in loaderState || "error" in loaderState) {
      return;
    }
    await reload();
  }, [loaderState, reload]);

  const unload = useCallback(() => {
    setLoaderState(({ loading }) => ({ loading }));
  }, []);

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
      reload();
    } else {
      unload();
    }
  }, [reload, source, unload]);

  return useMemo(
    () => [data, loader] as readonly [data: typeof data, loader: typeof loader],
    [data, loader]
  );
}

export default useClosureCache;
