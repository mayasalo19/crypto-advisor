import React, { useState } from 'react';
import { submitVote } from '../services/api';

interface VoteButtonsProps {
  section: 'insights' | 'prices' | 'news' | 'meme';
  itemId?: string;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({ section, itemId }) => {
  const [currentVote, setCurrentVote] = useState<1 | -1 | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleVote = async (voteValue: 1 | -1) => {
    if (submitting || currentVote === voteValue) return;

    // Retrieve user identity from local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user.email || 'anonymous_trader';

    setSubmitting(true);
    try {
      await submitVote({
        user_id: String(userId),
        section,
        vote: voteValue,
        item_id: itemId,
      });
      setCurrentVote(voteValue);
    } catch (err) {
      console.error(`Failed to record vote for ${section}:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <button
        onClick={() => handleVote(1)}
        disabled={submitting}
        title="Vote Up"
        style={{
          background: currentVote === 1 ? '#28a745' : '#2b313a',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '4px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          padding: '2px 8px',
          fontSize: '0.85rem',
          transition: 'background 0.2s',
        }}
      >
        👍
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={submitting}
        title="Vote Down"
        style={{
          background: currentVote === -1 ? '#dc3545' : '#2b313a',
          color: '#fff',
          border: '1px solid #444',
          borderRadius: '4px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          padding: '2px 8px',
          fontSize: '0.85rem',
          transition: 'background 0.2s',
        }}
      >
        👎
      </button>
    </div>
  );
};