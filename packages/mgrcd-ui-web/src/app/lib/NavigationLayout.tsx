import { Announcement, Person, PersonAdd } from "@mui/icons-material";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Paper,
  Slide,
  Toolbar,
  useScrollTrigger,
} from "@mui/material";
import React, { ReactElement, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import useLastBakeParams from "../useLastBakeParams";
import useResourceDirectory from "./useResourceDirectory";

export function NavigationLayout(
  props: { title: ReactNode; children: ReactNode },
) {
  const { title, children } = props;
  const location = useLocation();
  const value = location.pathname.replace(/(?<!^)\/.*/, "");
  const [resourceDirectory, { request: requestResourceDirectory }] =
    useResourceDirectory();
  const [lastBakeParams] = useLastBakeParams();

  return (
    <Box sx={{ height: "100vh" }}>
      <HideOnScroll direction="down">
        <AppBar>
          <Toolbar>
            <Box sx={{ flex: 1 }}>{title}</Box>
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
      </HideOnScroll>
      <Toolbar />
      {children}
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
        square
      >
        <BottomNavigation
          showLabels
          value={value}
          sx={{ background: "transparent" }}
        >
          <BottomNavigationAction
            component={Link}
            to="/model"
            value="/model"
            label="Models"
            icon={<Person />}
          />
          <BottomNavigationAction
            component={Link}
            to={{ pathname: "/bake", search: `${lastBakeParams ?? ""}` }}
            value="/bake"
            label="Generate EX Model"
            icon={<PersonAdd />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

function HideOnScroll(props: {
  children: ReactElement;
  direction: Parameters<typeof Slide>[0]["direction"];
}) {
  const { children, direction } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction={direction} in={!trigger}>
      {children}
    </Slide>
  );
}

export default NavigationLayout;
