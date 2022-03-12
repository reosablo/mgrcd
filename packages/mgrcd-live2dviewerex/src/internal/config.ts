import type { Scenario } from "mgrcd-resource";
import type { Resolver as ResolverType } from "./install";

export const metaKey = Symbol("metaKey");

export const entryMotions = [
  ["Start", {
    Name: "Intro1",
    Priority: 9,
    Intimacy: { Max: 0 },
    [metaKey]: { voiceSuffix: "_01", spoiler: false },
  }],
  ["Start", {
    Name: "Intro2",
    Priority: 9,
    Intimacy: { Max: 0 },
    [metaKey]: { voiceSuffix: "_02", spoiler: false },
  }],
  ["Start", {
    Name: "GreetFirst",
    Priority: 9,
    Intimacy: { Min: 1, Bonus: 4 },
    [metaKey]: { voiceSuffix: "_24", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk1",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_33", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk2",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_34", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk3",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_35", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk4",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_36", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk5",
    Priority: 9,
    Intimacy: { Min: 8, Bonus: 1 },
    [metaKey]: { voiceSuffix: "_37", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk6",
    Priority: 9,
    Intimacy: { Min: 16, Bonus: 1 },
    [metaKey]: { voiceSuffix: "_38", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk7",
    Priority: 9,
    Intimacy: { Min: 24, Bonus: 1 },
    [metaKey]: { voiceSuffix: "_39", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk8",
    Priority: 9,
    Intimacy: { Min: 32, Bonus: 1 },
    [metaKey]: { voiceSuffix: "_40", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk9",
    Priority: 9,
    Intimacy: { Min: 40, Bonus: 1 },
    [metaKey]: { voiceSuffix: "_41", spoiler: false },
  }],
  ["Tap", {
    Name: "Talk10",
    Priority: 9,
    Intimacy: { Min: 48, Bonus: 1 },
    [metaKey]: { voiceSuffix: "_32", spoiler: true },
  }],
  ["Tap", {
    Name: "GreetMorning",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 6, Sustain: 180 },
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_25", spoiler: false },
  }],
  ["Tap", {
    Name: "GreetDay",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 11, Sustain: 120 },
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_26", spoiler: false },
  }],
  ["Tap", {
    Name: "GreetEvening",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 17, Sustain: 120 },
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_27", spoiler: false },
  }],
  ["Tap", {
    Name: "GreetNight",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 22, Sustain: 120 },
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_28", spoiler: false },
  }],
  ["Tap", {
    Name: "Greet",
    Priority: 9,
    ignorable: true,
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_29", spoiler: false },
  }],
  ["Tap", {
    Name: "GreetAP",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_30", spoiler: false },
  }],
  ["Tap", {
    Name: "GreetBP",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [metaKey]: { voiceSuffix: "_31", spoiler: false },
  }],
] as const;

export class Resolver implements ResolverType {
  getRoleId(...args: Parameters<ResolverType["getRoleId"]>) {
    const [actorId] = args;
    return actorId || undefined;
  }

  getModelId(...args: Parameters<ResolverType["getModelId"]>) {
    const [roleId] = args;
    return `${roleId}` as const;
  }

  getMotionIndex(...args: Parameters<ResolverType["getMotionIndex"]>) {
    switch (args[0]) {
      case "scene": {
        const [, storyId, sceneIndex] = args;
        return [`Story#1`, `${storyId}_${sceneIndex + 1}`] as const;
      }
      case "motion": {
        const [, motion] = args;
        return [`Motion#2`, `${motion}`] as const;
      }
      case "voice": {
        const [, voice] = args;
        return [`Voice#3`, voice] as const;
      }
      case "voiceFull": {
        const [, voiceFull] = args;
        return [`VoiceFull#3`, voiceFull] as const;
      }
      case "face": {
        const [, face] = args;
        const expressionId = extractExpressionId(face);
        return [
          `Face#4`,
          expressionId !== undefined ? `${expressionId}` : face,
        ] as const;
      }
    }
  }

  getExpressionName(...args: Parameters<ResolverType["getExpressionName"]>) {
    switch (args[0]) {
      case "face": {
        const [_type, face] = args;
        return patchFace(face);
      }
    }
  }

  getFilePath(...args: Parameters<ResolverType["getFilePath"]>) {
    switch (args[0]) {
      case "motion": {
        const [, motion] = args;
        return `mtn/motion_${
          motion.toString().padStart(3, "0")
        }.motion3.json` as const;
      }
      case "face": {
        const [, face] = args;
        return `exp/${patchFace(face)}` as const;
      }
      case "voice": {
        const [, voice] = args;
        return `../../../sound_native/voice/${voice}_hca.mp3` as const;
      }
      case "voiceFull": {
        const [, voiceFull] = args;
        return `../../../sound_native/${voiceFull}_hca.mp3` as const;
      }
    }
  }
}

export function patchScenario(scenario: Scenario, scenarioId: string) {
  // Karin Misono Episode1
  if (/^1012\d\d$/.test(scenarioId)) {
    const action = scenario.story?.group_2?.[1]?.chara?.[0];
    if (action?.id === 101201) {
      delete action.id;
    }
  }
  // Ayame Mikuri Talk3
  if (scenarioId === "350303") {
    const action = scenario.story?.group_27?.[2]?.chara?.[0];
    if (action?.id === 305303) {
      delete action.id;
    }
  }
  // Tart (School uniform) Talk6
  if (scenarioId === "402150") {
    const actions = scenario.story?.group_30?.[0]?.chara;
    if (actions?.[actions.length - 1]?.id === 0) {
      actions.pop();
    }
  }
  // Tsubasa Hanekawa Episode2
  if (/^4045\d\d$/.test(scenarioId)) {
    const action = scenario.story?.group_3?.[1]?.chara?.[0];
    if (action?.id === 100100) {
      delete action.id;
    }
  }
}

function extractExpressionId(face: string) {
  const facePattern = /^mtn_ex_(?<face>\d{1,})\.exp3?\.json$/;
  const id = face.match(facePattern)?.groups!.face;
  return id !== undefined ? +id : undefined;
}

function patchFace(face: string) {
  const expressionId = extractExpressionId(face);
  return expressionId !== undefined
    ? `mtn_ex_${`${expressionId}`.padStart(3, "0")}.exp3.json`
    : face;
}
