import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';
import App from './App.jsx';

/** Server-side render of the default state. Used by scripts/postbuild.mjs to pre-render index.html. */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
