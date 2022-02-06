import { atom, useAtom } from "jotai";

const lastBakeParamsAtom = atom(undefined as URLSearchParams | undefined);

export function useLastBakeParams() {
  return useAtom(lastBakeParamsAtom);
}

export default useLastBakeParams;
