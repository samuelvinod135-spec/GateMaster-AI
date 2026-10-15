import React, { useState, useEffect, useCallback } from 'react';
import { AppView, Matrix2x2, LogicInputs } from '../../types';
import { AIProblemResponse, AIStep, WeakTopicStat } from '../../types/ai';
import {
  solveProblemWithAI,
  getLocalQueryHistory,
  computeWeakTopics,
} from '../../services/aiProblemService';
import { mapVisualConfigToEngine } from '../../services/mapAIResultToEngine';
import {
  Sparkles,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Target,
  WifiOff,
  Compass,
} from 'lucide-react';

interface AIProblemBoxProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  loadMatrixPreset: (preset: Matrix2x2) => void;
  setLogicInputsState: (inputs: LogicInputs) => void;
  onClose?: () => void;
}

type AIBoxState = 'idle' | 'loading' | 'success' | 'error' | 'unsupported';

const EXAMPLE_PROMPTS = [
  'Rotate 90 degrees then shear',
  'Design a half adder',
  'What does a determinant of 0 mean?',
];

export const AIProblemBox: React.FC<AIProblemBoxProps> = ({
  setView,
  loadMatrixPreset,
  setLogicInputsState,
  onClose,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [status, setStatus] = useState<AIBoxState>('idle');
  const [response, setResponse] = useState<AIProblemResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isOfflineDemo, setIsOfflineDemo] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [weakTopics, setWeakTopics] = useState<WeakTopicStat[]>([]);

  // Refresh weak topics on mount and query updates
  const refreshWeakTopics = useCallback(() => {
    const history = getLocalQueryHistory();
    const stats = computeWeakTopics(history);
    setWeakTopics(stats);
  }, []);

  useEffect(() => {
    refreshWeakTopics();
  }, [refreshWeakTopics]);

  // Apply visual config of current step to active engine
  const applyStepVisual = useCallback(
    (step: AIStep | null, finalVisual = false) => {
      const visualToApply = finalVisual
        ? response?.final_visual || step?.visual || null
        : step?.visual || null;

      const mapped = mapVisualConfigToEngine(visualToApply);

      if (mapped.type === 'matrix' && mapped.matrix) {
        setView('linear-algebra');
        loadMatrixPreset(mapped.matrix);
      } else if (mapped.type === 'circuit' && mapped.logicInputs) {
        setView('digital-logic');
        setLogicInputsState(mapped.logicInputs);
      }
    },
    [response, setView, loadMatrixPreset, setLogicInputsState]
  );

  // Handle problem submission
  const handleSubmit = async (queryText?: string) => {
    const textToSubmit = (queryText || prompt).trim();
    if (!textToSubmit) return;

    setStatus('loading');
    setErrorMessage('');
    setCurrentStepIndex(0);

    try {
      const result = await solveProblemWithAI(textToSubmit);
      setIsOfflineDemo(result.isOfflineDemo);
      setResponse(result.data);

      if (result.data.topic === 'unsupported') {
        setStatus('unsupported');
      } else {
        setStatus('success');
        // Switch to the appropriate engine tab immediately
        if (result.data.topic === 'linear_algebra') {
          setView('linear-algebra');
        } else if (result.data.topic === 'digital_logic') {
          setView('digital-logic');
        }

        // Apply first step visual
        if (result.data.steps.length > 0) {
          const firstStep = result.data.steps[0];
          const mapped = mapVisualConfigToEngine(firstStep.visual);
          if (mapped.type === 'matrix' && mapped.matrix) {
            loadMatrixPreset(mapped.matrix);
          } else if (mapped.type === 'circuit' && mapped.logicInputs) {
            setLogicInputsState(mapped.logicInputs);
          }
        }
      }

      refreshWeakTopics();
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process AI query');
    }
  };

  // Stepper navigation
  const goToNextStep = () => {
    if (!response || currentStepIndex >= response.steps.length - 1) return;
    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);
    applyStepVisual(response.steps[nextIndex]);
  };

  const goToPrevStep = () => {
    if (!response || currentStepIndex <= 0) return;
    const prevIndex = currentStepIndex - 1;
    setCurrentStepIndex(prevIndex);
    applyStepVisual(response.steps[prevIndex]);
  };

  // "Try it yourself" handler
  const handleTryItYourself = () => {
    if (!response) return;
    applyStepVisual(null, true);
    if (onClose) onClose();
  };

  const handleReset = () => {
    setStatus('idle');
    setResponse(null);
    setCurrentStepIndex(0);
    setPrompt('');
  };

  return (
    <div className="ai-box-container">
      {/* Box Header */}
      <div className="ai-box-header">
        <div className="ai-box-title">
          <div className="ai-sparkle-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="ai-box-heading">AI Problem Solver & Concept Tutor</span>
            <span className="ai-box-subheading">
              Type any concept to generate structured, interactive visual proofs
            </span>
          </div>
        </div>

        {isOfflineDemo && (
          <div className="offline-badge" title="Local fallback active. Edge function offline or unconfigured.">
            <WifiOff size={12} />
            <span>Offline Demo</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="ai-input-form"
      >
        <div className="ai-input-wrapper">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question (e.g. 'rotate 90 degrees then shear', 'design a half adder')..."
            className="ai-text-input"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || status === 'loading'}
            className="ai-submit-btn"
            title="Submit question to AI Tutor"
          >
            {status === 'loading' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span>Solve</span>
          </button>
        </div>
      </form>

      {/* Example Prompt Chips */}
      <div className="ai-prompt-chips">
        <span className="chips-label">Try an example:</span>
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setPrompt(example);
              void handleSubmit(example);
            }}
            disabled={status === 'loading'}
            className="chip-btn"
          >
            <Compass size={12} />
            <span>{example}</span>
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {status === 'loading' && (
        <div className="ai-state-box loading">
          <Loader2 size={24} className="animate-spin text-sky" />
          <div className="loading-text">
            <span className="loading-title">AI Engineering Tutor Analyzing Concept...</span>
            <span className="loading-sub">
              Generating step-by-step explanation & mathematical canvas configs
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="ai-state-box error">
          <AlertCircle size={20} className="text-yellow" />
          <div className="error-text">
            <span className="error-title">Unable to solve query</span>
            <span className="error-desc">{errorMessage || 'An unexpected error occurred.'}</span>
          </div>
          <button onClick={() => void handleSubmit()} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Unsupported Topic State */}
      {status === 'unsupported' && response && (
        <div className="ai-state-box unsupported">
          <HelpCircle size={22} className="text-yellow" />
          <div className="unsupported-content">
            <h4 className="unsupported-title">{response.title || 'Concept Outside Sandbox Scope'}</h4>
            <p className="unsupported-desc">
              {response.unsupported_reason ||
                "GateMaster AI's interactive engines currently specialize in 2D Linear Algebra transformations and Digital Logic Half-Adder circuits."}
            </p>
            <div className="unsupported-recommendation">
              <span>Try asking about:</span>
              <div className="rec-pills">
                <button
                  onClick={() => {
                    setPrompt('Rotate 90 degrees then shear');
                    void handleSubmit('Rotate 90 degrees then shear');
                  }}
                  className="rec-pill"
                >
                  Matrix Rotation & Shear
                </button>
                <button
                  onClick={() => {
                    setPrompt('Design a half adder');
                    void handleSubmit('Design a half adder');
                  }}
                  className="rec-pill"
                >
                  Half-Adder Circuit
                </button>
                <button
                  onClick={() => {
                    setPrompt('What does a determinant of 0 mean?');
                    void handleSubmit('What does a determinant of 0 mean?');
                  }}
                  className="rec-pill"
                >
                  Zero Determinant Collapse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success State: Interactive Stepper */}
      {status === 'success' && response && (
        <div className="ai-stepper-card">
          <div className="stepper-header">
            <div className="stepper-title-area">
              <span className="stepper-tag">
                {response.topic === 'linear_algebra' ? 'LINEAR ALGEBRA' : 'DIGITAL LOGIC'}
              </span>
              <h3 className="stepper-headline">{response.title}</h3>
            </div>

            <div className="stepper-controls">
              <span className="step-counter">
                Step {currentStepIndex + 1} of {response.steps.length}
              </span>
              <button
                onClick={goToPrevStep}
                disabled={currentStepIndex === 0}
                className="step-nav-btn"
                title="Previous Step"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNextStep}
                disabled={currentStepIndex === response.steps.length - 1}
                className="step-nav-btn"
                title="Next Step"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Current Step Content */}
          {response.steps[currentStepIndex] && (
            <div className="step-body">
              <h4 className="step-title">
                {response.steps[currentStepIndex].title}
              </h4>
              <p className="step-explanation">
                {response.steps[currentStepIndex].explanation}
              </p>
            </div>
          )}

          {/* Stepper Footer Actions */}
          <div className="stepper-footer">
            <button
              onClick={handleTryItYourself}
              className="try-yourself-btn"
              title="Apply final visual and interact freely with the canvas"
            >
              <Play size={14} />
              <span>Try It Yourself (Interactive Mode)</span>
            </button>

            <button
              onClick={handleReset}
              className="reset-query-btn"
              title="Ask another question"
            >
              <RotateCcw size={13} />
              <span>New Question</span>
            </button>
          </div>
        </div>
      )}

      {/* Weak Topics Panel */}
      {weakTopics.length > 0 && (
        <div className="weak-topics-panel">
          <div className="weak-topics-header">
            <Target size={14} className="text-yellow" />
            <span className="weak-topics-title">YOUR RECENT CONCEPTS & WEAK TOPICS</span>
          </div>
          <div className="weak-tags-list">
            {weakTopics.map((wt) => (
              <div key={wt.tag} className="weak-tag-pill">
                <span className="tag-name">{wt.tag.replace(/_/g, ' ')}</span>
                <span className="tag-count">{wt.count} query{wt.count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
