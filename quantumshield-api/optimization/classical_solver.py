import itertools
import time
import networkx as nx

def solve_classical_brute_force(graph: nx.DiGraph, controls: list, budget: float = 100.0, alpha: float = 1.0, beta: float = 5.0):
    """
    Solves the exact same QUBO objective using classical brute-force enumeration.
    Provides the exact global minimum to calculate the optimality gap.
    """
    start_time = time.time()
    
    n = len(controls)
    best_obj = float('inf')
    best_combination = None
    
    # Pre-compute risk for each vulnerability
    vuln_risks = {}
    for v_id, v_data in graph.nodes(data=True):
        if v_data.get('node_type') == 'Vulnerability':
            vuln_risks[v_id] = v_data.get('derived_risk_weight', 5.0)
            
    # Iterate over all 2^n possible binary assignments
    for combo in itertools.product([0, 1], repeat=n):
        
        # 1. Total Cost
        total_cost = sum(controls[i]['cost'] for i in range(n) if combo[i] == 1)
        
        # 2. Budget Penalty
        budget_penalty = alpha * ((total_cost - budget) ** 2)
        
        # 3. Disrupted Risk (Linear term matching QUBO)
        # In QUBO, the linear term sum was -beta * risk * x_c for each applicable control.
        # Wait, the QUBO code did a sum over controls, meaning overlaps are double-counted.
        # I MUST MATCH THE QUBO EXACTLY for a fair objective comparison.
        risk_disruption = 0
        for v_id, risk in vuln_risks.items():
            applicable_controls = [i for i, c in enumerate(controls) if v_id in c.get('disrupts', [])]
            for c_i in applicable_controls:
                if combo[c_i] == 1:
                    risk_disruption -= beta * risk
                    
        # Total Objective
        obj_value = budget_penalty + risk_disruption
        
        if obj_value < best_obj:
            best_obj = obj_value
            best_combination = combo
            
    end_time = time.time()
    
    selected_controls = [controls[i]['id'] for i in range(n) if best_combination[i] == 1]
    
    return {
        "best_objective_value": best_obj,
        "selected_controls": selected_controls,
        "execution_time_sec": end_time - start_time,
        "method": "Brute Force"
    }
