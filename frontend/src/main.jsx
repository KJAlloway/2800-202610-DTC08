import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App/App.jsx";
import "./index.css";
import { LocationProvider } from './components/context/LocationContext.jsx';

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <LocationProvider>
            <App />
        </LocationProvider>
    </StrictMode>
);