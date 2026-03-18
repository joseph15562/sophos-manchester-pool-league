import { useState, useEffect } from 'react';

const AUTH_KEY = 'pool-league-auth';

export default function PasswordGate({ children }) {
  const passwordFromEnv = import.meta.env.VITE_APP_PASSWORD;
  const [passed, setPassed] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!passwordFromEnv) {
      setPassed(true);
      return;
    }
    try {
      if (sessionStorage.getItem(AUTH_KEY) === '1') setPassed(true);
    } catch {}
  }, [passwordFromEnv]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (value === passwordFromEnv) {
      try {
        sessionStorage.setItem(AUTH_KEY, '1');
      } catch {}
      setPassed(true);
    } else {
      setError('Wrong password');
    }
  }

  if (!passwordFromEnv) return children;
  if (passed) return children;

  return (
    <div className="password-gate">
      <div className="password-gate-box">
        <h1 className="password-gate-title">Sophos Manchester Pool League</h1>
        <p className="password-gate-hint">Enter the password to continue.</p>
        <form onSubmit={handleSubmit} className="password-gate-form">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Password"
            className="input password-gate-input"
            autoFocus
            autoComplete="current-password"
          />
          <button type="submit" className="btn btn-primary">
            Enter
          </button>
        </form>
        {error && <p className="password-gate-error">{error}</p>}
      </div>
    </div>
  );
}
