import logging
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END

from app.tools.data_tools import (
    get_customer_history,
    get_transactions,
    get_complaints,
    get_loan_history,
    get_system_events
)
from app.tools.ml_tools import (
    predict_future_risk,
    get_shap_explanation,
    run_sentiment_analysis,
    find_similar_complaints
)
from app.tools.scenario_tools import run_what_if
from app.tools.alert_tools import create_alert

logger = logging.getLogger("banking_ai.agent_graph")

class AgentState(TypedDict):
    customer_id: str
    risk_profile: Dict[str, Any]
    investigation_needed: bool
    evidence: List[Dict[str, Any]]
    investigation_trail: List[Dict[str, Any]]
    missing_evidence_types: List[str]
    iteration_count: int
    max_iterations: int
    possible_contributing_factors: List[str]
    predictions: Dict[str, Any]
    explanations: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    what_if_analysis: Dict[str, Any]
    decision_intelligence: Dict[str, Any]

# ------------------------------------------------------------------------------
# 1. Monitoring Agent Node
# ------------------------------------------------------------------------------
def monitoring_agent(state: AgentState) -> AgentState:
    profile = state["risk_profile"]
    score = profile.get("risk_score", 0)
    level = profile.get("risk_level", "Low")
    delays = profile.get("emi_delay_count", 0)
    overdue = profile.get("overdue_amount", 0)
    is_anomaly = profile.get("transaction_anomaly", {}).get("is_anomaly", False)
    recurring = profile.get("recurring_issue", {}).get("detected", False)

    # Need investigation if risk is above low or active risk signals present
    investigate = score >= 25 or delays > 0 or overdue > 0 or is_anomaly or recurring
    missing = ["history", "loans", "transactions", "complaints"]
    if is_anomaly or recurring:
        missing.append("system_events")

    trail_entry = {
        "step": 1,
        "agent": "Monitoring Agent",
        "action": "OBSERVE_RISK_SIGNALS",
        "summary": f"Detected risk score {score} ({level}). Delays: {delays}, Overdue: ₹{overdue:,.0f}, Recurring: {recurring}, Anomaly: {is_anomaly}.",
        "decision": "TRIGGER_INVESTIGATION" if investigate else "LOW_RISK_NO_INVESTIGATION"
    }

    state["investigation_needed"] = investigate
    state["missing_evidence_types"] = missing if investigate else []
    state["investigation_trail"].append(trail_entry)
    return state

# ------------------------------------------------------------------------------
# 2. Investigation Agent Node (Executed inside the loop)
# ------------------------------------------------------------------------------
def investigation_agent(state: AgentState) -> AgentState:
    cid = state["customer_id"]
    state["iteration_count"] += 1
    iter_num = state["iteration_count"]

    if not state["missing_evidence_types"]:
        return state

    # Pull next evidence type to investigate
    next_type = state["missing_evidence_types"].pop(0)

    if next_type == "history":
        res = get_customer_history(cid)
        tool_name = "get_customer_history"
        summary = f"Retrieved profile: Credit Score {res.get('history', {}).get('credit_score')}, Income ₹{res.get('history', {}).get('monthly_income', 0):,.0f}"
    elif next_type == "loans":
        res = get_loan_history(cid)
        tool_name = "get_loan_history"
        summary = f"Retrieved {res.get('count', 0)} loan records. Active arrears evaluated."
    elif next_type == "transactions":
        res = get_transactions(cid, limit=5)
        tool_name = "get_transactions"
        summary = f"Retrieved {res.get('count', 0)} recent transactions. Analyzed expenditure pattern."
    elif next_type == "complaints":
        res = get_complaints(cid)
        tool_name = "get_complaints"
        summary = f"Retrieved {res.get('count', 0)} complaints. Analyzed service dissatisfaction."
    elif next_type == "system_events":
        res = get_system_events(cid)
        tool_name = "get_system_events"
        summary = f"Retrieved {res.get('count', 0)} system logs. Checked payment gateway timeouts."
    else:
        res = {}
        tool_name = "unknown_tool"
        summary = "No evidence collected"

    state["evidence"].append({
        "evidence_type": next_type,
        "tool_used": tool_name,
        "data": res
    })

    trail_entry = {
        "step": 1 + iter_num,
        "agent": "Investigation Agent",
        "action": f"CALL_TOOL_{tool_name.upper()}",
        "summary": summary,
        "remaining_evidence_needs": list(state["missing_evidence_types"])
    }
    state["investigation_trail"].append(trail_entry)
    return state

# ------------------------------------------------------------------------------
# Conditional Edge: Evidence Sufficiency Loop Check
# ------------------------------------------------------------------------------
def evaluate_evidence_sufficiency(state: AgentState) -> str:
    """
    Decides whether to loop back to Investigation Agent or move forward.
    Need more evidence? -> YES -> loop
    Enough evidence? -> NO -> proceed to RCA
    """
    if not state.get("investigation_needed", True):
        return "skip_to_decision"

    has_more = len(state.get("missing_evidence_types", [])) > 0
    not_exceeded = state.get("iteration_count", 0) < state.get("max_iterations", 6)

    if has_more and not_exceeded:
        return "continue_investigation"
    return "proceed_to_rca"

# ------------------------------------------------------------------------------
# 3. RCA Agent Node
# ------------------------------------------------------------------------------
def rca_agent(state: AgentState) -> AgentState:
    profile = state["risk_profile"]
    factors = []

    # Cautiously qualify statements as "possible contributing factors"
    if profile.get("emi_delay_count", 0) > 0:
        factors.append(f"Possible contributing factor: Recorded {profile['emi_delay_count']} recent EMI delay(s) preceding delinquency threshold.")
    if profile.get("overdue_amount", 0) > 0:
        factors.append(f"Possible contributing factor: Unpaid overdue arrears balance of ₹{profile['overdue_amount']:,.0f}.")
    if profile.get("sentiment", {}).get("label") == "negative":
        factors.append("Possible contributing factor: High customer frustration and negative sentiment detected in support interactions.")
    if profile.get("recurring_issue", {}).get("detected"):
        factors.append(f"Possible contributing factor: Recurring service failure pattern detected (semantic similarity: {profile['recurring_issue']['similarity_score']}).")
    if profile.get("transaction_anomaly", {}).get("is_anomaly"):
        factors.append("Possible contributing factor: Statistical transaction anomaly flagged by Isolation Forest.")
    if profile.get("credit_utilization", 0) > 0.70:
        factors.append(f"Possible contributing factor: Elevated credit limit utilization at {round(profile['credit_utilization'] * 100)}%.")

    if not factors:
        factors.append("No adverse contributing risk factors identified; customer exhibits clean historical performance.")

    state["possible_contributing_factors"] = factors
    state["investigation_trail"].append({
        "step": len(state["investigation_trail"]) + 1,
        "agent": "RCA Agent",
        "action": "ROOT_CAUSE_SYNTHESIS",
        "summary": f"Synthesized {len(factors)} possible contributing factor(s) (non-causal correlation).",
        "factors": factors
    })
    return state

# ------------------------------------------------------------------------------
# 4. Prediction & Explainability Agent Node
# ------------------------------------------------------------------------------
def prediction_and_explainability_agent(state: AgentState) -> AgentState:
    profile = state["risk_profile"]
    
    # Tool call: predict_future_risk
    pred_res = predict_future_risk(profile)
    # Tool call: get_shap_explanation
    shap_res = get_shap_explanation(profile)

    state["predictions"] = pred_res.get("result", {})
    state["explanations"] = shap_res.get("result", {}).get("top_factors", [])

    state["investigation_trail"].append({
        "step": len(state["investigation_trail"]) + 1,
        "agent": "Prediction & Explainability Agent",
        "action": "EXECUTE_XGBOOST_AND_SHAP",
        "summary": f"XGBoost predicted 90-day default probability: {state['predictions'].get('future_risk_probability', 0.15)}. SHAP computed top {len(state['explanations'])} feature attributions."
    })
    return state

# ------------------------------------------------------------------------------
# 5. Recommendation Agent Node
# ------------------------------------------------------------------------------
def recommendation_agent(state: AgentState) -> AgentState:
    profile = state["risk_profile"]
    score = profile.get("risk_score", 0)
    level = profile.get("risk_level", "Low")
    delays = profile.get("emi_delay_count", 0)
    overdue = profile.get("overdue_amount", 0)
    segment = profile.get("customer_segment", "Standard")
    recurring = profile.get("recurring_issue", {}).get("detected", False)

    recs = []

    # Business rule based advisory recommendations for human officer review
    if level in ["Critical", "High"]:
        recs.append({
            "action": "PROACTIVE_CUSTOMER_OUTREACH",
            "priority": "HIGH",
            "title": "Initiate Proactive Relationship Contact",
            "description": "Contact borrower via dedicated credit counselor to review financial hardship and offer restructured installment options.",
            "requires_human_approval": True
        })
    
    if overdue > 0 or delays >= 2:
        recs.append({
            "action": "OFFER_TENURE_RESTRUCTURING",
            "priority": "HIGH",
            "title": "Evaluate Loan Tenure Extension",
            "description": f"Evaluate extending remaining tenure by 12 months to reduce monthly EMI burden by ~25% and clear overdue balance.",
            "requires_human_approval": True
        })

    if recurring:
        recs.append({
            "action": "PRIORITIZE_UNRESOLVED_COMPLAINTS",
            "priority": "MEDIUM",
            "title": "Fast-track Repeated Dispute Resolution",
            "description": "Assign priority grievance ticket to payment operations to resolve persistent transaction dispute before next billing cycle.",
            "requires_human_approval": True
        })

    if profile.get("transaction_anomaly", {}).get("is_anomaly"):
        recs.append({
            "action": "VERIFY_RECENT_OUTLIER_TRANSACTION",
            "priority": "MEDIUM",
            "title": "Verify Recent Large Outlier Transaction",
            "description": "Send non-blocking SMS confirmation to borrower to ensure unusual debit transaction was authorized.",
            "requires_human_approval": True
        })

    if not recs:
        recs.append({
            "action": "STANDARD_ACCOUNT_MONITORING",
            "priority": "LOW",
            "title": "Maintain Standard Telemetry",
            "description": "Account operating within standard credit bounds. No manual intervention required.",
            "requires_human_approval": False
        })

    state["recommendations"] = recs
    state["investigation_trail"].append({
        "step": len(state["investigation_trail"]) + 1,
        "agent": "Recommendation Agent",
        "action": "GENERATE_ADVISORY_ACTIONS",
        "summary": f"Formulated {len(recs)} preventive suggestions for human banking officer review."
    })
    return state

# ------------------------------------------------------------------------------
# 6. What-If Agent Node
# ------------------------------------------------------------------------------
def what_if_agent(state: AgentState) -> AgentState:
    profile = state["risk_profile"]
    overdue = float(profile.get("overdue_amount", 0))
    
    # Scenario: If overdue amount is cleared / restructured
    sim_params = {
        "overdue_amount": 0.0,
        "emi_delay_count": max(0, int(profile.get("emi_delay_count", 0)) - 1)
    }
    what_if_res = run_what_if(profile, sim_params)
    state["what_if_analysis"] = what_if_res

    state["investigation_trail"].append({
        "step": len(state["investigation_trail"]) + 1,
        "agent": "What-If Agent",
        "action": "SIMULATE_RESTRUCTURING_SCENARIO",
        "summary": f"Tested scenario (Overdue ₹0): Score would improve from {what_if_res['current_risk']['score']} to {what_if_res['scenario_risk']['score']} ({what_if_res['difference']['score_change']} pts)."
    })
    return state

# ------------------------------------------------------------------------------
# 7. Decision & Alert Agent Node
# ------------------------------------------------------------------------------
def decision_agent(state: AgentState) -> AgentState:
    cid = state["customer_id"]
    profile = state["risk_profile"]
    level = profile.get("risk_level", "Low")
    score = profile.get("risk_score", 0)
    future_prob = state["predictions"].get("future_risk_probability", profile.get("future_risk_probability", 0.15))

    # Compile the final Decision Intelligence object
    decision_obj = {
        "customer_id": cid,
        "risk": {
            "score": score,
            "level": level
        },
        "future_risk": {
            "probability": future_prob
        },
        "evidence": state["evidence"],
        "possible_contributing_factors": state["possible_contributing_factors"],
        "sentiment": profile.get("sentiment", {}),
        "recurring_issues": [profile.get("recurring_issue", {})],
        "anomalies": [profile.get("transaction_anomaly", {})],
        "customer_segment": profile.get("customer_segment", "Standard"),
        "explanation": state["explanations"],
        "recommendations": state["recommendations"],
        "what_if": state["what_if_analysis"],
        "investigation_trail": state["investigation_trail"]
    }

    # Persist alert in database if high or critical risk
    if level in ["Critical", "High"]:
        alert_res = create_alert(
            customer_id=cid,
            severity=level,
            title=f"Early Warning: {level} Credit Risk Alert for {cid}",
            reason="; ".join(state["possible_contributing_factors"][:2]),
            evidence=state["evidence"][:3],
            recommended_action=state["recommendations"][0]["title"] if state["recommendations"] else "Review customer profile"
        )
        decision_obj["alert"] = alert_res.get("alert", {})
    else:
        decision_obj["alert"] = {
            "status": "NORMAL",
            "message": "No critical alerts triggered"
        }

    state["decision_intelligence"] = decision_obj
    return state

# ------------------------------------------------------------------------------
# Build the LangGraph StateGraph
# ------------------------------------------------------------------------------
def build_agent_graph():
    builder = StateGraph(AgentState)

    # Add Nodes
    builder.add_node("monitoring", monitoring_agent)
    builder.add_node("investigation", investigation_agent)
    builder.add_node("rca", rca_agent)
    builder.add_node("prediction_and_explainability", prediction_and_explainability_agent)
    builder.add_node("recommendation", recommendation_agent)
    builder.add_node("what_if", what_if_agent)
    builder.add_node("decision", decision_agent)

    # Set Entry Point
    builder.set_entry_point("monitoring")

    # Monitoring -> Conditional Edge (Decide if investigation is needed)
    builder.add_conditional_edges(
        "monitoring",
        evaluate_evidence_sufficiency,
        {
            "continue_investigation": "investigation",
            "proceed_to_rca": "rca",
            "skip_to_decision": "decision"
        }
    )

    # Investigation -> Loop Check Conditional Edge!
    builder.add_conditional_edges(
        "investigation",
        evaluate_evidence_sufficiency,
        {
            "continue_investigation": "investigation",
            "proceed_to_rca": "rca",
            "skip_to_decision": "decision"
        }
    )

    # Sequential edges for downstream reasoning
    builder.add_edge("rca", "prediction_and_explainability")
    builder.add_edge("prediction_and_explainability", "recommendation")
    builder.add_edge("recommendation", "what_if")
    builder.add_edge("what_if", "decision")
    builder.add_edge("decision", END)

    return builder.compile()

# Compile the graph
agent_graph = build_agent_graph()

def run_agentic_investigation(customer_id: str, risk_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes the full LangGraph Agentic loop with tools for the customer.
    """
    initial_state: AgentState = {
        "customer_id": customer_id,
        "risk_profile": risk_profile,
        "investigation_needed": True,
        "evidence": [],
        "investigation_trail": [],
        "missing_evidence_types": [],
        "iteration_count": 0,
        "max_iterations": 6,
        "possible_contributing_factors": [],
        "predictions": {},
        "explanations": [],
        "recommendations": [],
        "what_if_analysis": {},
        "decision_intelligence": {}
    }

    result = agent_graph.invoke(initial_state)
    return result.get("decision_intelligence", {})
