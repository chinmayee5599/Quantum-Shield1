from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import random
import networkx as nx
import threading

# Import existing quantum engine
from quantum.qubo_builder import build_qubo_model
from quantum.qaoa_solver import solve_qaoa
from optimization.classical_solver import solve_classical_brute_force

app = FastAPI(title="QuantumShield API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "quantumshield-api"}

@app.get("/api/metrics")
def get_metrics():
    graph_path = os.path.join(PROCESSED_DIR, "attack_graph.json")
    if not os.path.exists(graph_path):
        return {"error": "Graph not found"}
        
    with open(graph_path, "r") as f:
        data = json.load(f)
        
    G = nx.node_link_graph(data)
    vuln_count = sum(1 for n, d in G.nodes(data=True) if d.get('node_type') == 'Vulnerability')
    
    return {
        "number_of_vulnerabilities": vuln_count,
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges()
    }

@app.get("/api/graph")
def get_graph():
    graph_path = os.path.join(PROCESSED_DIR, "attack_graph.json")
    if not os.path.exists(graph_path):
        raise HTTPException(status_code=500, detail="Graph not found")
        
    with open(graph_path, "r") as f:
        return json.load(f)

# Global in-memory job manager
job_state = {
    "status": "idle", # idle, running, completed, failed
    "optimize_result": None,
    "benchmark_result": None,
    "error": None
}
state_lock = threading.Lock()

def run_heavy_qaoa_job():
    try:
        graph_path = os.path.join(PROCESSED_DIR, "attack_graph.json")
        if not os.path.exists(graph_path):
            raise Exception("Graph not found")
            
        with open(graph_path, "r") as f:
            graph_data = json.load(f)
            
        G = nx.node_link_graph(graph_data)
        vuln_nodes = [n for n, d in G.nodes(data=True) if d.get('node_type') == 'Vulnerability']
        
        # 5 controls for QAOA
        random.seed(42)
        controls = []
        for i in range(5):
            disrupts = random.sample(vuln_nodes, min(len(vuln_nodes), random.randint(3, 5)))
            controls.append({
                "id": f"C{i+1}",
                "cost": round(random.uniform(10, 30), 2),
                "disrupts": disrupts
            })
            
        budget = 100.0
        alpha = 1.0
        beta = 5.0
        
        # 1. Classical Exact
        classical_res = solve_classical_brute_force(G, controls, budget, alpha, beta)
        
        # 2. QAOA
        mdl, _ = build_qubo_model(G, controls, budget, alpha, beta)
        quantum_res = solve_qaoa(mdl)
        
        def calc_metrics(selected_ids):
            cost = sum(c['cost'] for c in controls if c['id'] in selected_ids)
            disrupts_set = set()
            for c in controls:
                if c['id'] in selected_ids:
                    disrupts_set.update(c['disrupts'])
            disrupted_risk = sum(G.nodes[v].get('derived_risk_weight', 5.0) for v in disrupts_set)
            return cost, disrupted_risk
            
        c_cost, c_red = calc_metrics(classical_res['selected_controls'])
        q_cost, q_red = calc_metrics(quantum_res['selected_controls'])
        
        opt_gap = abs(quantum_res['best_objective_value'] - classical_res['best_objective_value'])
        opt_gap_pct = (opt_gap / abs(classical_res['best_objective_value'])) * 100 if classical_res['best_objective_value'] != 0 else 0.0
        
        original_risk = sum(d.get('derived_risk_weight', 5.0) for n, d in G.nodes(data=True) if d.get('node_type') == 'Vulnerability')
        
        benchmark_result = {
            "hardware_environment": "Local CPU Simulator (No Quantum Advantage Claimed)",
            "classical": {
                "execution_time_sec": classical_res['execution_time_sec'],
                "best_objective_value": classical_res['best_objective_value'],
                "selected_controls": classical_res['selected_controls'],
                "risk_reduced": c_red,
                "total_cost": c_cost,
                "budget_feasibility": "PASS" if c_cost <= budget else "FAIL"
            },
            "qaoa": {
                "execution_time_sec": quantum_res['execution_time_sec'],
                "best_objective_value": quantum_res['best_objective_value'],
                "optimality_gap_pct": round(opt_gap_pct, 4),
                "selected_controls": quantum_res['selected_controls'],
                "risk_reduced": q_red,
                "total_cost": q_cost,
                "budget_feasibility": "PASS" if q_cost <= budget else "FAIL"
            }
        }
        
        optimize_result = {
            "quantum_metrics": {
                "num_variables": quantum_res['num_variables'],
                "num_qubits": quantum_res['num_qubits'],
                "qaoa_depth": quantum_res['qaoa_depth'],
                "optimizer_status": quantum_res['status'],
                "execution_time_sec": round(quantum_res['execution_time_sec'], 3),
                "best_objective_value": round(quantum_res['best_objective_value'], 2)
            },
            "solution": {
                "selected_controls": quantum_res['selected_controls'],
                "total_budget": budget,
                "actual_cost": round(q_cost, 2),
                "budget_adherence": "PASS" if q_cost <= budget else "FAIL",
                "original_risk": round(original_risk, 2),
                "risk_reduced": round(q_red, 2),
                "remaining_risk": round(original_risk - q_red, 2)
            }
        }
        
        with state_lock:
            job_state["optimize_result"] = optimize_result
            job_state["benchmark_result"] = benchmark_result
            job_state["status"] = "completed"
            
    except Exception as e:
        with state_lock:
            job_state["status"] = "failed"
            job_state["error"] = str(e)


@app.post("/api/job/start")
def start_job(background_tasks: BackgroundTasks):
    with state_lock:
        if job_state["status"] in ["idle", "failed"]:
            job_state["status"] = "running"
            job_state["error"] = None
            background_tasks.add_task(run_heavy_qaoa_job)
        return {"status": job_state["status"]}

@app.get("/api/job/status")
def get_job_status():
    with state_lock:
        return job_state

@app.post("/api/optimize")
def run_optimization():
    # Deprecated fallback - now throws 400 to force frontend to use job polling
    raise HTTPException(status_code=400, detail="Use /api/job/start and /api/job/status instead.")

@app.post("/api/benchmark")
def run_benchmark_endpoint():
    # Deprecated fallback
    raise HTTPException(status_code=400, detail="Use /api/job/start and /api/job/status instead.")
