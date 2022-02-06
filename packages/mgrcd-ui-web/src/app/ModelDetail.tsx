import { List, ListItem } from "@mui/material";
import React, { useParams } from "react-router-dom";
import useModelParam from "./lib/useModelParam";
import useResourceDirectory from "./lib/useResourceDirectory";

export function ScenarioDetail() {
  const { modelId: modelIdParam } = useParams();
  if (modelIdParam === undefined || !/^\d+/.test(modelIdParam)) {
    throw new Error(`invalid modelId`);
  }
  const modelId = +modelIdParam;
  const [resourceDirectory] = useResourceDirectory();
  const [modelParam, { loading }] = useModelParam(resourceDirectory, modelId);

  return (
    <List>
      <ListItem>
        details:
        {modelParam?.charaName ?? (loading ? "Loading..." : "Unknown")}
      </ListItem>
    </List>
  );
}

export default ScenarioDetail;
