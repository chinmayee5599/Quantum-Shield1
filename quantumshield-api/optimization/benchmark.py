import os
import json
import random
import networkx as nx
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from quantum.qubo_builder import build_qubo_model
from quantum.qaoa_solver import solve_qaoa
from optimization.classical_solver import solve_classical_brute_force

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

def run_benchmark():
    print("Loading Attack Graph...")
    graph_path = os.path.join(PROCESSED_DIR, "attack_graph.json")
    with open(graph_path, "r") as f:
        graph_data = json.load(f)
        
    G = nx.node_link_graph(graph_data)
    vuln_nodes = [n for n, d in G.nodes(data=True) if d.get('node_type') == 'Vulnerability']
    
    # Generate 5 controls for the benchmark (so QAOA runs quickly)
    random.seed(42)
    controls = []
    num_controls = 5
    for i in range(num_controls):
        disrupts = random.sample(vuln_nodes, min(len(vuln_nodes), random.randint(3, 5)))
        controls.append({
            "id": f"C{i+1}",
            "cost": round(random.uniform(10, 30), 2),
            "disrupts": disrupts
        })
        
    budget = 100.0
    alpha = 1.0
    beta = 5.0
    
    print(f"\nRunning benchmark with {num_controls} controls (Qubits: {num_controls})")
    print("-" * 50)
    
    # 1. CLASSICAL SOLVER
    print("Solving Classically (Brute Force)...")
    classical_res = solve_classical_brute_force(G, controls, budget, alpha, beta)
    
    # 2. QUANTUM SOLVER
    print("Solving Quantumly (QAOA Simulator)...")
    mdl, _ = build_qubo_model(G, controls, budget, alpha, beta)
    quantum_res = solve_qaoa(mdl)
    
    # Calculate Risk reduction for both
    def calc_metrics(selected_ids):
        cost = sum(c['cost'] for c in controls if c['id'] in selected_ids)
        disrupts = set()
        for c in controls:
            if c['id'] in selected_ids:
                disrupts.update(c['disrupts'])
        disrupted_risk = sum(G.nodes[v].get('derived_risk_weight', 5.0) for v in disrupts)
        return cost, disrupted_risk
        
    c_cost, c_red = calc_metrics(classical_res['selected_controls'])
    q_cost, q_red = calc_metrics(quantum_res['selected_controls'])
    
    print("\n" + "="*70)
    print("BENCHMARK COMPARISON: CLASSICAL vs QAOA")
    print("="*70)
    
    print(f"{'Metric':<25} | {'Classical (Exact)':<20} | {'Quantum (QAOA)':<20}")
    print("-" * 70)
    print(f"{'Selected Controls':<25} | {len(classical_res['selected_controls']):<20} | {len(quantum_res['selected_controls']):<20}")
    print(f"{'Objective Value':<25} | {classical_res['best_objective_value']:<20.2f} | {quantum_res['best_objective_value']:<20.2f}")
    
    opt_gap = abs(quantum_res['best_objective_value'] - classical_res['best_objective_value'])
    if classical_res['best_objective_value'] != 0:
        opt_gap_pct = (opt_gap / abs(classical_res['best_objective_value'])) * 100
    else:
        opt_gap_pct = 0.0
        
    print(f"{'Optimality Gap':<25} | {'0.0% (Baseline)':<20} | {opt_gap_pct:<20.2f}%")
    print(f"{'Execution Time (sec)':<25} | {classical_res['execution_time_sec']:<20.5f} | {quantum_res['execution_time_sec']:<20.5f}")
    print(f"{'Risk Reduced':<25} | {c_red:<20.2f} | {q_red:<20.2f}")
    print(f"{'Total Cost':<25} | ${c_cost:<19.2f} | ${q_cost:<19.2f}")
    
    c_feas = 'PASS' if c_cost <= budget else 'FAIL'
    q_feas = 'PASS' if q_cost <= budget else 'FAIL'
    print(f"{'Budget Feasibility':<25} | {c_feas:<20} | {q_feas:<20}")
    print("="*70)

if __name__ == "__main__":
    run_benchmark()
