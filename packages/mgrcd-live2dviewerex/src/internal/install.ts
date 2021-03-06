import type { Expression, Model, Motion } from "live2dviewerex";
import type { Action, ModelParam, Scenario, Story } from "mgrcd-resource";

const motionReferencePattern = /^(?<motionGroupName>.*?)(:(?<motionName>.*))?$/;

export function installStory(
  model: Model,
  story: Story,
  storyId: string,
  resolver: Resolver,
  { enableMute, filterRoleId }: {
    enableMute: boolean;
    filterRoleId: (roleId: number | undefined) => boolean;
  },
) {
  for (const [sceneIndex, scene] of story.entries()) {
    const motionIndex = resolver.getMotionIndex("scene", storyId, sceneIndex);
    const [motionGroupName, motionName] = motionIndex;
    const nextMotion = sceneIndex + 1 < story.length
      ? resolver.getMotionIndex("scene", storyId, sceneIndex + 1).join(":")
      : undefined;
    const motionDuration = scene.autoTurnFirst !== undefined
      ? scene.autoTurnFirst * 1000
      : scene.autoTurnLast !== undefined
      ? scene.autoTurnLast * 1000
      : undefined;
    const actions = scene.chara
      ?.filter((action) => filterRoleId(action.id)) ?? [];
    const command = buildCommand(actions, resolver, { enableMute });
    const text = buildText(actions);
    installDependencies(model, actions, resolver);
    installMotion(model, motionGroupName, {
      Name: motionName,
      MotionDuration: motionDuration,
      Command: command,
      Text: text,
      NextMtn: nextMotion,
    });
  }
}

export function* getRoleIds(scenario: Scenario, resolver: Resolver) {
  const roleIds = new Set<number | undefined>();
  for (const story of Object.values(scenario.story ?? {})) {
    for (const scene of story) {
      for (const action of scene.chara ?? []) {
        const roleId = resolver.getRoleId(action.id);
        if (!roleIds.has(roleId) && roleId !== undefined) {
          yield roleId;
          roleIds.add(roleId);
        }
      }
    }
  }
}

export type MotionIndex = readonly [
  motionGroupName: string,
  motionName?: string,
];

export function parseMotionIndex(motionPath: string) {
  const { motionGroupName, motionName } = motionPath.match(
    motionReferencePattern,
  )!.groups!;
  return (motionName !== undefined
    ? [motionGroupName, motionName]
    : [motionGroupName]) as MotionIndex;
}

export function stringifyMotionIndex(
  [motionGroupName, motionName]: MotionIndex,
) {
  return motionName !== undefined
    ? `${motionGroupName}:${motionName}` as const
    : motionGroupName;
}

export function getMotion(
  model: Model,
  [motionGroupName, motionName]: MotionIndex,
) {
  return motionName !== undefined
    ? model.FileReferences.Motions?.[motionGroupName]?.find((motion) =>
      motion.Name === motionName
    )
    : undefined;
}

export function getExpression(
  model: Model,
  expressionName: string,
) {
  return model.FileReferences.Expressions?.find((expression) =>
    expression.Name === expressionName
  );
}

export function isMotionInstalled(
  model: Model,
  [motionGroupName, motionName]: MotionIndex,
) {
  return motionName !== undefined &&
    !!model.FileReferences.Motions?.[motionGroupName]?.some((motion) =>
      motion.Name === motionName
    );
}

export function isExpressionInstalled(
  model: Model,
  expressionName: string,
) {
  return !!model.FileReferences.Expressions?.some((expression) =>
    expression.Name === expressionName
  );
}

export function installMotion(
  model: Model,
  motionGroupName: string,
  motion: Motion,
) {
  const motionGroup = (model.FileReferences.Motions ??= {})[motionGroupName] ??=
    [];
  const motionName = motion.Name;
  if (motionName === undefined) {
    motionGroup.push(motion);
  } else {
    const index = motionGroup.findIndex((motion) => motion.Name === motionName);
    if (index >= 0) {
      motionGroup.splice(index, 1, motion);
    } else {
      motionGroup.push(motion);
    }
  }
}

export function installExpression(
  model: Model,
  expression: Expression,
) {
  const expressions = model.FileReferences.Expressions ??= [];
  const expressionName = expression.Name;
  const index = expressions.findIndex(
    (expression) => expression.Name !== expressionName,
  );
  if (index >= 0) {
    expressions.splice(index, 1, expression);
  } else {
    expressions.push(expression);
  }
}

export function installModelParam(model: Model, modelParam: ModelParam) {
  const options = model.Options ??= {};
  options.Name = modelParam.charaName;
  options.ScaleFactor = modelParam.modelScale;
}

export function uninstallMotion(
  model: Model,
  [motionGroupName, motionName]: Required<MotionIndex>,
) {
  const motionGroup = model.FileReferences.Motions?.[motionGroupName];
  if (motionGroup === undefined) {
    return;
  }
  const index = motionGroup.findIndex((motion) => motion.Name === motionName);
  if (index >= 0) {
    motionGroup.splice(index, 1);
  }
}

export function buildStoryEntryCommand(
  motionIndex: MotionIndex,
  resolver: Resolver,
  { otherRoleIds }: { otherRoleIds: Iterable<number> },
) {
  const motionRef = stringifyMotionIndex(motionIndex);
  const commands = [`start_mtn ${motionRef}`];
  for (const otherRoleId of otherRoleIds) {
    commands.push(`start_mtn ${resolver.getModelId(otherRoleId)} ${motionRef}`);
  }
  return commands.join(";");
}

export type Resolver = {
  getRoleId(actorId: number | undefined): number | undefined;

  getModelId(roleId: number): string;

  getMotionIndex(
    ...args:
      | [type: "scene", storyId: string, sceneIndex: number]
      | [type: "motion", motion: number]
      | [type: "voice", voice: string]
      | [type: "voiceFull", voiceFull: string]
      | [type: "face", face: string]
  ): MotionIndex;

  getExpressionName(
    ...args: [type: "face", face: string]
  ): string;

  getFilePath(
    ...args:
      | [type: "motion", motion: number]
      | [type: "voice", voice: string]
      | [type: "voiceFull", voiceFull: string]
      | [type: "face", face: string]
  ): string;
};

function installDependencies(
  model: Model,
  actions: Iterable<Action>,
  resolver: Resolver,
) {
  for (const action of actions) {
    const { motion, face, voice } = action;
    if (motion !== undefined) {
      const motionIndex = resolver.getMotionIndex("motion", motion);
      if (!isMotionInstalled(model, motionIndex)) {
        const [motionGroupName, motionName] = motionIndex;
        const filePath = resolver.getFilePath("motion", motion);
        if (motion < 100) {
          installMotion(model, motionGroupName, {
            Name: motionName,
            File: filePath,
            FileLoop: true,
            Command: "eye_blink enforce",
            FadeOut: 0,
          });
        } else {
          installMotion(model, motionGroupName, {
            Name: motionName,
            Command: "eye_blink enforce",
            File: filePath,
          });
        }
      }
    }
    if (face !== undefined) {
      const motionIndex = resolver.getMotionIndex("face", face);
      const expressionName = resolver.getExpressionName("face", face);
      if (!isMotionInstalled(model, motionIndex)) {
        const [motionGroupName, motionName] = motionIndex;
        installMotion(model, motionGroupName, {
          Name: motionName,
          Expression: expressionName,
        });
      }
      if (!isExpressionInstalled(model, expressionName)) {
        const filePath = resolver.getFilePath("face", face);
        installExpression(model, {
          Name: expressionName,
          File: filePath,
        });
      }
    }
    if (voice !== undefined) {
      const motionIndex = resolver.getMotionIndex("voice", voice);
      if (!isMotionInstalled(model, motionIndex)) {
        const [motionGroupName, motionName] = motionIndex;
        const filePath = resolver.getFilePath("voice", voice);
        installMotion(model, motionGroupName, {
          Name: motionName,
          Sound: filePath,
        });
      }
    }
  }
}

function buildCommand(
  actions: Action[],
  resolver: Resolver,
  { enableMute }: { enableMute: boolean },
) {
  const commands = [] as string[];
  for (const action of actions) {
    const {
      motion,
      face,
      voice,
      lipSynch,
      cheek,
      eyeClose,
      mouthOpen,
      soulGem,
      tear,
      live2dParam,
      textHomeStatus,
    } = action;
    if (motion !== undefined) {
      const motionIndex = resolver.getMotionIndex("motion", motion);
      commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
    }
    if (face !== undefined) {
      const motionIndex = resolver.getMotionIndex("face", face);
      commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
    }
    if (voice !== undefined) {
      const motionIndex = resolver.getMotionIndex("voice", voice);
      commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
    }
    if (lipSynch !== undefined) {
      if (lipSynch) {
        if (enableMute) {
          commands.push(`unmute_sound 0`);
        } else {
          commands.push(`lip_sync enable`);
          if (mouthOpen === undefined) {
            commands.push(`parameters unlock ParamMouthOpenY`);
          }
        }
      } else {
        if (enableMute) {
          commands.push(`mute_sound 0`);
        } else {
          commands.push(`lip_sync disable`);
          if (mouthOpen === undefined) {
            commands.push(`parameters lock ParamMouthOpenY 0`);
          }
        }
      }
    }
    if (cheek !== undefined) {
      commands.push(`parameters lock ParamCheek ${cheek}`);
    }
    if (eyeClose !== undefined) {
      if (eyeClose === 0) {
        commands.push(
          `parameters unlock ParamEyeLOpen`,
          `parameters unlock ParamEyeROpen`,
        );
      } else {
        commands.push(
          `parameters lock ParamEyeLOpen ${1 - eyeClose}`,
          `parameters lock ParamEyeROpen ${1 - eyeClose}`,
        );
      }
    }
    if (mouthOpen !== undefined) {
      if (mouthOpen === 0) {
        commands.push(`parameters unlock ParamMouthOpenY`);
      } else {
        commands.push(`parameters lock ParamMouthOpenY ${mouthOpen}`);
      }
    }
    if (soulGem !== undefined) {
      if (soulGem === 1) {
        commands.push(`parameters unlock ParamSoulgem`);
      } else {
        commands.push(`parameters lock ParamSoulgem ${soulGem}`);
      }
    }
    if (tear !== undefined) {
      if (tear === 0) {
        commands.push(`parameters unlock ParamTear`);
      } else {
        commands.push(`parameters lock ParamTear ${tear}`);
      }
    }
    if (live2dParam?.name !== undefined) {
      const name = live2dParam.name.replace(
        /_?([A-Za-z]+)/g,
        (_, $1: string) => `${$1[0].toUpperCase()}${$1.slice(1).toLowerCase()}`,
      );
      commands.push(`parameters lock ${name} ${live2dParam.value ?? 0}`);
    }
    if (textHomeStatus === "Clear") {
      commands.push(`hide_text`);
    }
  }
  return commands.join(";") || undefined;
}

function buildText(actions: Iterable<Action>) {
  const texts = [] as string[];
  for (const action of actions) {
    const { textHome } = action;
    if (textHome !== undefined) {
      const text = textHome
        .replace(/\[.*?\]/g, "")
        .replace(/@/g, "\n");
      texts.push(text);
    }
  }
  return texts.join("{$br}") || undefined;
}
