import React, { useState, useEffect } from 'react';
import { PolicyView } from './PolicyView';

// Credentials needed for authenticating with the Canton JSON API
export type Credentials = {
  party: string;
  token: string;
};

// Basic CSS-in-JS styles for the application layout and components
const styles: { [key: string]: React.CSSProperties } = {
  appContainer: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    textAlign: 'center',
    color: '#333',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  appHeader: {
    backgroundColor: '#003b5c', // Canton blue
    padding: '20px',
    color: 'white',
    marginBottom: '30px',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.8em',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '0.9em',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
  },
  loginContainer: {
    maxWidth: '500px',
    margin: '60px auto',
    padding: '40px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  label: {
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
  },
  input: {
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
  },
  loginButton: {
    padding: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  footer: {
    marginTop: '40px',
    padding: '20px',
    fontSize: '0.8em',
    color: '#888',
    borderTop: '1px solid #eee',
  }
};

const App: React.FC = () => {
  // Attempt to load credentials from localStorage on initial render for session persistence
  const [credentials, setCredentials] = useState<Credentials | null>(() => {
    const savedCreds = localStorage.getItem('daml.credentials');
    if (savedCreds) {
      try {
        const parsed = JSON.parse(savedCreds);
        if (parsed.party && parsed.token) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse credentials from localStorage", e);
        localStorage.removeItem('daml.credentials');
      }
    }
    return null;
  });

  // Save credentials to localStorage whenever they change
  useEffect(() => {
    if (credentials) {
      localStorage.setItem('daml.credentials', JSON.stringify(credentials));
    } else {
      localStorage.removeItem('daml.credentials');
    }
  }, [credentials]);

  const handleLogin = (creds: Credentials) => {
    setCredentials(creds);
  };

  const handleLogout = () => {
    setCredentials(null);
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.appHeader}>
        <h1 style={styles.headerTitle}>Canton Parametric Insurance</h1>
        {credentials && (
          <div style={styles.userInfo}>
            <span>Logged in as: <strong>{credentials.party}</strong></span>
            <button
              onClick={handleLogout}
              style={styles.logoutButton}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e60000')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff4d4d')}
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <main>
        {credentials ? (
          <PolicyView credentials={credentials} />
        ) : (
          <LoginScreen onLogin={handleLogin} />
        )}
      </main>
      <footer style={styles.footer}>
        <p>Powered by Daml and Canton Network</p>
      </footer>
    </div>
  );
};

// Login component with presets for easy testing in a local environment
const LoginScreen: React.FC<{ onLogin: (credentials: Credentials) => void }> = ({ onLogin }) => {
  const [party, setParty] = useState('');
  const [token, setToken] = useState('');

  // Example tokens for a local sandbox with `applicationId: 'insurance'`.
  // These should be generated based on your Canton setup.
  const presets = [
    { name: "Insurer", party: "Insurer", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2RhbWwuY29tL2xlZGdlci1hcGkiOnsibGVkZ2VySWQiOiJteWxvY2FsbGVkZ2VyIiwiYXBwbGljYXRpb25JZCI6Imluc3VyYW5jZSIsImFjdEFzIjpbIkluc3VyZXIiXX19.e5nBVI726x1p5-IBS04_4YvV15aembA6Kj2GVCpc22c" },
    { name: "Alice (PolicyHolder)", party: "Alice", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2RhbWwuY29tL2xlZGdlci1hcGkiOnsibGVkZ2VySWQiOiJteWxvY2FsbGVkZ2VyIiwiYXBwbGljYXRpb25JZCI6Imluc3VyYW5jZSIsImFjdEFzIjpbIkFsaWNlIl19fQ.FEG0-pLpgg--tNqVWgnJjAnGuWw0o_2pm3G22Gqmxsc" },
    { name: "WeatherOracle", party: "WeatherOracle", token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2RhbWwuY29tL2xlZGdlci1hcGkiOnsibGVkZ2VySWQiOiJteWxvY2FsbGVkZ2VyIiwiYXBwbGljYXRpb25JZCI6Imluc3VyYW5jZSIsImFjdEFzIjpbIldlYXRoZXJPcmFjbGUiXX19.6U4yMAvP2QLLBIEgMoY4nB2wP2u1dfCeIMpSnzUq3wM" },
  ];

  const handlePresetSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedParty = event.target.value;
    const preset = presets.find(p => p.party === selectedParty);
    if (preset) {
      setParty(preset.party);
      setToken(preset.token);
    } else {
      setParty('');
      setToken('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (party.trim() && token.trim()) {
      onLogin({ party: party.trim(), token: token.trim() });
    }
  };

  return (
    <div style={styles.loginContainer}>
      <h2>Login to Canton Network</h2>
      <p>Select a preset user or enter your party and token manually.</p>
      <form onSubmit={handleSubmit} style={styles.loginForm}>
        <div style={styles.formGroup}>
            <label htmlFor="preset-select" style={styles.label}>User Preset:</label>
            <select id="preset-select" onChange={handlePresetSelect} defaultValue="" style={styles.input}>
                <option value="" disabled>-- Select a role --</option>
                {presets.map(p => <option key={p.party} value={p.party}>{p.name}</option>)}
            </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="party" style={styles.label}>Party ID:</label>
          <input
            id="party"
            type="text"
            value={party}
            onChange={(e) => setParty(e.target.value)}
            placeholder="Enter Party ID"
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="token" style={styles.label}>DAML JSON API Token:</label>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter JWT Token"
            required
            style={styles.input}
          />
        </div>
        <button
          type="submit"
          style={styles.loginButton}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default App;