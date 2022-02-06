import { getScenarioFiles } from "mgrcd-io-fsa";
import { useAtomCache } from "react-use-cache";

export type ScenarioFiles = {
  readonly [id: string]: FileSystemFileHandle | undefined;
};

async function collectScenarioFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const scenarioFiles: { [Id in keyof ScenarioFiles]: ScenarioFiles[Id] } = {};
  for await (
    const [scenarioId, scenarioFile] of getScenarioFiles(resourceDirectory)
  ) {
    scenarioFiles[scenarioId] = scenarioFile;
  }
  return scenarioFiles as ScenarioFiles;
}

export function useScenarioFiles(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const cache = useAtomCache(collectScenarioFiles, resourceDirectory);

  return cache as readonly [
    scenarioFiles: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useScenarioFiles;
