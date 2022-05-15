import { useAtomCache } from "react-use-cache";

async function getVoiceDirectory(resourceDirectory: FileSystemDirectoryHandle) {
  return await ["sound_native", "voice"].reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
}

export function useVoiceDirectory(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
) {
  const cache = useAtomCache(getVoiceDirectory, resourceDirectory);

  return cache as readonly [
    voiceDirectory: typeof cache[0],
    loader: typeof cache[1],
  ];
}

export default useVoiceDirectory;
