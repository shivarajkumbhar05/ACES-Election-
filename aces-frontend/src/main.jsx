import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import { VotingProvider } from "./context/VotingContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <VotingProvider>
          <App />
        </VotingProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
