import { useMemo } from "react";
import useCardImageFiles from "./io/useCardImageFiles";

export function useRarities(
  resourceDirectory: FileSystemDirectoryHandle,
  characterId: number,
) {
  const [cardImageFiles, loader] = useCardImageFiles(resourceDirectory);
  const rarities = useMemo(
    () =>
      cardImageFiles === undefined ? undefined : Object.keys(cardImageFiles)
        .filter((cardImageId) => cardImageId.startsWith(`${characterId}`))
        .map((cardImageId) => +cardImageId.slice(-1)),
    [cardImageFiles, characterId],
  );

  return useMemo(
    () =>
      [rarities, loader] as readonly [
        rarities: typeof rarities,
        loader: typeof loader,
      ],
    [loader, rarities],
  );
}
