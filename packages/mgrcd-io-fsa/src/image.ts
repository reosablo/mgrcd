export async function* getCardImageFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const cardImageDirectory = await ["image_native", "card", "image"].reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
  for await (const [name, entry] of cardImageDirectory.entries()) {
    const id = name.match(/^card_(?<id>\d{5})_d\.png$/)?.groups?.id;
    if (id !== undefined && entry instanceof FileSystemFileHandle) {
      const cardImageId = +id;
      yield [cardImageId, entry] as [
        cardImageId: typeof cardImageId,
        file: typeof entry,
      ];
    }
  }
}

export async function* getMiniImageFiles(
  resourceDirectory: FileSystemDirectoryHandle,
) {
  const miniImageDirectory = await ["image_native", "mini", "image"].reduce(
    async (directory, name) => (await directory).getDirectoryHandle(name),
    Promise.resolve(resourceDirectory),
  );
  for await (const [name, entry] of miniImageDirectory.entries()) {
    const id = name.match(/^mini_(?<id>\d{6})_d\.png$/)?.groups?.id;
    if (id !== undefined && entry instanceof FileSystemFileHandle) {
      const miniImageId = +id;
      yield [miniImageId, entry] as [
        miniImageId: typeof miniImageId,
        file: typeof entry,
      ];
    }
  }
}
