import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/App.js';
import './styles.css';

document.documentElement.dataset.platform = window.lambda.platform;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
