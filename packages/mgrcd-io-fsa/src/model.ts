import Hjson from "hjson";
import type { ModelParam } from "mgrcd-resource";

export async function* getModelDirectories(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const scenarioDirectory = await ["image_native", "live2d_v4"].reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
  for await (const [name, entry] of scenarioDirectory.entries()) {
    const id = name.match(/^(?<id>\d{6})$/)?.groups?.id;
    if (id !== undefined && entry instanceof FileSystemDirectoryHandle) {
      const modelId = +id;
      yield [modelId, entry] as [modelId: typeof modelId, file: typeof entry];
    }
  }
}

export async function getModelFile(modelDirectory: FileSystemDirectoryHandle) {
  return await modelDirectory
    .getFileHandle("model.model3.json");
}

export async function getModelParamFile(
  modelDirectory: FileSystemDirectoryHandle,
) {
  return await modelDirectory
    .getFileHandle("params.json");
}

export async function* getExModelFiles(
  modelDirectory: FileSystemDirectoryHandle,
) {
  for await (const [name, entry] of modelDirectory.entries()) {
    const exModelId = name.match(/^model-(?<id>.*)\.model3\.json$/)?.groups
      ?.id;
    if (exModelId !== undefined && entry instanceof FileSystemFileHandle) {
      yield [exModelId, entry] as [
        exModelId: typeof exModelId,
        file: typeof entry,
      ];
    }
  }
}

export async function getModel(modelFile: FileSystemFileHandle) {
  return await modelFile.getFile()
    .then((file) => file.text())
    .then((json) => JSON.parse(json));
}

export async function getModelParam(modelParamFile: FileSystemFileHandle) {
  return await modelParamFile.getFile()
    .then((file) => file.text())
    .then((json) => {
      try {
        return JSON.parse(json) as ModelParam;
      } catch {
        return Hjson.parse(json) as ModelParam;
      }
    });
}
