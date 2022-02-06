import { List, ListItemButton } from "@mui/material";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import ModelInfo from "./ModelInfo";

export function ModelList(
  props:
    & {
      modelIds: number[];
      selectedModelId?: number;
    }
    & (
      | { linkTo(modelId: number): string }
      | { onSelect(modelId: number): void }
    ),
) {
  const { modelIds, selectedModelId } = props;
  const linkTo = "linkTo" in props ? props.linkTo : undefined;
  const onSelect = "onSelect" in props ? props.onSelect : undefined;

  return (
    <List>
      {useMemo(
        () =>
          modelIds.map((modelId) => {
            const selected = selectedModelId === modelId;
            return (
              <ListItemButton
                key={modelId}
                selected={selected}
                ref={(element) => {
                  if (selected) {
                    element?.scrollIntoView({ block: "center" });
                  }
                }}
                onClick={() => onSelect?.(modelId)}
                {...(linkTo !== undefined && {
                  component: Link,
                  to: linkTo(modelId),
                })}
              >
                <ModelInfo modelId={modelId} sx={{ flex: 1 }} />
              </ListItemButton>
            );
          }),
        [linkTo, onSelect, modelIds, selectedModelId],
      )}
    </List>
  );
}

export default ModelList;
