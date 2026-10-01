import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { UIProvider } from './store/UIProvider.jsx';
import { StoreProvider } from './store/StoreProvider.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/layout.css';
import './styles/pages.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UIProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </UIProvider>
  </StrictMode>,
);
