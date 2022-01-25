import type { Motion } from "live2dviewerex";
import type { Model, Scenario } from "mgrcd-resource";
import {
  entryMotions as originalEntryMotions,
  metaKey as entryMotionMetaKey,
  Resolver,
} from "./internal/config";
import {
  buildStoryEntryCommand,
  installMotion,
  installStory,
} from "./internal/install";

const filteredEntryMotions = originalEntryMotions
  .filter(([, motion]) => !motion[entryMotionMetaKey].spoiler);

export function installScenario(
  model: Model,
  scenario: Scenario,
  roleId: number,
  option?: {
    allowSpoiler?: boolean;
    otherRoleIds?: Iterable<number | undefined>;
  },
) {
  const { allowSpoiler, otherRoleIds } = option ?? {};
  const stories = scenario.story;
  if (stories === undefined) {
    return;
  }
  const entryMotions = allowSpoiler
    ? originalEntryMotions
    : filteredEntryMotions;
  const resolver = new Resolver();
  for (const [motionGroupName, entryMotion] of entryMotions) {
    const { voiceSuffix } = entryMotion[entryMotionMetaKey];
    const storyEntry = Object.entries(stories).find(([, story]) =>
      story[0]?.chara?.some((action) => action.voice?.endsWith(voiceSuffix))
    );
    if (storyEntry === undefined) {
      continue;
    }
    const [storyId, story] = storyEntry;
    const motionIndex = resolver.getMotionIndex("scene", storyId, 0);
    const motion: Motion = {
      ...entryMotion,
      Command: buildStoryEntryCommand(
        roleId,
        otherRoleIds,
        motionIndex,
        resolver,
      ),
    };
    installMotion(model, motionGroupName, motion);
    installStory(model, story, storyId, roleId, resolver);
  }
}
