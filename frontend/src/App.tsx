import React, { useState } from 'react';
import { DamlLedger } from '@c7/react';
import { PolicyView } from './PolicyView';
import './App.css';

// The default ledger ID for a `dpm sandbox` Canton ledger.
const LEDGER_ID = 'canton-sandbox';

// The default JSON API URL for a `dpm sandbox` Canton ledger.
const HTTP_BASE_URL = 'http://localhost:7575';

/**
 * Creates an unsafe JWT token for local development against a Canton sandbox.
 * In a production environment, you would obtain a token from a proper authentication provider.
 * @param party The party identifier to include in the token's `actAs` and `readAs` claims.
 * @returns A base64-encoded JWT string.
 */
const createToken = (party: string): string => {
  const payload = {
    ledgerId: LEDGER_ID,
    applicationId: 'canton-insurance-claims', // This can be any string
    actAs: [party],
    readAs: [party],
  };
  // Insecure JWTs for sandbox are just base64-encoded JSON payloads.
  return btoa(JSON.stringify(payload));
};

/**
 * A simple login screen component to get the user's party and generate a token.
 */
const LoginScreen: React.FC<{
  onLogin: (party: string, token: string) => void;
}> = ({ onLogin }) => {
  const [party, setParty] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedParty = party.trim();
    if (trimmedParty) {
      const token = createToken(trimmedParty);
      onLogin(trimmedParty, token);
    }
  };

  const loginAs = (partyName: string) => {
    const token = createToken(partyName);
    onLogin(partyName, token);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Parametric Insurance dApp</h2>
        <p>
          Log in to interact with the ledger. In a real application, this would
          be a proper authentication flow.
        </p>
        <div className="login-presets">
          <button onClick={() => loginAs('Insurer')}>Login as Insurer</button>
          <button onClick={() => loginAs('PolicyHolder')}>Login as PolicyHolder</button>
          <button onClick={() => loginAs('WeatherOracle')}>Login as WeatherOracle</button>
        </div>
        <hr />
        <form onSubmit={handleLogin}>
          <label htmlFor="party-input">Or log in with a custom party name:</label>
          <input
            id="party-input"
            type="text"
            value={party}
            onChange={(e) => setParty(e.target.value)}
            placeholder="Enter Party Name"
          />
          <button type="submit" disabled={!party.trim()}>Login</button>
        </form>
      </div>
    </div>
  );
};

/**
 * The main application component shown after a user has logged in.
 * It sets up the DamlLedger context and renders the core UI.
 */
const MainScreen: React.FC<{
  party: string;
  token: string;
  onLogout: () => void;
}> = ({ party, token, onLogout }) => {
  return (
    // The DamlLedger component provides the ledger context to all child components.
    <DamlLedger party={party} token={token} httpBaseUrl={HTTP_BASE_URL}>
      <div className="app-container">
        <header className="app-header">
          <h1>Parametric Insurance Dashboard</h1>
          <div className="user-info">
            <span>
              Logged in as: <strong>{party}</strong>
            </span>
            <button onClick={onLogout}>Logout</button>
          </div>
        </header>
        <main className="app-main">
          <PolicyView />
        </main>
      </div>
    </DamlLedger>
  );
};


/**
 * The root component of the application. It manages the authentication state
 * and decides whether to show the login screen or the main application view.
 */
const App: React.FC = () => {
  // Attempt to load credentials from localStorage to persist session
  const [credentials, setCredentials] = useState<{
    party: string;
    token: string;
  } | null>(() => {
    const savedParty = localStorage.getItem('party');
    const savedToken = localStorage.getItem('token');
    if (savedParty && savedToken) {
      return { party: savedParty, token: savedToken };
    }
    return null;
  });

  const handleLogin = (party: string, token: string) => {
    localStorage.setItem('party', party);
    localStorage.setItem('token', token);
    setCredentials({ party, token });
  };

  const handleLogout = () => {
    localStorage.removeItem('party');
    localStorage.removeItem('token');
    setCredentials(null);
  };

  if (!credentials) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <MainScreen
      party={credentials.party}
      token={credentials.token}
      onLogout={handleLogout}
    />
  );
};

export default App;