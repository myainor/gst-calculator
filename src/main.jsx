import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles.css';
import App from './App.jsx';

const root = document.getElementById('root');
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The page ships pre-rendered for the default state. A shared link carries its own state in the query string,
// so that render would not match: start fresh instead of hydrating over it.
if (root.hasChildNodes() && !window.location.search) hydrateRoot(root, app);
else createRoot(root).render(app);
