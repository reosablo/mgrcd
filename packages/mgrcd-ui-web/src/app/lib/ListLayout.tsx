import { ArrowBack } from "@mui/icons-material";
import {
  AppBar,
  Box,
  IconButton,
  Slide,
  Toolbar,
  useScrollTrigger,
} from "@mui/material";
import React, { ReactElement, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export function HomeLayout(props: { title: ReactNode; children: ReactNode }) {
  const { title, children } = props;
  const navigate = useNavigate();

  return (
    <Box>
      <HideOnScroll direction="down">
        <AppBar>
          <Toolbar sx={{ gap: "1em" }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1 }}>{title}</Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      {children}
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

export default HomeLayout;
