import networkx as nx
from docplex.mp.model import Model

def build_qubo_model(graph: nx.DiGraph, controls: list, budget: float = 100.0, alpha: float = 1.0, beta: float = 10.0):
    """
    Builds a QUBO (Quadratic Unconstrained Binary Optimization) model for 
    the attack graph security optimization problem.
    
    Variables:
        x_i = 1 if security control i is selected
        x_i = 0 otherwise
        
    Objective:
        Minimize: alpha * (Total Cost - Budget)^2 - beta * (Total Risk Disrupted)
    """
    mdl = Model(name="QuantumShield_QUBO")
    
    # x_i = 1 if security control i is selected, 0 otherwise
    x = {c['id']: mdl.binary_var(name=f"x_{c['id']}") for c in controls}
    
    # Calculate Total Cost
    total_cost = mdl.sum(c['cost'] * x[c['id']] for c in controls)
    
    # Part 1: Penalty for budget violation (Quadratic term)
    budget_penalty = alpha * ((total_cost - budget) ** 2)
    
    # Part 2: Risk disruption (Linear term to maximize disruption -> minimize negative)
    risk_disruption = 0
    for v_id, v_data in graph.nodes(data=True):
        if v_data.get('node_type') == 'Vulnerability':
            risk = v_data.get('derived_risk_weight', 5.0)
            
            # Find controls that mitigate this vulnerability
            applicable_controls = [c['id'] for c in controls if v_id in c.get('disrupts', [])]
            
            # For simplicity in QUBO, we assume additive disruption up to 100%.
            # We minimize the negative disrupted risk.
            for c_id in applicable_controls:
                risk_disruption -= beta * risk * x[c_id]
                
    mdl.minimize(budget_penalty + risk_disruption)
    
    return mdl, x
