import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Bake from "./Bake";
import ModelDetail from "./ModelDetail";
import ModelList from "./ModelList";
import ScenarioDetail from "./ScenarioDetail";
import ScenarioListPage from "./ScenarioList";
import useLastBakeParams from "./useLastBakeParams";

function Content() {
  const [lastBakeParams] = useLastBakeParams();
  return (
    <Routes>
      <Route path="/model" element={<ModelList />} />
      <Route path="/model/:modelId" element={<ModelDetail />} />
      <Route path="/scenario" element={<ScenarioListPage />} />
      <Route path="/scenario/:scenarioId" element={<ScenarioDetail />} />
      <Route path="/bake" element={<Bake />} />
      <Route
        path="*"
        element={
          <Navigate
            to={`/bake${
              lastBakeParams === undefined ? "" : `?${lastBakeParams}`
            }`}
          />
        }
      />
    </Routes>
  );
}

export function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Content />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
