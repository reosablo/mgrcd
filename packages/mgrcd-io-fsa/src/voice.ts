const voiceDirectoryPath = ["sound_native", "voice"] as const;
const fullVoiceDirectoryPath = ["sound_native", "fullVoice"] as const;

export async function* getVoiceFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const voiceDirectory = await voiceDirectoryPath.reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
  for await (const [name, entry] of voiceDirectory.entries()) {
    if (/\.hca/.test(name) && entry instanceof FileSystemFileHandle) {
      yield [name, entry] as [
        name: typeof name,
        file: typeof entry,
      ];
    }
  }
}

export async function* getFullVoiceFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const fullVoiceDirectory = await fullVoiceDirectoryPath.reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
  for await (const [name, entry] of fullVoiceDirectory.entries()) {
    if (/\.hca/.test(name) && entry instanceof FileSystemFileHandle) {
      yield [name, entry] as [
        name: typeof name,
        file: typeof entry,
      ];
    }
  }
}
