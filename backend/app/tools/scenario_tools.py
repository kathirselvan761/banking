from typing import Dict, Any
from app.ml.risk_prediction_service import risk_prediction_service
from app.ml.risk_engine import risk_engine, get_risk_level_label

def run_what_if(
    current_state: Dict[str, Any],
    simulation_params: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Simulates alternative financial scenario by modifying parameters and re-evaluating risk models.
    Returns Current Risk, Scenario Risk, Difference, and Future Probability.
    Clearly labeled as a model-based scenario estimate.
    """
    # Baseline
    base_delays = int(current_state.get("emi_delay_count", 0))
    base_overdue = float(current_state.get("overdue_amount", 0.0))
    base_emi = float(current_state.get("monthly_emi", 10000.0))
    base_util = float(current_state.get("credit_utilization", 0.35))
    base_complaints = int(current_state.get("complaint_count", 0))
    base_income = float(current_state.get("monthly_income", 50000.0))
    base_credit = float(current_state.get("credit_score", 650.0))

    base_risk = risk_engine.calculate_current_risk(
        emi_delays=base_delays,
        overdue_amount=base_overdue,
        monthly_emi=base_emi,
        credit_utilization=base_util,
        complaint_count=base_complaints,
        credit_score=base_credit
    )
    base_future = risk_prediction_service.predict_future_risk(current_state)

    # Simulated parameters (overwriting if provided in simulation_params)
    sim_delays = int(simulation_params.get("emi_delay_count", base_delays))
    sim_overdue = float(simulation_params.get("overdue_amount", base_overdue))
    sim_util = float(simulation_params.get("credit_utilization", base_util))
    sim_complaints = int(simulation_params.get("complaint_count", base_complaints))
    sim_emi = float(simulation_params.get("monthly_emi", base_emi))
    sim_credit = float(simulation_params.get("credit_score", base_credit))

    sim_risk = risk_engine.calculate_current_risk(
        emi_delays=sim_delays,
        overdue_amount=sim_overdue,
        monthly_emi=sim_emi,
        credit_utilization=sim_util,
        complaint_count=sim_complaints,
        credit_score=sim_credit
    )

    sim_state = {
        **current_state,
        "emi_delay_count": sim_delays,
        "overdue_amount": sim_overdue,
        "credit_utilization": sim_util,
        "complaint_count": sim_complaints,
        "monthly_emi": sim_emi,
        "credit_score": sim_credit
    }
    sim_future = risk_prediction_service.predict_future_risk(sim_state)

    delta_score = sim_risk["score"] - base_risk["score"]
    delta_prob = round(sim_future["future_risk_probability"] - base_future["future_risk_probability"], 4)

    return {
        "status": "SUCCESS",
        "tool": "run_what_if",
        "nature": "MODEL_BASED_SCENARIO_ESTIMATE",
        "current_risk": {
            "score": base_risk["score"],
            "level": base_risk["level"],
            "future_probability": base_future["future_risk_probability"]
        },
        "scenario_risk": {
            "score": sim_risk["score"],
            "level": sim_risk["level"],
            "future_probability": sim_future["future_risk_probability"]
        },
        "difference": {
            "score_change": delta_score,
            "direction": "INCREASED_RISK" if delta_score > 0 else ("REDUCED_RISK" if delta_score < 0 else "NO_CHANGE"),
            "probability_change": delta_prob
        },
        "parameters_applied": {
            "overdue_amount": sim_overdue,
            "emi_delay_count": sim_delays,
            "credit_utilization": sim_util,
            "complaint_count": sim_complaints
        },
        "disclaimer": "This is an automated simulation estimate to assist human decision-making and does not execute account actions."
    }
