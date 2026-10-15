import React, { useState, useEffect, useCallback } from 'react';
import { AppView } from '../../types';
import { WeakTopicResult } from '../../services/computeWeakTopics';
import { getStudentWeakTopics, logChallengeAttempt } from '../../services/challengeTracker';
import { Target, ArrowRight, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface WeakTopicsPanelProps {
  setView: (view: AppView) => void;
}

export const WeakTopicsPanel: React.FC<WeakTopicsPanelProps> = ({ setView }) => {
  const [topics, setTopics] = useState<WeakTopicResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTopics = useCallback(async () => {
    try {
      const results = await getStudentWeakTopics();
      setTopics(results);
    } catch (_e) {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTopics();

    // Listen for live updates triggered by AI queries or challenge attempts
    const handler = () => {
      loadTopics();
    };

    window.addEventListener('gatemaster:weak-topics-updated', handler);
    return () => {
      window.removeEventListener('gatemaster:weak-topics-updated', handler);
    };
  }, [loadTopics]);

  // Handle "Practice this" button
  const handlePractice = (topic: WeakTopicResult) => {
    setView(topic.suggestedChallenge.engineMode);
  };

  // Generate a mock attempt for demonstration if empty
  const handleTryExample = async () => {
    // Log two failed attempts and an AI query to demonstrate live calculation
    await logChallengeAttempt('la-collapse', 'linear_algebra', ['determinant', 'collapse'], false, 2, 4500);
    await logChallengeAttempt('dl-carry', 'digital_logic', ['half_adder', 'xor', 'and'], false, 1, 3200);
    await loadTopics();
  };

  if (loading) {
    return (
      <div className="weak-panel-card">
        <div className="weak-panel-header">
          <Target size={16} className="text-yellow" />
          <span className="weak-panel-title">COMPUTING WEAK TOPICS & LEARNING GAPS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="weak-panel-card">
      <div className="weak-panel-header">
        <div className="weak-panel-title-group">
          <div className="weak-panel-icon-box">
            <Target size={16} />
          </div>
          <div>
            <h3 className="weak-panel-heading">Concept Mastery & Weak Topics</h3>
            <p className="weak-panel-subheading">
              Dynamic difficulty diagnostics derived from your challenge attempts, retries, and AI queries
            </p>
          </div>
        </div>

        {topics.length > 0 && (
          <span className="weak-panel-count-badge">
            {topics.length} Actionable Area{topics.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {topics.length === 0 ? (
        /* Empty State */
        <div className="weak-panel-empty">
          <div className="empty-icon-circle">
            <Sparkles size={20} className="text-sky" />
          </div>
          <div className="empty-text">
            <h4 className="empty-title">All Foundations Clean!</h4>
            <p className="empty-desc">
              You haven't failed any challenges or asked questions about difficult concepts yet. Try an interactive problem to diagnose your weak areas.
            </p>
          </div>
          <button onClick={handleTryExample} className="empty-action-btn">
            <span>Simulate Practice Diagnostic</span>
            <TrendingUp size={14} />
          </button>
        </div>
      ) : (
        /* Top 3 Weak Topics Grid */
        <div className="weak-cards-grid">
          {topics.map((t) => {
            // Normalize progress bar (max reference 10)
            const progressPct = Math.min(100, Math.round((t.score / 8.0) * 100));

            return (
              <div key={t.tag} className="weak-topic-card">
                <div className="weak-card-top">
                  <span className="weak-tag-name">{t.displayName}</span>
                  <span className="weak-score-badge">Weight: {t.score.toFixed(1)}</span>
                </div>

                {/* Progress-style Difficulty Intensity Bar */}
                <div className="weak-progress-bar-bg">
                  <div
                    className="weak-progress-bar-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="weak-card-reason">
                  <HelpCircle size={12} className="text-yellow" />
                  <span>{t.reason}</span>
                </div>

                <div className="weak-card-footer">
                  <span className="suggested-label">
                    Suggested: <strong>{t.suggestedChallenge.title}</strong>
                  </span>
                  <button
                    onClick={() => handlePractice(t)}
                    className="practice-btn"
                    title={`Open ${t.suggestedChallenge.title}`}
                  >
                    <span>Practice this</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
