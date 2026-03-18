import { useState, useEffect } from 'react';
import { getLocked, setLocked, hasPin, setPin, checkPin } from '../lib/pinLock';
import '../App.css';

export default function PinLockBar({ onLockChange }) {
  const [locked, setLockedState] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLockedState(getLocked());
    setHasPinSet(hasPin());
  }, []);

  useEffect(() => {
    onLockChange?.(locked);
  }, [locked, onLockChange]);

  function handleLock() {
    setLocked(true);
    setLockedState(true);
  }

  function handleUnlockSubmit(e) {
    e.preventDefault();
    setError('');
    checkPin(pinValue).then((ok) => {
      if (ok) {
        setLocked(false);
        setLockedState(false);
        setPinValue('');
        setShowUnlock(false);
      } else {
        setError('Wrong PIN');
      }
    });
  }

  function handleSetPinSubmit(e) {
    e.preventDefault();
    setError('');
    if (pinValue.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    if (pinValue !== pinConfirm) {
      setError('PINs do not match');
      return;
    }
    setPin(pinValue).then(() => {
      setHasPinSet(true);
      setPinValue('');
      setPinConfirm('');
      setShowSetPin(false);
    });
  }

  if (showSetPin) {
    return (
      <div className="pin-bar pin-bar-set">
        <form onSubmit={handleSetPinSubmit} className="pin-form">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="New PIN (4+ digits)"
            value={pinValue}
            onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
            className="input pin-input"
            maxLength={8}
          />
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Confirm PIN"
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
            className="input pin-input"
            maxLength={8}
          />
          <button type="submit" className="btn btn-primary">Set PIN</button>
          <button type="button" className="btn btn-ghost" onClick={() => { setShowSetPin(false); setError(''); setPinValue(''); setPinConfirm(''); }}>
            Cancel
          </button>
        </form>
        {error && <p className="pin-error">{error}</p>}
      </div>
    );
  }

  if (showUnlock) {
    return (
      <div className="pin-bar pin-bar-unlock">
        <form onSubmit={handleUnlockSubmit} className="pin-form">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter PIN to unlock"
            value={pinValue}
            onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
            className="input pin-input"
            autoFocus
          />
          <button type="submit" className="btn btn-primary">Unlock</button>
          <button type="button" className="btn btn-ghost" onClick={() => { setShowUnlock(false); setPinValue(''); setError(''); }}>
            Cancel
          </button>
        </form>
        {error && <p className="pin-error">{error}</p>}
      </div>
    );
  }

  if (locked) {
    return (
      <div className="pin-bar pin-bar-locked">
        <span className="pin-bar-label">Locked – no changes allowed</span>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowUnlock(true)}>
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div className="pin-bar">
      {hasPinSet ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLock}>
          Lock
        </button>
      ) : (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowSetPin(true)}>
          Set PIN to lock
        </button>
      )}
    </div>
  );
}
