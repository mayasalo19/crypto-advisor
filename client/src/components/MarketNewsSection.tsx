import React from 'react';
import { type NewsArticle } from '../services/api';
import { VoteButtons } from './VoteButtons';

interface MarketNewsSectionProps {
  news: NewsArticle[];
  loading: boolean;
}

export const MarketNewsSection: React.FC<MarketNewsSectionProps> = ({ news, loading }) => {
  return (
    <section
      style={{
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      {/* Header inside container with divider */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid #21262d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, color: '#f0f6fc', fontSize: '1.15rem', fontWeight: 600 }}>
            Market News
          </h3>
          {loading && (
            <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Loading news...</span>
          )}
        </div>

        <VoteButtons section="news" />
      </div>

      {/* News list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {news.map((item, idx) => (
          <a
            key={idx}
            href={item.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '16px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid #30363d',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = '#484f58';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.borderColor = '#30363d';
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                width: '100%',
              }}
            >
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#58a6ff',
                  lineHeight: 1.4,
                  flex: 1,
                }}
              >
                {item.title}
              </span>
              {item.published_at && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#8b949e',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {item.published_at}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                {item.source || 'CryptoDesk'}
              </span>

              {item.currencies && item.currencies.length > 0 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {item.currencies.map((curr) => (
                    <span
                      key={curr}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: '#c9d1d9',
                        backgroundColor: '#21262d',
                        border: '1px solid #30363d',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {curr}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};