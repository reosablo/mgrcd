import { getMiniImageFiles } from "mgrcd-io-fsa";
import { useAtomCache } from "react-use-cache";

export type MiniImageFiles = {
  readonly [miniImageId: number]: FileSystemFileHandle;
};

async function collectMiniImageFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const miniImageFiles: { [Id in keyof MiniImageFiles]: MiniImageFiles[Id] } =
    {};
  for await (
    const [miniImageId, miniImageFile] of getMiniImageFiles(resourceDirectory)
  ) {
    miniImageFiles[miniImageId] = miniImageFile;
  }
  return miniImageFiles as MiniImageFiles;
}

export function useMiniImageFiles(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const cache = useAtomCache(collectMiniImageFiles, resourceDirectory);

  return cache as readonly [
    miniImageFiles: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useMiniImageFiles;
