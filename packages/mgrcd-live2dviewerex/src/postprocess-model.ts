import type { Model } from "live2dviewerex";

export function postprocessModel(model: Model, roleId: number) {
  const controllers = model.Controllers ??= {};
  const options = model.Options ??= {};
  const intimacyMaxValue = Object.values(model.FileReferences.Motions ?? {})
    .flat()
    .reduce(
      (intimacyMaxValue, motion) =>
        motion.Intimacy?.Min
          ? Math.max(intimacyMaxValue ?? 0, motion.Intimacy.Min)
          : intimacyMaxValue,
      undefined as number | undefined,
    );
  controllers.IntimacySystem = {
    Enabled: true,
    MaxValue: intimacyMaxValue,
  };
  options.Id = `${roleId}`;
  options.AnisoLevel = 2;
}
