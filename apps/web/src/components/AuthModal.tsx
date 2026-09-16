'use client';

import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (userData: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Send Login Request to your Express Backend
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      // 2. Persist Auth State (Save token and user info)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // 3. Trigger Navbar/App State Update
      if (onLoginSuccess) {
        onLoginSuccess(data.user || { email: loginEmail });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Send Register Request to Backend
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to register account');
      }

      // 2. Automatically log in after registration
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.user || { name: regName, email: regEmail });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1E1E24',
          border: '1px solid #2E2E38',
          borderRadius: '16px',
          padding: '28px',
          color: '#FFF',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        {/* Display Error Message if Any */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#3B1212',
            border: '1px solid #7F1D1D',
            color: '#F87171',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold' }}>
              Sign In to Foodora<span style={{ color: '#FF5A36' }}>X</span>
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0D0D11',
                  border: '1px solid #2E2E38',
                  borderRadius: '8px',
                  color: '#FFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0D0D11',
                  border: '1px solid #2E2E38',
                  borderRadius: '8px',
                  color: '#FFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#88301B' : '#FF5A36',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 12px rgba(255, 90, 54, 0.3)'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#9CA3AF' }}>
              Don't have an account?{' '}
              <span 
                onClick={() => { setErrorMsg(''); setMode('signup'); }}
                style={{ color: '#FF5A36', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Create Account
              </span>
            </p>
          </form>
        ) : (
          /* 2. CREATE ACCOUNT FORM */
          <form onSubmit={handleSignUp}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold' }}>
              Create Foodora<span style={{ color: '#FF5A36' }}>X</span> Account
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px' }}>Full Name</label>
              <input 
                type="text" 
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0D0D11',
                  border: '1px solid #2E2E38',
                  borderRadius: '8px',
                  color: '#FFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0D0D11',
                  border: '1px solid #2E2E38',
                  borderRadius: '8px',
                  color: '#FFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0D0D11',
                  border: '1px solid #2E2E38',
                  borderRadius: '8px',
                  color: '#FFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '6px' }}>Confirm Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#0D0D11',
                  border: '1px solid #2E2E38',
                  borderRadius: '8px',
                  color: '#FFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#88301B' : '#FF5A36',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 12px rgba(255, 90, 54, 0.3)'
              }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#9CA3AF' }}>
              Already have an account?{' '}
              <span 
                onClick={() => { setErrorMsg(''); setMode('signin'); }}
                style={{ color: '#FF5A36', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Sign In
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}