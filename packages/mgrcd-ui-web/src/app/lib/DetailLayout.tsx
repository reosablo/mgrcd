import { ArrowBack } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export function HomeLayout(props: { title: ReactNode; children: ReactNode }) {
  const { title, children } = props;
  const navigate = useNavigate();

  return (
    <>
      <AppBar>
        <Toolbar sx={{ gap: "1em" }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>{title}</Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      {children}
    </>
  );
}

export default HomeLayout;
