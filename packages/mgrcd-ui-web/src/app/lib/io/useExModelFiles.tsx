import { getExModelFiles } from "mgrcd-io-fsa";
import { useAtomCache } from "react-use-cache";
import useModelDirectories from "./useModelDirectories";

export type ExModelFiles = {
  readonly [exModelId: string]: FileSystemFileHandle | undefined;
};

async function collectExModelFiles(modelDirectory: FileSystemDirectoryHandle) {
  const exModelFiles: { [Id in keyof ExModelFiles]: ExModelFiles[Id] } = {};
  for await (
    const [exModelId, exModelFile] of getExModelFiles(modelDirectory)
  ) {
    exModelFiles[exModelId] = exModelFile;
  }
  return exModelFiles as ExModelFiles;
}

export function useExModelFiles(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
  modelId: number | undefined,
) {
  const [modelDirectories] = useModelDirectories(resourceDirectory);
  const modelDirectory = modelId !== undefined
    ? modelDirectories?.[modelId]
    : undefined;
  const cache = useAtomCache(collectExModelFiles, modelDirectory);

  return cache as readonly [
    exModelFiles: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useExModelFiles;
