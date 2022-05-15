import corePath from "@ffmpeg/core/dist/ffmpeg-core.js?url";
import { Announcement, ChevronRight } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";
import { DataGrid, GridColumns, GridRenderCellParams } from "@mui/x-data-grid";
import { HCA } from "hca.js/lib/hca";
import {
  getExModelWritable,
  getModel,
  getModelFile,
  getModelParam,
  getModelParamFile,
  setModel,
} from "mgrcd-io-fsa";
import {
  installModelParam,
  installScenario,
  postprocessModel,
} from "mgrcd-live2dviewerex";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useModelDirectories from "./lib/io/useModelDirectories";
import useVoiceDirectory from "./lib/io/useVoiceDirectory";
import ListLayout from "./lib/ListLayout";
import ModelInfo from "./lib/ModelInfo";
import ModelList from "./lib/ModelList";
import useModelIds from "./lib/useModelIds";
import useResourceDirectory from "./lib/useResourceDirectory";
import useRoleIds from "./lib/useRoleIds";
import useScenario from "./lib/useScenario";
import useScenarioIds from "./lib/useScenarioIds";

type BakeLocationState =
  | {
    modal?: string;
    roleId?: number;
    snackbar?: {
      message: string;
      severity?: Parameters<typeof Alert>[0]["severity"];
    };
  }
  | undefined;

function Cast(props: { scenarioId?: number }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { scenarioId } = props;
  const [resourceDirectory] = useResourceDirectory();
  const [modelIds] = useModelIds(resourceDirectory);
  const [roleIds, { loading }] = useRoleIds(resourceDirectory, scenarioId);
  const [searchParams, setSearchParams] = useSearchParams();
  const casts = useMemo(
    () =>
      new Map(
        searchParams
          .getAll("cast")
          .map((cast) => {
            const match = cast.match(/^(?<roleId>\d+):(?<modelId>\d+)$/);
            const { roleId, modelId } = match?.groups ?? {};
            return match !== null ? ([+roleId, +modelId] as const) : undefined;
          })
          .filter(((v) => v) as <T>(v: T) => v is NonNullable<T>),
      ),
    [searchParams],
  );

  useEffect(() => {
    if (roleIds !== undefined) {
      const castParams = searchParams.getAll("cast");
      const validCastParams = castParams.filter((cast) =>
        roleIds.includes(+cast.split(/:/)[0])
      );
      if (validCastParams.length !== castParams.length) {
        searchParams.delete("cast");
        for (const cast of validCastParams) {
          searchParams.append("cast", cast);
        }
        searchParams.sort();
        setSearchParams(searchParams, { replace: true });
      } else if (
        validCastParams.length < roleIds.length &&
        scenarioId !== undefined &&
        modelIds !== undefined
      ) {
        const lackedRoleIds = roleIds.filter(
          (roleId) =>
            !validCastParams.some((cast) => cast.startsWith(`${roleId}:`)),
        );
        for (const roleId of lackedRoleIds) {
          const familyId = roleId - (roleId % 100);
          if (modelIds.includes(roleId)) {
            searchParams.append("cast", `${roleId}:${roleId}`);
          } else if (modelIds.includes(familyId)) {
            searchParams.append("cast", `${roleId}:${familyId}`);
          }
        }
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [modelIds, roleIds, scenarioId, searchParams, setSearchParams]);

  const columns: GridColumns = useMemo(
    () => [
      {
        field: "role",
        headerName: "Role",
        sortable: false,
        flex: 1,
        renderCell(cell: GridRenderCellParams<number>) {
          const roleId = cell.value;
          return <ModelInfo modelId={roleId} alt={`Role ID: ${roleId}`} />;
        },
      },
      {
        field: "actor",
        headerName: "Actor Model",
        sortable: false,
        flex: 1,
        renderCell(cell: GridRenderCellParams<number | undefined>) {
          const modelId = cell.value;
          return (
            <Button
              sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                alignItems: "center",
                textDecoration: "none",
                textTransform: "none",
                color: "text.primary",
              }}
              onClick={() =>
                navigate(location, {
                  state: { modal: "select-model", roleId: cell.row.role },
                })}
            >
              <ModelInfo
                modelId={modelId}
                sx={{ flex: 1 }}
                alt={`Model ID: ${modelId}`}
              />
              <ChevronRight />
            </Button>
          );
        },
      },
    ],
    [location, navigate],
  );
  const rows = useMemo(
    () =>
      roleIds?.map((roleId) => ({
        id: roleId,
        role: roleId,
        actor: casts.get(roleId),
      })) ?? [],
    [casts, roleIds],
  );

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      autoHeight
      disableColumnFilter
      disableColumnSelector
      hideFooter
      loading={loading}
    />
  );
}

function SelectScenarioDialog() {
  const location = useLocation();
  const state = location.state as BakeLocationState;
  const [searchParams, setSearchParams] = useSearchParams();
  const [resourceDirectory] = useResourceDirectory();
  const [scenarioIds] = useScenarioIds(resourceDirectory);
  const selectedScenarioId = +(searchParams.get("scenario") ?? NaN);
  const onSelect = useCallback(
    (scenarioId: number) => {
      searchParams.set("scenario", `${scenarioId}`);
      searchParams.sort();
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return (
    <Dialog fullScreen open={state?.modal === "select-scenario"}>
      <ListLayout title="select Scenario">
        <ModelList
          modelIds={scenarioIds ?? []}
          onSelect={onSelect}
          selectedModelId={selectedScenarioId}
        />
      </ListLayout>
    </Dialog>
  );
}

function SelectModelDialog() {
  const location = useLocation();
  const state = location.state as BakeLocationState;
  const [searchParams, setSearchParams] = useSearchParams();
  const [resourceDirectory] = useResourceDirectory();
  const [modelIds] = useModelIds(resourceDirectory);
  const selectedRoleId = state?.roleId;
  const selectedModelId = +(
    searchParams
      .getAll("cast")
      .find((cast) => cast.startsWith(`${selectedRoleId}:`))
      ?.replace(`${selectedRoleId}:`, "") ?? NaN
  );
  const onSelect = useCallback(
    (modelId) => {
      if (selectedModelId === undefined) {
        searchParams.append("cast", `${selectedRoleId}:${modelId}`);
      } else {
        const casts = searchParams
          .getAll("cast")
          .map((cast) =>
            cast.startsWith(`${selectedRoleId}:`)
              ? `${selectedRoleId}:${modelId}`
              : cast
          );
        searchParams.delete("cast");
        for (const cast of casts) {
          searchParams.append("cast", cast);
        }
      }
      searchParams.sort();
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, selectedModelId, selectedRoleId, setSearchParams],
  );

  return (
    <Dialog fullScreen open={state?.modal === "select-model"}>
      <ListLayout
        title={
          <Box
            sx={{ display: "inline-flex", alignItems: "center", gap: "1em" }}
          >
            select Model for Role
            <ModelInfo modelId={selectedRoleId} />
          </Box>
        }
      >
        <ModelList
          modelIds={modelIds ?? []}
          onSelect={onSelect}
          selectedModelId={selectedModelId}
        />
      </ListLayout>
    </Dialog>
  );
}

function ConfirmDialog() {
  const [resourceDirectory] = useResourceDirectory();
  const [modelDirectories] = useModelDirectories(resourceDirectory);
  const [voiceDirectory] = useVoiceDirectory(resourceDirectory);
  const location = useLocation();
  const state = location.state as BakeLocationState;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [triggered, setTriggered] = useState(false);
  const allowSpoiler = searchParams.get("allow-spoiler") !== null;
  const scenarioId = ((id) => id !== null ? +id : undefined)(
    searchParams.get("scenario"),
  );
  const [scenario] = useScenario(resourceDirectory, scenarioId);
  const castEntries = useMemo(
    () =>
      searchParams.getAll("cast")
        .map((cast) => {
          const match = cast.match(/^(?<roleId>\d+):(?<modelId>\d+)$/);
          const { roleId, modelId } = match?.groups ?? {};
          return match !== null ? ([+roleId, +modelId] as const) : undefined;
        })
        .filter(((v) => v) as <T>(v: T) => v is NonNullable<T>),
    [searchParams],
  );
  const getFileName = useCallback(
    ([roleId, modelId]: readonly [number, number]) =>
      `image_native/live2d_v4/${modelId}/model-${
        castEntries.length === 1 ? `${scenarioId}` : `${scenarioId}@${roleId}`
      }.json`,
    [castEntries.length, scenarioId],
  );
  const outputPaths = useMemo(
    () => castEntries.map(getFileName),
    [castEntries, getFileName],
  );

  const start = useCallback(() => {
    if (scenarioId === undefined || scenario === undefined) {
      throw new Error(`scenario is undefined`);
    }
    setTriggered(true);
    const roleIds = castEntries.map(([roleId]) => roleId);
    const voiceIds = new Set<string>();
    Promise.all(castEntries.map(async ([roleId, modelId]) => {
      const modelDirectory = modelDirectories?.[modelId];
      if (modelDirectory === undefined) {
        throw new Error(`modelDirectory is undefined`);
      }
      const familyId = roleId - roleId % 100;
      const targetRoleIds = roleIds.includes(familyId)
        ? [roleId]
        : [roleId, familyId];
      const otherRoleIds = new Set(roleIds);
      otherRoleIds.delete(roleId);
      const [model, modelParam] = await Promise.all([
        getModelFile(modelDirectory).then((file) => getModel(file)),
        getModelParamFile(modelDirectory).then((file) => getModelParam(file)),
      ]);
      installScenario(model, scenario, {
        allowSpoiler,
        enableMute: otherRoleIds.size > 0,
        filterRoleId: (roleId) =>
          (targetRoleIds as (number | undefined)[]).includes(roleId),
        otherRoleIds,
      });
      installModelParam(model, modelParam);
      postprocessModel(model, roleId);
      const modelWritable = await getExModelWritable(
        modelDirectory,
        castEntries.length === 1 ? `${scenarioId}` : `${scenarioId}@${roleId}`,
      );
      try {
        await modelWritable.truncate(0);
        await setModel(modelWritable, model);
        await modelWritable.close();
      } catch (error) {
        await modelWritable.abort();
        throw error;
      }
      const voicePattern = /^(\.\.\/){3}sound_native\/voice\/(?<id>[^/]+)\.mp3/;
      Object.values(model.FileReferences.Motions ?? {})
        .flatMap((motions) =>
          motions.flatMap(({ Sound }) => Sound !== undefined ? [Sound] : [])
        )
        .map((voicePath) => voicePath.match(voicePattern)?.groups?.id)
        .filter((voiceId): voiceId is string => voiceId !== undefined)
        .forEach((sound) => voiceIds.add(sound));
    }))
      .then(async () => {
        if (voiceDirectory === undefined) {
          throw new Error("voice directory not found");
        }
        const { createFFmpeg } = await import("@ffmpeg/ffmpeg");
        const ffmpeg = createFFmpeg({ corePath });
        await ffmpeg.load();
        await Promise.all([...voiceIds].map(async (voiceId) => {
          const mp3Exists = await voiceDirectory.getFileHandle(`${voiceId}.mp3`)
            .then(() => true, () => false);
          if (mp3Exists) {
            return;
          }
          const [mp3Bytes, mp3Writable] = await Promise.all([
            voiceDirectory.getFileHandle(`${voiceId}.hca`)
              .then((handle) => handle.getFile())
              .then((file) => file.arrayBuffer())
              .then((buffer) => new Uint8Array(buffer))
              .then((hcaBytes) => HCA.decrypt(hcaBytes, "defaultkey"))
              .then((hcaBytes) => HCA.decode(hcaBytes))
              .then((wavBytes) =>
                ffmpeg.FS("writeFile", `${voiceId}.wav`, wavBytes)
              )
              .then(() => ffmpeg.run("-i", `${voiceId}.wav`, `${voiceId}.mp3`))
              .then(() => ffmpeg.FS("readFile", `${voiceId}.mp3`)),
            voiceDirectory.getFileHandle(`${voiceId}.mp3`, { create: true })
              .then((handle) => handle.createWritable()),
          ]);
          try {
            await mp3Writable.write(mp3Bytes);
            await mp3Writable.close();
          } catch (error) {
            await mp3Writable.abort();
            throw error;
          }
        }));
      })
      .then(() => ({
        severity: "success",
        message: "succeeded to generate models",
      }), (error) => ({ severity: "error", error: `${error.message}` }))
      .then((snackbar) => navigate(location, { state: { snackbar } }))
      .finally(
        () => setTriggered(false),
      );
  }, [
    allowSpoiler,
    castEntries,
    location,
    modelDirectories,
    navigate,
    scenario,
    scenarioId,
    voiceDirectory,
  ]);

  return (
    <Dialog
      open={state?.modal === "confirm"}
      onClose={() => navigate(location, { replace: true })}
    >
      <DialogContent>
        <DialogContentText>
          The following
          {outputPaths.length > 1 ? " files " : " file "}
          will be created on your disk.
        </DialogContentText>
        <ul>
          {outputPaths.map((outputPath) => (
            <li key={outputPath}>{outputPath}</li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate(location, { replace: true })}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={triggered}
          onClick={start}
        >
          Create {outputPaths.length > 1 ? " those files " : " this file "}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

export function Bake() {
  const location = useLocation();
  const state = location.state as BakeLocationState;
  const navigate = useNavigate();
  const [resourceDirectory, { request: requestResourceDirectory }] =
    useResourceDirectory();
  const [modelIds] = useModelIds(resourceDirectory);
  const [scenarioIds] = useScenarioIds(resourceDirectory);
  const [searchParams, setSearchParams] = useSearchParams();
  const scenarioIdParam = searchParams.get("scenario");
  if (scenarioIdParam !== null && !/^\d+$/.test(scenarioIdParam)) {
    navigate({ ...location, search: "" });
  }
  const scenarioId = scenarioIdParam !== null ? +scenarioIdParam : undefined;
  const disabled = resourceDirectory === undefined || scenarioId === undefined;

  useEffect(() => {
    if (
      scenarioId === undefined &&
      modelIds !== undefined &&
      modelIds.length > 0
    ) {
      searchParams.set("scenario", `${modelIds[0]}`);
      setSearchParams(searchParams);
    }
  }, [modelIds, scenarioId, searchParams, setSearchParams]);

  useEffect(() => {
    if (
      scenarioId !== undefined &&
      scenarioIds !== undefined &&
      !scenarioIds.includes(scenarioId)
    ) {
      const familyId = scenarioId - (scenarioId % 100);
      if (scenarioIds.includes(familyId)) {
        searchParams.set("scenario", `${familyId}`);
        setSearchParams(searchParams);
      } else {
        searchParams.delete("scenario");
        setSearchParams(searchParams);
      }
    }
  }, [scenarioId, scenarioIds, searchParams, setSearchParams]);

  return (
    <>
      <Box>
        <AppBar>
          <Toolbar>
            <Box sx={{ flex: 1 }}>Generate EX Model</Box>
            {resourceDirectory === undefined && (
              <Button
                variant="contained"
                startIcon={<Announcement />}
                onClick={requestResourceDirectory}
              >
                specify resource directory
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Toolbar />
        <List>
          <ListSubheader>Scenario</ListSubheader>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                resourceDirectory !== undefined
                  ? navigate(location, { state: { modal: "select-scenario" } })
                  : requestResourceDirectory()}
            >
              <ModelInfo
                modelId={scenarioId}
                alt={`Scenario ID: ${scenarioId}`}
                sx={{ flex: 1 }}
              />
              <ChevronRight />
            </ListItemButton>
          </ListItem>
          <ListSubheader>Cast</ListSubheader>
          <ListItem disablePadding>
            <Cast scenarioId={scenarioId} />
          </ListItem>
          <ListSubheader>Option</ListSubheader>
          <ListItem>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={searchParams.has("allow-spoiler")}
                    onChange={(_, checked) => {
                      if (checked) {
                        searchParams.set("allow-spoiler", "true");
                      } else {
                        searchParams.delete("allow-spoiler");
                      }
                      searchParams.sort();
                      setSearchParams(searchParams, { replace: true });
                    }}
                  />
                }
                label={
                  <>
                    <Typography>Allow spoiler</Typography>
                    <Typography
                      sx={{ color: "text.secondary", fontSize: "smaller" }}
                    >
                      Allow model reactions that has not yet appeared in the
                      game.
                    </Typography>
                  </>
                }
              />
            </FormGroup>
          </ListItem>
        </List>
        <Button
          variant="contained"
          fullWidth
          disabled={disabled}
          onClick={() =>
            navigate(location, { state: { modal: "confirm" }, replace: true })}
        >
          Generate Model
        </Button>
      </Box>
      <SelectScenarioDialog />
      <SelectModelDialog />
      <ConfirmDialog />
      <Snackbar open={state?.snackbar !== undefined} autoHideDuration={6000}>
        <Alert severity={state?.snackbar?.severity}>
          {state?.snackbar?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Bake;
