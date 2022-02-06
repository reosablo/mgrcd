import { useMemo } from "react";
import useScenarioFiles from "./io/useScenarioFiles";

export function useScenarioIds(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const [scenarioFiles, loader] = useScenarioFiles(resourceDirectory);
  const scenarioIds = useMemo(
    () =>
      scenarioFiles !== undefined
        ? Object.keys(scenarioFiles)
          .filter((name) => /^\d+$/.test(name))
          .map((id) => +id)
        : undefined,
    [scenarioFiles],
  );

  return useMemo(
    () =>
      [scenarioIds, loader] as readonly [
        scenarioIds: typeof scenarioIds,
        loader: typeof loader,
      ],
    [scenarioIds, loader],
  );
}

export default useScenarioIds;
