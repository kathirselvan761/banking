import React, { useState } from 'react';
import {
  MessageSquare,
  AlertCircle,
  Sparkles,
  Mic,
  FileText,
  CheckCircle2,
  Volume2,
  Headphones,
} from 'lucide-react';
import { formatDate } from '../utils/riskUtils';

export const SentimentCard = ({ complaints = [], voiceTranscripts = [] }) => {
  const [activeTab, setActiveTab] = useState('COMPLAINTS'); // 'COMPLAINTS' | 'VOICE'

  const hasComplaints = complaints && complaints.length > 0;
  const hasVoice = voiceTranscripts && voiceTranscripts.length > 0;

  const getSentimentBadge = (sentiment) => {
    const s = String(sentiment || '').toLowerCase();
    if (s.includes('neg') || s.includes('angry') || s.includes('distress')) {
      return {
        label: 'NEGATIVE',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        bar: 'bg-rose-500',
      };
    }
    if (s.includes('pos')) {
      return {
        label: 'POSITIVE',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        bar: 'bg-emerald-500',
      };
    }
    return {
      label: 'NEUTRAL',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      bar: 'bg-amber-500',
    };
  };

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              NLP Sentiment & Grievance Intelligence
            </h3>
            <p className="text-xs text-slate-400">FinBERT sentiment, SBERT similarity & Whisper call audio</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('COMPLAINTS')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'COMPLAINTS'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Grievances ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('VOICE')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'VOICE'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Calls ({voiceTranscripts.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Written Complaints */}
      {activeTab === 'COMPLAINTS' && (
        <div className="mt-5 space-y-4">
          {!hasComplaints ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
              No customer complaints or support grievances logged for this customer.
            </div>
          ) : (
            complaints.map((c, idx) => {
              const sent = getSentimentBadge(c.sentiment || c.sentiment_label);
              const isRecurring = c.is_recurring || c.semantic_similarity > 0.65;
              const simScore = c.semantic_similarity ? Math.round(c.semantic_similarity * 100) : null;

              return (
                <div
                  key={c._id || idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sent.badge}`}>
                        {sent.label}
                      </span>
                      {c.category && (
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {c.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDate(c.created_at || c.date || c.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                    "{c.text || c.complaint_text || c.content}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                    {isRecurring ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Recurring Issue Detected {simScore ? `(${simScore}% SBERT Match)` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        First Occurrence / Isolated
                      </span>
                    )}

                    {c.severity && (
                      <span className="text-slate-400 font-mono">
                        Severity: <span className="text-slate-300 font-semibold">{c.severity}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Voice Audio Recordings via Whisper STT */}
      {activeTab === 'VOICE' && (
        <div className="mt-5 space-y-4">
          {!hasVoice ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
              No inbound customer support calls transcribed yet. Use "Simulate Voice Call" to ingest audio.
            </div>
          ) : (
            voiceTranscripts.map((v, idx) => {
              const sent = getSentimentBadge(v.sentiment);

              return (
                <div
                  key={v._id || idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-cyan-950/60 hover:border-cyan-800/60 transition-all space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        <Headphones className="w-3 h-3 text-cyan-400" />
                        WHISPER STT
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sent.badge}`}>
                        {sent.label}
                      </span>
                      {v.category && (
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {v.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDate(v.created_at || v.timestamp)}
                    </span>
                  </div>

                  {/* Audio Transcript */}
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono">
                      <span>Audio Recording Transcript:</span>
                      <span>Lang: {v.language || 'en'}</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed italic">
                      "{v.transcript}"
                    </p>
                  </div>

                  {/* Telephony Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 font-mono">
                    {v.keywords && v.keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-slate-500">Keywords:</span>
                        {v.keywords.slice(0, 4).map((kw, kwi) => (
                          <span key={kwi} className="px-1.5 py-0.2 bg-slate-800 rounded text-slate-300 text-[10px]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {v.severity && (
                      <span>
                        Severity: <strong className="text-slate-200">{v.severity}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SentimentCard;
