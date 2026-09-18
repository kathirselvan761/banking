import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  MessageSquareWarning,
  Zap,
  Mic,
  Send,
  Loader2,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import {
  simulateEmiFailure,
  simulateComplaint,
  simulateTransaction,
  uploadVoice,
} from '../services/api';

export const SimulationModal = ({ isOpen, onClose, customerId, simulationType, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Complaint form state
  const [complaintText, setComplaintText] = useState(
    'I am frustrated because my EMI payment failed again.'
  );

  // Transaction form state
  const [txAmount, setTxAmount] = useState('185000');
  const [txMerchant, setTxMerchant] = useState('INTERNATIONAL_CRYPTO_DESK');
  const [txCategory, setTxCategory] = useState('UNUSUAL_OUTFLOW');

  // Voice call form state
  const [audioFile, setAudioFile] = useState(null);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      if (simulationType === 'EMI') {
        res = await simulateEmiFailure(customerId);
      } else if (simulationType === 'COMPLAINT') {
        res = await simulateComplaint(customerId, complaintText);
      } else if (simulationType === 'TRANSACTION') {
        res = await simulateTransaction(customerId, {
          amount: parseFloat(txAmount) || 100000,
          merchant: txMerchant,
          category: txCategory,
          type: 'DEBIT',
        });
      } else if (simulationType === 'VOICE') {
        if (!audioFile) {
          throw new Error('Please select an audio file (e.g. test_customer_call.wav) to analyze');
        }
        res = await uploadVoice(customerId, audioFile);
      }

      setResult(res);
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.message || err.message || 'Simulation execution failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (simulationType) {
      case 'EMI':
        return {
          title: 'Simulate EMI Repayment Failure',
          subtitle: 'Simulate a missed monthly installment event & trigger immediate risk reassessment',
          icon: AlertTriangle,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        };
      case 'COMPLAINT':
        return {
          title: 'Simulate Customer Distress Complaint',
          subtitle: 'Analyze complaint through FinBERT sentiment and SBERT semantic similarity',
          icon: MessageSquareWarning,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
      case 'TRANSACTION':
        return {
          title: 'Simulate High-Risk Transaction Anomaly',
          subtitle: 'Execute transaction through Isolation Forest behavioral outlier model',
          icon: Zap,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        };
      case 'VOICE':
        return {
          title: 'Simulate Voice Call Transcription',
          subtitle: 'Transcribe audio via OpenAI Whisper & extract sentiment telemetry',
          icon: Mic,
          color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        };
      default:
        return {
          title: 'Simulate Banking Event',
          subtitle: 'Trigger multi-agent risk evaluation',
          icon: Zap,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        };
    }
  };

  const meta = getModalTitle();
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${meta.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{meta.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{meta.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between font-mono">
            <span>Target Customer:</span>
            <strong className="text-sky-400 font-bold">{customerId}</strong>
          </div>

          {/* EMI specific message */}
          {simulationType === 'EMI' && (
            <div className="p-4 bg-rose-950/20 border border-rose-800/30 rounded-xl text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-rose-300">Impact Assessment:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Increases days past due (DPD) counter</li>
                <li>Applies penalty risk weight to credit trajectory</li>
                <li>Triggers immediate recalculation of XGBoost composite risk score</li>
              </ul>
            </div>
          )}

          {/* Complaint specific form */}
          {simulationType === 'COMPLAINT' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Customer Complaint Message
              </label>
              <textarea
                rows={4}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Enter customer complaint or dispute text..."
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setComplaintText(
                      'Salary delayed this month and EMI payment failed. Please waive the penalty.'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Salary Delayed
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setComplaintText(
                      'Severe medical emergency in my family, unable to pay current installment on time.'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Medical Emergency
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setComplaintText(
                      'Unauthorized deduction appeared on my debit card, please reverse immediately!'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Card Dispute
                </button>
              </div>
            </div>
          )}

          {/* Transaction specific form */}
          {simulationType === 'TRANSACTION' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction Amount (₹)
                </label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Merchant / Payee
                  </label>
                  <input
                    type="text"
                    value={txMerchant}
                    onChange={(e) => setTxMerchant(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Risk Category
                  </label>
                  <input
                    type="text"
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Voice call upload form */}
          {simulationType === 'VOICE' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Audio Recording File (.wav, .mp3)
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 text-center bg-slate-950/40 transition-colors">
                <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <input
                  type="file"
                  id="audio-input"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="audio-input"
                  className="cursor-pointer text-xs font-medium text-cyan-400 hover:text-cyan-300 underline"
                >
                  {audioFile ? audioFile.name : 'Select audio file from computer'}
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports .wav and .mp3 voice recordings
                </p>
              </div>
            </div>
          )}

          {/* Result or Error Banner */}
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {result && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Simulation completed successfully! Risk telemetry refreshed in real time.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-950/50 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing AI Models...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Execute Simulation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationModal;
