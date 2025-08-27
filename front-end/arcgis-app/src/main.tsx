// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from "@/context/AppContext.tsx";
import App from '@/App.tsx'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


import '@/index.css'

// Apunta al CDN oficial de la versión que estés usando:
import { defineCustomElements as defineMapElements } from "@arcgis/map-components/dist/loader";

defineMapElements(window, {
  resourcesUrl: "https://js.arcgis.com/map-components/4.33/assets"
});

createRoot(document.getElementById('react-filter')!).render(
    <AppProvider>      
      <App />      
    </AppProvider>,    
)