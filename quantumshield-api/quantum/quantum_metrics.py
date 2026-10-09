import os
import json
import networkx as nx
import random
from qubo_builder import build_qubo_model
from qaoa_solver import solve_qaoa

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

def run_experiment():
    print("Loading Attack Graph...")
    graph_path = os.path.join(PROCESSED_DIR, "attack_graph.json")
    if not os.path.exists(graph_path):
        print(f"Attack graph not found at {graph_path}. Please run data pipeline first.")
        return
        
    with open(graph_path, "r") as f:
        graph_data = json.load(f)
    
    G = nx.node_link_graph(graph_data)
    
    # 1. Generate candidate security controls targeting the real vulnerabilities
    vuln_nodes = [n for n, d in G.nodes(data=True) if d.get('node_type') == 'Vulnerability']
    
    random.seed(42) # Reproducibility
    controls = []
    for i in range(5):
        # Each control disrupts 3-5 random vulnerabilities
        disrupts = random.sample(vuln_nodes, min(len(vuln_nodes), random.randint(3, 5)))
        controls.append({
            "id": f"C{i+1}",
            "cost": random.uniform(10, 30),
            "disrupts": disrupts
        })
        
    print(f"Generated {len(controls)} candidate security controls.")
    print("Formulating QUBO...")
    
    # 2. Build QUBO Model
    budget = 100.0
    mdl, x_vars = build_qubo_model(G, controls, budget=budget, alpha=1.0, beta=5.0)
    
    # 3. Solve using QAOA
    print("Executing QAOA on local simulator...")
    results = solve_qaoa(mdl)
    
    # 4. Metrics & Evaluation
    print("\n" + "="*40)
    print("--- QUANTUM EXPERIMENT RESULTS ---")
    print("="*40)
    print(f"QUBO Variables (x_i): {results['num_variables']}")
    print(f"Number of Qubits  : {results['num_qubits']}")
    print(f"QAOA Depth        : {results['qaoa_depth']}")
    print(f"Optimizer Status  : {results['status']}")
    print(f"Best Obj Value    : {results['best_objective_value']:.2f}")
    print(f"Execution Time    : {results['execution_time_sec']:.3f} sec")
    print("-" * 40)
    
    selected_c_ids = results['selected_controls']
    print(f"Selected Controls : {selected_c_ids}")
    
    # Calculate Cost and Risk Reduction
    total_cost = sum(c['cost'] for c in controls if c['id'] in selected_c_ids)
    
    original_risk = sum(d.get('derived_risk_weight', 5.0) for n, d in G.nodes(data=True) if d.get('node_type') == 'Vulnerability')
    
    disrupted_vulns = set()
    for c in controls:
        if c['id'] in selected_c_ids:
            disrupted_vulns.update(c['disrupts'])
            
    disrupted_risk = sum(G.nodes[v].get('derived_risk_weight', 5.0) for v in disrupted_vulns)
    
    print(f"Total Budget      : ${budget:.2f}")
    print(f"Actual Cost Spent : ${total_cost:.2f}")
    print(f"Budget Adherence  : {'PASS' if total_cost <= budget else 'FAIL (Penalty Applied)'}")
    print("-" * 40)
    print(f"Original Risk     : {original_risk:.2f}")
    print(f"Risk Reduced      : {disrupted_risk:.2f}")
    print(f"Remaining Risk    : {original_risk - disrupted_risk:.2f}")
    print("="*40)

if __name__ == "__main__":
    run_experiment()
