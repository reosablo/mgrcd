import { atom } from "jotai";
import {
  atomWithReset,
  useAtomValue,
  useResetAtom,
  useUpdateAtom,
} from "jotai/utils";
import { useMemo } from "react";

const resourceDirectoryAtom = atomWithReset(
  undefined as FileSystemDirectoryHandle | undefined,
);

const requestResourceDirectoryAtom = atom(undefined, async (_get, set) => {
  try {
    const resourceDirectory = await showDirectoryPicker();
    set(resourceDirectoryAtom, resourceDirectory);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }
    set(resourceDirectoryAtom, undefined);
    throw error;
  }
});

export function useResourceDirectory() {
  const resourceDirectory = useAtomValue(resourceDirectoryAtom);
  const request: () => void = useUpdateAtom(requestResourceDirectoryAtom);
  const invalidate: () => void = useResetAtom(resourceDirectoryAtom);
  const loader = useMemo(
    () => ({ request, invalidate } as const),
    [invalidate, request],
  );

  return useMemo(
    () =>
      [resourceDirectory, loader] as readonly [
        resourceDirectory: typeof resourceDirectory,
        loader: typeof loader,
      ],
    [loader, resourceDirectory],
  );
}

export default useResourceDirectory;
