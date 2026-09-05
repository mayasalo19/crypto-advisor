import React from 'react';
import { type CoinPrice } from '../services/api';
import { VoteButtons } from './VoteButtons';

interface CoinPricesSectionProps {
  prices: CoinPrice[];
  loading: boolean;
}

export const CoinPricesSection: React.FC<CoinPricesSectionProps> = ({ prices, loading }) => {
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
      {/* Header inside the container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '14px',
          borderBottom: '1px solid #21262d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, color: '#f0f6fc', fontSize: '1.15rem', fontWeight: 600 }}>
            Coin Prices (CoinGecko)
          </h3>
          {loading && (
            <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Updating rates...</span>
          )}
        </div>

        <VoteButtons section="prices" />
      </div>

      {/* Direct content row */}
      {prices.map((item) => {
        const isPositive = item.change_24h >= 0;
        return (
          <div
            key={item.symbol}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0f6fc', lineHeight: '1.2' }}>
                {item.symbol}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                24h Performance
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0f6fc', lineHeight: '1.2' }}>
                ${item.price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: isPositive ? '#4ade80' : '#f87171',
                  backgroundColor: isPositive ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {isPositive ? `+${item.change_24h.toFixed(2)}%` : `${item.change_24h.toFixed(2)}%`}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};