import React from "react";
import ListLayout from "./lib/ListLayout";
import ModelList from "./lib/ModelList";
import useResourceDirectory from "./lib/useResourceDirectory";
import useScenarioIds from "./lib/useScenarioIds";

export function ScenarioListPage() {
  const [resourceDirectory] = useResourceDirectory();
  const [scenarioIds] = useScenarioIds(resourceDirectory);

  return (
    <ListLayout title="Scenario">
      <ModelList
        modelIds={scenarioIds ?? []}
        linkTo={(scenarioId) => `${scenarioId}`}
      />
    </ListLayout>
  );
}

export default ScenarioListPage;
