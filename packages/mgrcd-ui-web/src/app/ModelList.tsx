import { List, ListItemButton } from "@mui/material";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import ModelInfo from "./lib/ModelInfo";
import NavigationLayout from "./lib/NavigationLayout";
import useModelIds from "./lib/useModelIds";
import useResourceDirectory from "./lib/useResourceDirectory";

export function ModelList() {
  const [resourceDirectory] = useResourceDirectory();
  const [modelIds] = useModelIds(resourceDirectory);

  return (
    <NavigationLayout title="Models">
      <List>
        {useMemo(
          () =>
            modelIds?.map((modelId) => (
              <ListItemButton component={Link} to={`${modelId}`} key={modelId}>
                <ModelInfo modelId={modelId} />
              </ListItemButton>
            )),
          [modelIds],
        )}
      </List>
    </NavigationLayout>
  );
}

export default ModelList;
