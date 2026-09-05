import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authApi.login({ email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        if (res.data.isFirstTime) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        const res = await authApi.register({ name, email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#94a3b8',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        backgroundColor: '#0b0f19',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
            {isLogin ? 'Sign In' : 'Create an Account'}
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
            {isLogin ? 'Enter your credentials to continue' : 'Start tracking crypto with AI insights'}
        </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '13px',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#334155')}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#334155')}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#334155')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'none',
            }}
            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};