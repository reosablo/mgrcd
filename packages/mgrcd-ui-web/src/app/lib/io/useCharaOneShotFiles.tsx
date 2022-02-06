import { getCharaOneShotFiles } from "mgrcd-io-fsa";
import { useAtomCache } from "react-use-cache";

export type CharaOneShotFiles = {
  readonly [scenarioId: number]: FileSystemFileHandle | undefined;
};

async function collectCharaOneShotFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const charaOneShotFiles: {
    [Id in keyof CharaOneShotFiles]: CharaOneShotFiles[Id];
  } = {};
  for await (
    const [scenarioId, charaOneShotFile] of getCharaOneShotFiles(
      resourceDirectory,
    )
  ) {
    charaOneShotFiles[scenarioId] = charaOneShotFile;
  }
  return charaOneShotFiles;
}

export function useCharaOneShotFiles(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const cache = useAtomCache(collectCharaOneShotFiles, resourceDirectory);

  return cache as readonly [
    charaOneShotFiles: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useCharaOneShotFiles;
