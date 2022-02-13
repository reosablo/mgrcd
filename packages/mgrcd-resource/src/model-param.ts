import Hjson from "hjson";

export type ModelParam = {
  charaName: string;
  modelScale?: number;
};

export async function parseModelParam(modelParamData: string) {
  return Hjson.parse(modelParamData) as ModelParam;
}
