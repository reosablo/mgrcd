import { getExModelWritable } from "mgrcd-io-fsa";
import { useEffect, useState } from "react";

export function useExModelWritable(
  modelDirectory: FileSystemDirectoryHandle | undefined,
  exModelId: string | undefined,
) {
  const [exModelWritable, setExModelWritable] = useState<
    FileSystemWritableFileStream
  >();

  useEffect(() => {
    if (modelDirectory === undefined || exModelId === undefined) {
      return;
    }
    (async () =>
      setExModelWritable(
        await getExModelWritable(modelDirectory, exModelId),
      ))();
  }, [exModelId, modelDirectory]);

  return [exModelWritable] as readonly [
    exModelWritable: typeof exModelWritable,
  ];
}

export default useExModelWritable;
