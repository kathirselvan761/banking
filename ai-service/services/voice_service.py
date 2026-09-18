"""
Voice Service (Whisper Speech-to-Text + NLP Pipeline)
Transcribes customer audio calls via OpenAI Whisper and cascades through complaint analysis.
Includes native wave decoding fallback when system ffmpeg is unavailable on Windows/local environments.
"""

import os
import wave
import numpy as np
from typing import Dict, Any
from services.complaint_service import complaint_service

whisper_model = None

def patch_whisper_audio_loader():
    """Patches whisper.audio.load_audio to support native WAV reading without requiring ffmpeg.exe."""
    try:
        import whisper.audio
        original_load = whisper.audio.load_audio

        def safe_load_audio(file: str, sr: int = 16000):
            try:
                return original_load(file, sr)
            except Exception:
                # Pure Python wave/numpy fallback for WAV files
                with wave.open(file, 'rb') as wf:
                    ch = wf.getnchannels()
                    sw = wf.getsampwidth()
                    fr = wf.getframerate()
                    n = wf.getnframes()
                    data = wf.readframes(n)

                    if sw == 2:
                        audio = np.frombuffer(data, dtype=np.int16)
                    elif sw == 1:
                        audio = (np.frombuffer(data, dtype=np.uint8).astype(np.int16) - 128) * 256
                    else:
                        audio = np.frombuffer(data, dtype=np.int16)

                    if ch > 1:
                        audio = audio.reshape(-1, ch).mean(axis=1)

                    if fr != sr and fr > 0:
                        from scipy import signal
                        num_samples = int(len(audio) * float(sr) / fr)
                        audio = signal.resample(audio, num_samples)

                    return audio.astype(np.float32) / 32768.0

        whisper.audio.load_audio = safe_load_audio
    except Exception as e:
        print(f"[WARN] Could not patch whisper audio loader: {e}")

# Apply patch at module import
patch_whisper_audio_loader()

def get_whisper_model():
    """Lazy-loads Whisper model ('tiny' for fast local CPU inference)."""
    global whisper_model
    if whisper_model is not None:
        return whisper_model

    try:
        import whisper
        print("[INFO] Loading Whisper 'tiny' model...")
        whisper_model = whisper.load_model("tiny")
        print("[INFO] Whisper model loaded successfully.")
        return whisper_model
    except Exception as e:
        print(f"[ERROR] Failed to load Whisper model: {e}")
        whisper_model = None
        raise RuntimeError(f"Whisper Speech-to-Text engine unavailable: {str(e)}")

class VoiceService:
    def process_audio(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcribes audio file with Whisper and cascades through complaint analysis.
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found at {audio_path}")

        model = get_whisper_model()
        try:
            result = model.transcribe(audio_path, fp16=False)
            transcript = (result.get("text") or "").strip()
            language = result.get("language", "en")
        except Exception as e:
            raise RuntimeError(f"Whisper audio transcription failed: {str(e)}")

        if not transcript:
            raise ValueError("Whisper produced an empty transcript from the audio file.")

        # Automatically run transcript through complaint & sentiment analysis pipeline
        nlp_analysis = complaint_service.analyze_complaint(transcript)

        return {
            "transcript": transcript,
            "language": language,
            "sentiment": nlp_analysis["sentiment"],
            "category": nlp_analysis["category"],
            "severity": nlp_analysis["severity"],
            "keywords": nlp_analysis["keywords"]
        }

voice_service = VoiceService()
