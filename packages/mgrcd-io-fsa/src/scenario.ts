import type { Scenario } from "mgrcd-resource";

export async function* getScenarioFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const scenarioDirectory = await ["scenario", "json", "general"].reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
  for await (const [name, entry] of scenarioDirectory.entries()) {
    const id = name.match(/^(?<id>\d{6})\.json$/)?.groups?.id;
    if (id !== undefined && entry instanceof FileSystemFileHandle) {
      const scenarioId = +id;
      yield [scenarioId, entry] as [
        scenarioId: typeof scenarioId,
        file: typeof entry,
      ];
    }
  }
}

export async function* getCharaOneShotFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const charaOneShotDirectory = await [
    "scenario",
    "json",
    "charaOneShot",
  ].reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
  for await (const [name, entry] of charaOneShotDirectory.entries()) {
    const id = name.match(/^(?<id>\d{6})\.json$/)?.groups?.id;
    if (id !== undefined && entry instanceof FileSystemFileHandle) {
      const scenarioId = +id;
      yield [scenarioId, entry] as [
        scenarioId: typeof scenarioId,
        file: typeof entry,
      ];
    }
  }
}

export async function getScenario(scenarioFile: FileSystemFileHandle) {
  return await scenarioFile
    .getFile()
    .then((file) => file.text())
    .then((json) => JSON.parse(json) as Scenario);
}

export async function* getActorIds(scenario: Scenario) {
  const actorIds = new Set<number | undefined>();
  for (const story of Object.values(scenario.story ?? {})) {
    for (const scene of story) {
      for (const action of scene.chara ?? []) {
        const actorId = action.id;
        if (!actorIds.has(actorId)) {
          yield actorId;
          actorIds.add(actorId);
        }
      }
    }
  }
}
