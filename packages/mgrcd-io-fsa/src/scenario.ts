import { parseScenario } from "mgrcd-resource";

const generalScenarioDirectoryPath = ["scenario", "json", "general"] as const;
const charaOneShotDirectoryPath = ["scenario", "json", "charaOneShot"] as const;

export async function* getScenarioFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const scenarioDirectory = await generalScenarioDirectoryPath.reduce(
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
  const charaOneShotDirectory = await charaOneShotDirectoryPath.reduce(
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
    .then((data) => parseScenario(data));
}
