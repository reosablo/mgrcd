import { getModelDirectories } from "mgrcd-io-fsa";
import { useAtomCache } from "react-use-cache";

export type ModelDirectories = {
  readonly [modelId: number]: FileSystemDirectoryHandle;
};

async function collectModelDirectories(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const modelDirectories: {
    [Id in keyof ModelDirectories]: ModelDirectories[Id];
  } = {};
  for await (
    const [modelId, modelDirectory] of getModelDirectories(resourceDirectory)
  ) {
    modelDirectories[modelId] = modelDirectory;
  }
  return modelDirectories as ModelDirectories;
}

export function useModelDirectories(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const cache = useAtomCache(collectModelDirectories, resourceDirectory);

  return cache as readonly [
    modelDirectories: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useModelDirectories;
