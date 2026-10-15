import React from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';

interface ChallengeCardProps {
  title: string;
  description: string;
  isSolved: boolean;
  scoreText: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  title,
  description,
  isSolved,
  scoreText,
}) => {
  return (
    <div className={`challenge-box ${isSolved ? 'completed' : ''}`}>
      <div className="challenge-header">
        <span className="challenge-tag">{title}</span>
        {isSolved ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#facc15', fontSize: '0.75rem', fontWeight: 700 }}>
            <CheckCircle2 size={14} />
            <span>SOLVED</span>
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600 }}>
            <Trophy size={14} />
            <span>{scoreText}</span>
          </span>
        )}
      </div>
      <p className="challenge-text">{description}</p>
    </div>
  );
};
