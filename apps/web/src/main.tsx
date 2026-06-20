import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import '@lambda/shell/styles.css';

import App from './app/App.js';
import './styles.css';

document.documentElement.dataset.platform = 'web';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
