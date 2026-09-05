import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, type PreferencesData, type CoinPrice, type NewsArticle } from '../services/api';
import { MarketInsightsCard } from '../components/MarketInsightsCard';
import { PreferencesSummary } from '../components/PreferencesSummary';
import { CoinPricesSection } from '../components/CoinPricesSection';
import { MarketNewsSection } from '../components/MarketNewsSection';
import { CryptoMemeCard } from '../components/CryptoMemeCard';

export const DashboardPage: React.FC = () => {
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await authApi.getPreferences();
        setPreferences(res.data);

        const assets = res.data.interested_assets || [];
        if (assets.length > 0) {
          setPricesLoading(true);
          try {
            const priceRes = await authApi.getPrices(assets);
            setPrices(priceRes.data);
          } catch (priceErr) {
            console.error('Failed to load prices:', priceErr);
          } finally {
            setPricesLoading(false);
          }

          setNewsLoading(true);
          try {
            const newsRes = await authApi.getNews(assets);
            setNews(newsRes.data);
          } catch (newsErr) {
            console.error('Failed to load news:', newsErr);
          } finally {
            setNewsLoading(false);
          }
        }
      } catch (err: any) {
        setError('Failed to fetch user preferences.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // Helper check for flexible matching across display labels or raw keys
  const hasContentType = (keyPattern: string) => {
    if (!preferences?.content_types || preferences.content_types.length === 0) {
      return true; // Default fallback to show all if unset
    }
    return preferences.content_types.some((type) =>
      type.toLowerCase().includes(keyPattern.toLowerCase())
    );
  };

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#f8fafc' }}>
            Welcome back, {user.name && user.name !== 'string' ? user.name : (user.email ? user.email.split('@')[0] : 'Trader')}!
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>{user.email}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('/onboarding')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#e2e8f0',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#334155';
              e.currentTarget.style.borderColor = '#475569';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b';
              e.currentTarget.style.borderColor = '#334155';
            }}
          >
            Edit Preferences
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: '#450a0a',
              color: '#fca5a5',
              border: '1px solid #991b1b',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#7f1d1d';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#450a0a';
              e.currentTarget.style.color = '#fca5a5';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ marginTop: '24px' }}>
        {loading && <p style={{ color: '#94a3b8' }}>Loading your profile...</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        {preferences && (
          <>
            <PreferencesSummary preferences={preferences} />

            {/* AI Insights Section */}
            {hasContentType('insight') && (
              <section style={{ borderTop: '1px solid #334155', paddingTop: '20px', marginBottom: '24px' }}>
                <MarketInsightsCard
                  investorType={preferences.investor_type}
                  trackedAssets={preferences.interested_assets}
                />
              </section>
            )}

            {/* Coin Prices Section */}
            {(hasContentType('price') || hasContentType('track')) && (
                <CoinPricesSection prices={prices} loading={pricesLoading} />
            )}

            {/* Market News Section */}
            {hasContentType('news') && (
              <MarketNewsSection news={news} loading={newsLoading} />
            )}

            {/* Crypto Meme / Culture Section */}
            {(hasContentType('meme') || hasContentType('culture') || hasContentType('fun')) && (
              <CryptoMemeCard />
            )}
          </>
        )}
      </main>
    </div>
  );
};