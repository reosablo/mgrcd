import { useMemo } from "react";
import useModelDirectories from "./io/useModelDirectories";

export function useModelIds(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const [modelDirectories, loader] = useModelDirectories(resourceDirectory);
  const modelIds = useMemo(
    () =>
      modelDirectories !== undefined
        ? Object.keys(modelDirectories).map((id) => +id)
        : undefined,
    [modelDirectories],
  );

  return useMemo(
    () =>
      [modelIds, loader] as readonly [
        modelIds: typeof modelIds,
        loader: typeof loader,
      ],
    [loader, modelIds],
  );
}

export default useModelIds;
