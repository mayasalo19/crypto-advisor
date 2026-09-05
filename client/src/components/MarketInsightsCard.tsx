import React, { useState, useEffect } from "react";
import { fetchMarketInsights, type InsightsResponse } from "../services/api";
import { VoteButtons } from './VoteButtons';

interface Props {
  investorType?: string;
  trackedAssets?: string[];
}

export const MarketInsightsCard: React.FC<Props> = ({
  investorType = "DeFi Explorer",
  trackedAssets = ["ETH", "AVAX"],
}) => {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarketInsights({
        investor_type: investorType,
        interested_assets: trackedAssets,
      });
      setInsights(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [investorType, JSON.stringify(trackedAssets)]);

  const isPositiveSentiment =
    insights?.sentiment.toLowerCase().includes("bullish") ||
    insights?.sentiment.toLowerCase().includes("optimis");

  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #30363d",
        borderRadius: "10px",
        padding: "20px 24px",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        color: "#c9d1d9",
      }}
    >
      {/* Header Row */}
        <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingBottom: "14px",
            borderBottom: "1px solid #21262d", // Divider matching CoinPricesSection
        }}
        >
        <h3 style={{ margin: 0, color: "#f0f6fc", fontSize: "1.1rem", fontWeight: 600 }}>
            AI Market Insights
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <VoteButtons section="insights" />
            <button
            onClick={loadInsights}
            disabled={loading}
            style={{
                background: "#21262d",
                color: "#c9d1d9",
                border: "1px solid #30363d",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "0.85rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "border-color 0.2s",
            }}
            >
            {loading ? "Analyzing..." : "Refresh"}
            </button>
        </div>
        </div>

      {error && <p style={{ color: "#f85149", margin: "10px 0" }}>{error}</p>}

      {loading && !insights && (
        <p style={{ color: "#8b949e", fontStyle: "italic", margin: "12px 0" }}>
          Generating customized market analysis...
        </p>
      )}

      {insights && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Sentiment Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#8b949e", fontSize: "0.9rem", fontWeight: 500 }}>Sentiment:</span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                background: isPositiveSentiment ? "rgba(46, 160, 67, 0.15)" : "rgba(218, 54, 51, 0.15)",
                color: isPositiveSentiment ? "#56d364" : "#f85149",
                border: `1px solid ${isPositiveSentiment ? "rgba(46, 160, 67, 0.3)" : "rgba(218, 54, 51, 0.3)"}`,
              }}
            >
              {insights.sentiment}
            </span>
          </div>

          {/* Analysis */}
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: "0.95rem" }}>
            <strong style={{ color: "#f0f6fc" }}>Analysis: </strong>
            {insights.analysis}
          </p>

          {/* Recommendation */}
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: "0.95rem" }}>
            <strong style={{ color: "#f0f6fc" }}>Recommendation: </strong>
            {insights.recommendation}
          </p>

          {/* Metadata Footer */}
          <div style={{ fontSize: "0.75rem", color: "#6e7681", borderTop: "1px solid #21262d", paddingTop: "10px" }}>
            Assets: {insights.assets_evaluated?.join(", ") || "None"} | Persona: {insights.investor_type}
          </div>
        </div>
      )}
    </div>
  );
};