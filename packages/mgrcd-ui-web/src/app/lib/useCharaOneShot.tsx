import { getScenario } from "mgrcd-io-fsa";
import { useClosureCache } from "react-use-cache";
import useCharaOneShotFiles from "./io/useCharaOneShotFiles";

export function useCharaOneShot(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
  charaOneShotId: number | undefined,
) {
  const [charaOneShotFiles] = useCharaOneShotFiles(resourceDirectory);
  const charaOneShotFile = charaOneShotId !== undefined
    ? charaOneShotFiles?.[charaOneShotId]
    : undefined;
  const cache = useClosureCache(getScenario, charaOneShotFile);

  return cache as readonly [
    charaOneShot: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useCharaOneShot;
