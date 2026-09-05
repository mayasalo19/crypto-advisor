import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const ASSET_OPTIONS = ['BTC', 'ETH', 'SOL', 'ADA', 'AVAX', 'DOT'];
const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'Swing Trader', 'DeFi Explorer'];
const CONTENT_OPTIONS = ['Market News', 'Live Market Tracker', 'AI Insight of the Day', 'Fun Crypto Meme'];

export const OnboardingPage: React.FC = () => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<string>(INVESTOR_TYPES[0]);
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    setList(
      list.includes(item) 
        ? list.filter((i) => i !== item) 
        : [...list, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssets.length === 0 || selectedContent.length === 0) {
      setError('Please select at least one asset and one content preference.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.savePreferences({
        interested_assets: selectedAssets,
        investor_type: investorType,
        content_types: selectedContent,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save preferences.');
    } finally {
      setLoading(false);
    }
  };

  const sectionHeadingStyle: React.CSSProperties = {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
    letterSpacing: '0.3px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        backgroundColor: '#0b0f19',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
            Personalize Your Feed
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
            Set your investment preferences to customize your recommendations.
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
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Assets */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={sectionHeadingStyle}>1. Select Assets You Follow</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ASSET_OPTIONS.map((asset) => {
                const active = selectedAssets.includes(asset);
                return (
                  <button
                    type="button"
                    key={asset}
                    onClick={() => toggleSelection(asset, selectedAssets, setSelectedAssets)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${active ? '#3b82f6' : '#334155'}`,
                      background: active ? '#2563eb' : '#0f172a',
                      color: active ? '#ffffff' : '#94a3b8',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {asset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Persona */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={sectionHeadingStyle}>2. Investor Persona</h4>
            <select
              value={investorType}
              onChange={(e) => setInvestorType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              {INVESTOR_TYPES.map((type) => (
                <option key={type} value={type} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Content Preferences */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={sectionHeadingStyle}>3. Preferred Content Types</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CONTENT_OPTIONS.map((content) => {
                const active = selectedContent.includes(content);
                return (
                  <button
                    type="button"
                    key={content}
                    onClick={() => toggleSelection(content, selectedContent, setSelectedContent)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${active ? '#10b981' : '#334155'}`,
                      background: active ? '#059669' : '#0f172a',
                      color: active ? '#ffffff' : '#94a3b8',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
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
            {loading ? 'Saving Preferences...' : 'Complete Onboarding'}
          </button>
        </form>
      </div>
    </div>
  );
};