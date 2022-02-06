import {
  getModelParam as loadModelParam,
  getModelParamFile,
} from "mgrcd-io-fsa";
import { useMemo } from "react";
import { useAtomCache } from "react-use-cache";
import useModelDirectories from "./io/useModelDirectories";

async function getModelParam(modelDirectory: FileSystemDirectoryHandle) {
  const modelParamFile = await getModelParamFile(modelDirectory);
  return await loadModelParam(modelParamFile);
}

export function useModelParam(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
  modelId: number | undefined,
) {
  const [modelDirectories, { error: modelDirectoriesError }] =
    useModelDirectories(resourceDirectory);
  const modelDirectory = modelId !== undefined
    ? modelDirectories?.[modelId]
    : undefined;
  const [modelParam, cacheLoader] = useAtomCache(getModelParam, modelDirectory);
  const { error } = cacheLoader;

  const loader = useMemo(
    () => ({ ...cacheLoader, error: modelDirectoriesError ?? error } as const),
    [cacheLoader, error, modelDirectoriesError],
  );

  return useMemo(
    () =>
      [modelParam, loader] as readonly [
        modelParam: typeof modelParam,
        loader: typeof loader,
      ],
    [loader, modelParam],
  );
}

export default useModelParam;
