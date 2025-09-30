import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ToastProvider } from "./components/ToastSystem";
import AppRouter from "./components/AppRouter";

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <CssBaseline enableColorScheme />
        <AppRouter />
      </ToastProvider>
    </LanguageProvider>
  );
}
