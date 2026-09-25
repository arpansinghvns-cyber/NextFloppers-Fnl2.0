import React, { useState, useEffect } from 'react';
import { TestQuestion } from '../types';
import { fetchTestQuestions } from '../lib/api';
import { 
  X, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Trophy, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface CbtAssessmentModalProps {
  testId: string;
  testTitle: string;
  onClose: () => void;
}

export const CbtAssessmentModal: React.FC<CbtAssessmentModalProps> = ({
  testId,
  testTitle,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadQuestions() {
      setLoading(true);
      try {
        const qList = await fetchTestQuestions(testId);
        if (isMounted) {
          if (qList && qList.length > 0) {
            setQuestions(qList);
          } else {
            // Mock sample questions if API returns empty
            setQuestions([
              {
                question_group_id: 1,
                mark_per_question: 4,
                negative_marks: 1,
                languages: {
                  english: {
                    question_text: "Which of the following is an example of a displacement reaction?",
                    option_a: "2H2 + O2 → 2H2O",
                    option_b: "Zn + CuSO4 → ZnSO4 + Cu",
                    option_c: "CaCO3 → CaO + CO2",
                    option_d: "NaCl + AgNO3 → AgCl + NaNO3"
                  }
                }
              },
              {
                question_group_id: 2,
                mark_per_question: 4,
                negative_marks: 1,
                languages: {
                  english: {
                    question_text: "What type of chemical reaction occurs during the respiration process?",
                    option_a: "Exothermic combination reaction",
                    option_b: "Endothermic decomposition reaction",
                    option_c: "Neutralization reaction",
                    option_d: "Precipitation reaction"
                  }
                }
              },
              {
                question_group_id: 3,
                mark_per_question: 4,
                negative_marks: 1,
                languages: {
                  english: {
                    question_text: "In the reaction: CuO + H2 → Cu + H2O, which substance is being oxidized?",
                    option_a: "CuO",
                    option_b: "Cu",
                    option_c: "H2",
                    option_d: "H2O"
                  }
                }
              }
            ]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadQuestions();
    return () => { isMounted = false; };
  }, [testId]);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted || loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, loading]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const qId = currentQ?.question_group_id;
  const currentLang = currentQ?.languages?.english;

  const handleSelectOption = (key: string) => {
    if (!qId) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: key
    }));
  };

  const handleClearResponse = () => {
    if (!qId) return;
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleSubmit = () => {
    if (confirm("Are you sure you want to submit your assessment?")) {
      setIsSubmitted(true);
    }
  };

  // Calculate results
  const totalQuestions = questions.length;
  const attemptedCount = Object.keys(userAnswers).length;
  const unattemptedCount = totalQuestions - attemptedCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#121212] border border-white/10 w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#171717]">
          <div>
            <span className="text-[10px] font-bold text-[#FACC15] uppercase tracking-wider">CBT TEST ENGINE</span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
              {testTitle}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {!isSubmitted && (
              <div className="flex items-center gap-2 bg-[#121212] border border-[#FACC15]/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#FACC15]">
                <Clock className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 text-stone-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin mb-3" />
            <p className="text-stone-400 text-xs font-semibold">Preparing questions...</p>
          </div>
        )}

        {/* Active Exam Interface */}
        {!loading && !isSubmitted && currentQ && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Question Workspace */}
            <div className="flex-1 flex flex-col p-5 sm:p-8 overflow-y-auto border-r border-white/5">
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-stone-400">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <div className="text-xs font-semibold">
                  <span className="text-emerald-400">+{currentQ.mark_per_question} Marks</span>
                  <span className="text-stone-600 mx-1.5">|</span>
                  <span className="text-red-400">-{currentQ.negative_marks} Neg</span>
                </div>
              </div>

              {/* Question Text */}
              <div
                className="text-base text-white font-medium mb-6 question-html leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentLang?.question_text || '' }}
              />

              {/* Options */}
              <div className="space-y-3 mb-8">
                {[
                  { key: 'option_a', label: currentLang?.option_a },
                  { key: 'option_b', label: currentLang?.option_b },
                  { key: 'option_c', label: currentLang?.option_c },
                  { key: 'option_d', label: currentLang?.option_d },
                  { key: 'option_e', label: currentLang?.option_e },
                ]
                  .filter(opt => opt.label && opt.label.trim() !== '')
                  .map((opt) => {
                    const isSelected = userAnswers[qId] === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelectOption(opt.key)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 text-sm ${
                          isSelected
                            ? 'bg-[#FACC15]/10 border-[#FACC15] text-white shadow-md'
                            : 'bg-[#171717] border-white/5 text-stone-300 hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-[#FACC15] bg-[#FACC15]' : 'border-stone-500'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                        <div
                          className="flex-1 question-html"
                          dangerouslySetInnerHTML={{ __html: opt.label || '' }}
                        />
                      </div>
                    );
                  })}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                <button
                  onClick={handleClearResponse}
                  className="text-xs text-stone-400 hover:text-stone-200 underline font-semibold"
                >
                  Clear Response
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold border border-white/10 text-stone-300 disabled:opacity-40 flex items-center gap-1 hover:bg-white/5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentIndex(prev => prev + 1)}
                      className="px-5 py-2 rounded-lg text-xs font-bold bg-[#FACC15] hover:bg-yellow-400 text-black flex items-center gap-1 shadow-md"
                    >
                      <span>Save & Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-5 py-2 rounded-lg text-xs font-bold bg-[#10B981] hover:bg-emerald-400 text-black flex items-center gap-1 shadow-md font-syne"
                    >
                      <span>Submit Test</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Questions Palette Sidebar */}
            <div className="w-full md:w-64 bg-[#141416] p-4 sm:p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5">
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider mb-4">
                  Question Palette
                </h4>
                <div className="grid grid-cols-5 gap-2 max-h-60 md:max-h-[50vh] overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    const answered = !!userAnswers[q.question_group_id];
                    const isCurrent = idx === currentIndex;

                    let bgClass = 'bg-[#1f1f22] text-stone-400 border-white/5';
                    if (answered) bgClass = 'bg-[#10B981] text-black font-bold border-transparent';
                    if (isCurrent) bgClass = 'border-[#FACC15] ring-2 ring-[#FACC15]/40 text-white font-bold';

                    return (
                      <button
                        key={q.question_group_id || idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${bgClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Answered:</span>
                  <span className="font-bold text-[#10B981]">{attemptedCount}</span>
                </div>
                <div className="flex items-center justify-between text-stone-400">
                  <span>Unanswered:</span>
                  <span className="font-bold text-stone-300">{unattemptedCount}</span>
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full mt-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors font-syne"
                >
                  Final Submit
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Results Screen */}
        {isSubmitted && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#171717] to-[#121212]">
            <div className="w-16 h-16 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] mb-4 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white font-syne mb-2">
              Assessment Submitted!
            </h3>
            <p className="text-stone-400 text-xs max-w-sm mb-6">
              Your test response has been recorded successfully. Here is your summary:
            </p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-md bg-[#18181b] border border-white/10 p-4 rounded-xl mb-6">
              <div className="text-center">
                <div className="text-xl font-black text-white">{totalQuestions}</div>
                <div className="text-[10px] text-stone-400 uppercase font-bold">Total</div>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="text-xl font-black text-[#10B981]">{attemptedCount}</div>
                <div className="text-[10px] text-stone-400 uppercase font-bold">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-stone-400">{unattemptedCount}</div>
                <div className="text-[10px] text-stone-400 uppercase font-bold">Left</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#FACC15] hover:bg-yellow-400 text-black font-bold text-xs rounded-xl shadow-lg font-syne btn-click-effect"
            >
              Back to Course Content
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
