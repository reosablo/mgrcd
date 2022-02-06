import { Avatar, Box, SxProps, Typography } from "@mui/material";
import React from "react";
import { useInView } from "react-intersection-observer";
import useMiniImageUrl from "./useMiniImageUrl";
import useModelParam from "./useModelParam";
import useResourceDirectory from "./useResourceDirectory";

export function ModelInfo(props: {
  modelId?: number;
  sx?: SxProps;
  alt?: string;
}) {
  const { modelId: id, sx, alt } = props;
  const subtext = alt ?? `ID: ${id}`;
  const [ref, inView] = useInView({ triggerOnce: true });
  const [resourceDirectory] = useResourceDirectory();
  const modelId = inView ? id : undefined;
  const [modelParam, { loading: modelParamLoading }] = useModelParam(
    resourceDirectory,
    modelId,
  );
  const miniImageId = inView && id !== undefined ? id - (id % 100) : undefined;
  const [miniImageUrl] = useMiniImageUrl(resourceDirectory, miniImageId);

  return (
    <Box
      sx={{
        display: "inline-flex",
        gap: "1em",
        alignItems: "center",
        textAlign: "start",
        ...sx,
      }}
      ref={ref}
    >
      <Avatar src={miniImageUrl} />
      <Box sx={{ flex: "1" }}>
        <Typography>{modelParam?.charaName ?? subtext}</Typography>
        <Typography sx={{ color: "text.secondary", fontSize: "smaller" }}>
          {modelParam?.charaName
            ? subtext
            : modelParamLoading
            ? "Loading..."
            : "Unknown"}
        </Typography>
      </Box>
    </Box>
  );
}

export default ModelInfo;
