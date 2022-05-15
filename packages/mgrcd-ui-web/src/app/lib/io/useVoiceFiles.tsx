import { getVoiceFiles } from "mgrcd-io-fsa";
import { useAtomCache } from "react-use-cache";

export type VoiceFiles = {
  readonly [id: string]: FileSystemFileHandle | undefined;
};

async function collectVoiceFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const voiceFiles: { [Id in keyof VoiceFiles]: VoiceFiles[Id] } = {};
  for await (
    const [voiceId, voiceFile] of getVoiceFiles(resourceDirectory)
  ) {
    voiceFiles[voiceId] = voiceFile;
  }
  return voiceFiles as VoiceFiles;
}

export function useVoiceFiles(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const cache = useAtomCache(collectVoiceFiles, resourceDirectory);

  return cache as readonly [
    voiceFiles: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useVoiceFiles;
