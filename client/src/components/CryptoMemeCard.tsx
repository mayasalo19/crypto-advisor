import React, { useState, useEffect } from "react";
import { getCryptoMeme, type CryptoMeme } from "../services/api";
import { VoteButtons } from "./VoteButtons";

export const CryptoMemeCard: React.FC = () => {
  const [meme, setMeme] = useState<CryptoMeme | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchMeme = async () => {
    setLoading(true);
    try {
      const data = await getCryptoMeme();
      setMeme(data);
    } catch (err) {
      console.error("Error loading crypto meme:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeme();
  }, []);

  return (
    <section
      style={{
        backgroundColor: "#161b22",
        border: "1px solid #30363d",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      {/* Header inside container with divider */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          paddingBottom: "14px",
          borderBottom: "1px solid #21262d",
        }}
      >
        <h3 style={{ margin: 0, color: "#f0f6fc", fontSize: "1.15rem", fontWeight: 600 }}>
          Fun Crypto Meme 
        </h3>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <VoteButtons section="meme" itemId={meme?.id} />
          <button
            onClick={fetchMeme}
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
            {loading ? "Fetching..." : "Next Meme"}
          </button>
        </div>
      </div>

      {/* Meme Content Area directly inside the main container */}
      {meme ? (
        <div style={{ textAlign: "center" }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", color: "#f0f6fc", fontWeight: 600 }}>
            {meme.title}
          </h4>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              src={meme.image_url}
              alt={meme.title}
              style={{
                maxWidth: "100%",
                maxHeight: "420px",
                borderRadius: "8px",
                objectFit: "contain",
                border: "1px solid #21262d",
              }}
            />
          </div>

          <div style={{ marginTop: "14px", fontSize: "0.8rem", color: "#8b949e" }}>
            Posted by <span style={{ color: "#c9d1d9" }}>u/{meme.author}</span>
            {meme.permalink && (
              <>
                {" "}·{" "}
                <a
                  href={meme.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#58a6ff", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  View on Reddit
                </a>
              </>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: "#8b949e", fontStyle: "italic", margin: "16px 0", textAlign: "center" }}>
          Loading fresh meme from Reddit...
        </p>
      )}
    </section>
  );
};