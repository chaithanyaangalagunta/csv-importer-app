import React, { useState, useEffect } from "react";
import "./App.css";
import { WaitTillAppInitialisedApp } from "./wait-till-app-initialised";
import { RenderWidget } from "./render-widget";
import { ThemeProvider } from '@mui/material/styles';
import theme from "./theme";
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  const [app, setApp] = useState(null);

  useEffect(() => {
    console.log("App", app);
  }, [app]);

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <WaitTillAppInitialisedApp onLoaded={setApp} app={app}>
      <RenderWidget app={app} />
    </WaitTillAppInitialisedApp>
    </ThemeProvider>
  );
}

export default App;
