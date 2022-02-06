import { useAtomCache } from "react-use-cache";
import useMiniImageFiles from "./io/useMiniImageFiles";

const miniImageUrlRevokeRegistry = new FinalizationRegistry(
  (miniImageUrl: string) => URL.revokeObjectURL(miniImageUrl),
);

async function getMiniImageUrl(miniImageFile: FileSystemFileHandle) {
  const miniImage = await miniImageFile.getFile();
  const miniImageUrl = URL.createObjectURL(miniImage);
  miniImageUrlRevokeRegistry.register(miniImageFile, miniImageUrl);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = (error) => reject(error);
    img.src = miniImageUrl;
  });

  return miniImageUrl;
}

export function useMiniImageUrl(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
  miniImageId: number | undefined,
) {
  const [miniImageFiles] = useMiniImageFiles(resourceDirectory);
  const miniImageFile = miniImageId !== undefined
    ? miniImageFiles?.[miniImageId]
    : undefined;
  const cache = useAtomCache(getMiniImageUrl, miniImageFile);

  return cache as readonly [
    miniImageUrl: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useMiniImageUrl;
