import logging
from typing import List, Dict, Any, Optional
import numpy as np

logger = logging.getLogger("banking_ai.sbert")

_sbert_model = None

def get_sbert():
    global _sbert_model
    if _sbert_model is not None:
        return _sbert_model
    try:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading SentenceTransformer ('all-MiniLM-L6-v2')...")
        _sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("SentenceTransformer loaded.")
        return _sbert_model
    except Exception as e:
        logger.warning(f"Could not load SentenceTransformer: {e}")
        return None

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    dot = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot / (norm1 * norm2))

def calibrate_similarity(raw_sim: float) -> float:
    if raw_sim < 0.20:
        return round(max(0.0, raw_sim), 2)
    calibrated = min(0.99, raw_sim * 1.35 + 0.15)
    return round(calibrated, 2)

class SBERTService:
    def __init__(self, similarity_threshold: float = 0.65):
        self.similarity_threshold = similarity_threshold

    def get_embedding(self, text: str) -> List[float]:
        """Calculates 384-dimensional dense semantic embedding."""
        model = get_sbert()
        if model:
            vec = model.encode(text, convert_to_numpy=True)
            return vec.tolist()
        # Word overlap fallback embedding
        words = set(text.lower().split())
        return [1.0 if hash(w) % 384 == i else 0.0 for i in range(384)]

    def detect_recurring_issue(
        self,
        current_complaint: str,
        historical_complaints: List[str]
    ) -> Dict[str, Any]:
        """
        Detects if current grievance is semantically related to prior complaints.
        """
        if not historical_complaints:
            return {
                "detected": False,
                "similarity_score": 0.0,
                "most_similar_complaint": None,
                "match_count": 0
            }

        model = get_sbert()
        if model:
            try:
                curr_emb = model.encode(current_complaint, convert_to_numpy=True)
                hist_embs = model.encode(historical_complaints, convert_to_numpy=True)

                similarities = [cosine_similarity(curr_emb, h) for h in hist_embs]
                max_idx = int(np.argmax(similarities))
                raw_max = similarities[max_idx]
                calibrated_score = calibrate_similarity(raw_max)

                is_recurring = calibrated_score >= self.similarity_threshold
                return {
                    "detected": is_recurring,
                    "similarity_score": calibrated_score,
                    "raw_cosine_similarity": round(float(raw_max), 3),
                    "most_similar_complaint": historical_complaints[max_idx],
                    "matched_index": max_idx,
                    "match_count": sum(1 for s in similarities if calibrate_similarity(s) >= self.similarity_threshold)
                }
            except Exception as e:
                logger.error(f"SBERT inference error: {e}")

        # Keyword jaccard fallback
        curr_words = set(current_complaint.lower().split())
        scores = []
        for h in historical_complaints:
            h_words = set(h.lower().split())
            intersection = curr_words.intersection(h_words)
            union = curr_words.union(h_words)
            jaccard = len(intersection) / max(1, len(union))
            scores.append(jaccard)
        
        max_idx = int(np.argmax(scores)) if scores else 0
        score = round(scores[max_idx] * 1.5, 2) if scores else 0.0
        return {
            "detected": score >= 0.5,
            "similarity_score": min(0.95, score),
            "most_similar_complaint": historical_complaints[max_idx] if historical_complaints else None,
            "match_count": sum(1 for s in scores if s >= 0.3)
        }

    def cluster_complaints(self, complaints: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Clusters complaints into semantic recurring issue groups.
        """
        if not complaints:
            return []

        clusters = []
        assigned = set()

        for i, c1 in enumerate(complaints):
            if i in assigned:
                continue
            text1 = c1.get("description", c1.get("text", ""))
            cluster_members = [c1]
            assigned.add(i)

            for j, c2 in enumerate(complaints):
                if j in assigned:
                    continue
                text2 = c2.get("description", c2.get("text", ""))
                res = self.detect_recurring_issue(text1, [text2])
                if res["detected"]:
                    cluster_members.append(c2)
                    assigned.add(j)

            # Determine dominant category/title
            primary_title = cluster_members[0].get("category", "General Issue")
            clusters.append({
                "cluster_id": f"CLS-{len(clusters) + 1}",
                "issue_summary": text1[:80] + "..." if len(text1) > 80 else text1,
                "category": primary_title,
                "frequency": len(cluster_members),
                "affected_customers": list({m.get("customer_id", "Unknown") for m in cluster_members}),
                "sample_complaints": [m.get("description", m.get("text", "")) for m in cluster_members[:3]]
            })

        # Sort clusters by frequency descending
        clusters.sort(key=lambda x: x["frequency"], reverse=True)
        return clusters

sbert_service = SBERTService()
