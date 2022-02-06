import { getCardImageFiles } from "mgrcd-io-fsa";
import { useAtomCache } from "react-use-cache";

export type CardImageFiles = {
  readonly [cardImageId: number]: FileSystemFileHandle;
};

async function collectCardImageFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const cardImageFiles: {
    [Id in keyof CardImageFiles]: CardImageFiles[Id];
  } = {};
  for await (
    const [cardImageId, cardImageFile] of getCardImageFiles(resourceDirectory)
  ) {
    cardImageFiles[cardImageId] = cardImageFile;
  }
  return cardImageFiles as CardImageFiles;
}

export function useCardImageFiles(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const cache = useAtomCache(collectCardImageFiles, resourceDirectory);

  return cache as readonly [
    cardImageFiles: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useCardImageFiles;
