import { List, ListItem } from "@mui/material";
import React, { useParams } from "react-router-dom";

export function ScenarioDetail() {
  const params = useParams();

  return (
    <List>
      <ListItem>details {JSON.stringify(params)}</ListItem>
    </List>
  );
}

export default ScenarioDetail;
