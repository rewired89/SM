import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { UIProvider } from './store/UIProvider.jsx';
import AuthGate from './components/auth/AuthGate.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/games.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UIProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </UIProvider>
  </StrictMode>,
);
