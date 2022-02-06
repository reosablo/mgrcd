import { useMemo } from "react";
import useCharaOneShotFiles from "./io/useCharaOneShotFiles";

export function useCharaOneShotIds(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const [charaOneShotFiles, loader] = useCharaOneShotFiles(resourceDirectory);
  const charaOneShotIds = useMemo(
    () =>
      charaOneShotFiles !== undefined
        ? Object.keys(charaOneShotFiles)
          .filter((name) => /^\d+$/.test(name))
          .map((id) => +id)
        : undefined,
    [charaOneShotFiles],
  );

  return useMemo(
    () =>
      [charaOneShotIds, loader] as readonly [
        charaOneShotIds: typeof charaOneShotIds,
        loader: typeof loader,
      ],
    [charaOneShotIds, loader],
  );
}

export default useCharaOneShotIds;
