import type { Scenario } from "mgrcd-resource";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClosureCache } from "react-use-cache";
import useCharaOneShot from "./useCharaOneShot";

async function* getActorIds(scenario: Scenario) {
  const actorIds = new Set<number | undefined>();
  for (const story of Object.values(scenario.story ?? {})) {
    for (const scene of story) {
      for (const action of scene.chara ?? []) {
        const actorId = action.id;
        if (!actorIds.has(actorId)) {
          yield actorId;
          actorIds.add(actorId);
        }
      }
    }
  }
}

async function collectRoleIds(charaOneShot: Parameters<typeof getActorIds>[0]) {
  const roleIds = [];
  for await (const actorId of getActorIds(charaOneShot)) {
    if (actorId === undefined || actorId === 0) {
      continue;
    } else {
      roleIds.push(actorId);
    }
  }
  roleIds.sort((a, b) => a - b);
  return roleIds;
}

export function useRoleIds(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
  scenarioId: number | undefined,
) {
  const [charaOneShot] = useCharaOneShot(resourceDirectory, scenarioId);
  const [charaOneShotRoleIds, loader] = useClosureCache(
    collectRoleIds,
    charaOneShot,
  );

  const roleIds = useMemo(
    () => charaOneShotRoleIds ?? (scenarioId !== undefined ? [scenarioId] : []),
    [charaOneShotRoleIds, scenarioId],
  );

  return useMemo(
    () =>
      [roleIds, loader] as readonly [
        roleIds: typeof roleIds,
        loader: typeof loader,
      ],
    [loader, roleIds],
  );
}

export function useRoleIds_old(
  resourceDirectory: FileSystemDirectoryHandle | undefined,
  scenarioId: number | undefined,
) {
  const [charaOneShot, { loading: charaOneShotLoading }] = useCharaOneShot(
    resourceDirectory,
    scenarioId,
  );
  const [roleIds, setRoleIds] = useState(undefined as number[] | undefined);
  const loadingStatus = useRef(false);

  const load = useCallback(() => {
    if (loadingStatus.current) {
      return;
    }
    if (scenarioId === undefined) {
      throw new Error(`scenarioId is undefined`);
    }
    if (charaOneShot === undefined) {
      throw new Error(`charaOneShot is undefined`);
    } else if (charaOneShot === null) {
      return setRoleIds([scenarioId]);
    }
    loadingStatus.current = true;
    (async () => {
      try {
        const roleIds = [];
        for await (const actorId of getActorIds(charaOneShot)) {
          if (actorId === undefined || actorId === 0) {
            continue;
          } else {
            roleIds.push(actorId);
          }
        }
        roleIds.sort((a, b) => a - b);
        loadingStatus.current = false;
        setRoleIds(roleIds);
      } finally {
        loadingStatus.current = false;
      }
    })();
  }, [charaOneShot, scenarioId]);

  const loading = loadingStatus.current || charaOneShotLoading;
  const loader = useMemo(() => ({ load, loading } as const), [load, loading]);

  useEffect(() => {
    if (charaOneShot !== undefined && scenarioId !== undefined) {
      load();
    }
  }, [charaOneShot, load, scenarioId]);

  return useMemo(
    () =>
      [roleIds, loader] as readonly [
        roleIds: typeof roleIds,
        loader: typeof loader,
      ],
    [loader, roleIds],
  );
}

export default useRoleIds;
