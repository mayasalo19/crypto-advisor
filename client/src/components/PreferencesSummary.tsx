import React from 'react';
import { type PreferencesData } from '../services/api';

interface PreferencesSummaryProps {
  preferences: PreferencesData;
}

export const PreferencesSummary: React.FC<PreferencesSummaryProps> = ({ preferences }) => {
  const cardStyle: React.CSSProperties = {
    padding: '16px 20px',
    border: '1px solid #30363d',
    borderRadius: '10px',
    background: '#161b22',
    textAlign: 'left', // Aligns everything cleanly to the left
  };

  const titleStyle: React.CSSProperties = {
    margin: '0 0 10px 0',
    color: '#8b949e',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  };

  return (
    <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '32px' }}>
      {/* Persona Card */}
      <div style={cardStyle}>
        <h4 style={titleStyle}>Investor Persona</h4>
        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#58a6ff', margin: 0 }}>
          {preferences.investor_type || 'General'}
        </p>
      </div>

      {/* Tracked Assets Card */}
      <div style={cardStyle}>
        <h4 style={titleStyle}>Tracked Assets</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {preferences.interested_assets && preferences.interested_assets.length > 0 ? (
            preferences.interested_assets.map((asset) => (
              <span
                key={asset}
                style={{
                  padding: '4px 10px',
                  background: 'rgba(56, 139, 253, 0.15)',
                  color: '#79c0ff',
                  border: '1px solid rgba(56, 139, 253, 0.3)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {asset}
              </span>
            ))
          ) : (
            <span style={{ color: '#6e7681', fontSize: '0.85rem' }}>None selected</span>
          )}
        </div>
      </div>

      {/* Content Feed Card */}
      <div style={cardStyle}>
        <h4 style={titleStyle}>Content Feed</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {preferences.content_types && preferences.content_types.length > 0 ? (
            preferences.content_types.map((content) => (
              <span
                key={content}
                style={{
                  padding: '4px 10px',
                  background: 'rgba(46, 160, 67, 0.15)',
                  color: '#56d364', // Brighter readable green
                  border: '1px solid rgba(46, 160, 67, 0.3)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                {content}
              </span>
            ))
          ) : (
            <span style={{ color: '#6e7681', fontSize: '0.85rem' }}>All content</span>
          )}
        </div>
      </div>
    </div>
  );
};