import {
  Model,
  parseModel,
  parseModelParam,
  stringifyModel,
} from "mgrcd-resource";

const modelDirectoryRootPath = ["image_native", "live2d_v4"] as const;
const modelFilename = "model.model3.json" as const;
const modelParamFilename = "params.json" as const;

export async function* getModelDirectories(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const modelDirectory = await modelDirectoryRootPath.reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
  for await (const [name, entry] of modelDirectory.entries()) {
    const id = name.match(/^(?<id>\d{6})$/)?.groups?.id;
    if (id !== undefined && entry instanceof FileSystemDirectoryHandle) {
      const modelId = +id;
      yield [modelId, entry] as [modelId: typeof modelId, file: typeof entry];
    }
  }
}

export async function getModelFile(modelDirectory: FileSystemDirectoryHandle) {
  return await modelDirectory.getFileHandle(modelFilename);
}

export async function getModelParamFile(
  modelDirectory: FileSystemDirectoryHandle,
) {
  return await modelDirectory.getFileHandle(modelParamFilename);
}

export async function getExModelWritable(
  modelDirectory: FileSystemDirectoryHandle,
  exModelId: string,
) {
  return await modelDirectory
    .getFileHandle(`model-${exModelId}.model3.json`, { create: true })
    .then((file) => file.createWritable());
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
    .then((data) => parseModel(data));
}

export async function setModel(
  exModelWritable: FileSystemWritableFileStream,
  model: Model,
) {
  const json = stringifyModel(model, "\t");
  await exModelWritable.write(json);
}

export async function getModelParam(modelParamFile: FileSystemFileHandle) {
  return await modelParamFile.getFile()
    .then((file) => file.text())
    .then((data) => parseModelParam(data));
}
