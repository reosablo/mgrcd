import { Model } from "live2d";
export { Model };

export async function parseModel(modelData: string) {
  return JSON.parse(modelData) as Model;
}

export function stringifyModel(
  model: Model,
  space?: Parameters<typeof JSON.stringify>[2],
) {
  return JSON.stringify(model, null, space);
}
