import { getScenario } from "mgrcd-io-fsa";
import { useClosureCache } from "react-use-cache";
import useScenarioFiles from "./io/useScenarioFiles";

export function useScenario(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
  scenarioId: number | undefined,
) {
  const [scenarioFiles] = useScenarioFiles(resourceDirectory);
  const scenarioFile = scenarioId !== undefined
    ? scenarioFiles?.[scenarioId]
    : undefined;
  const cache = useClosureCache(getScenario, scenarioFile);

  return cache as readonly [scenario: typeof cache[0], loader: typeof cache[1]];
}

export default useScenario;
