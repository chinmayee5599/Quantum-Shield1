import os
import json
import networkx as nx
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
METADATA_DIR = os.path.join(BASE_DIR, "data", "metadata")

def build_graph():
    processed_path = os.path.join(PROCESSED_DIR, "cisa_kev_processed.json")
    if not os.path.exists(processed_path):
        print(f"Processed data not found at {processed_path}. Run preprocess_data.py first.")
        return
        
    with open(processed_path, "r", encoding="utf-8") as f:
        vulns = json.load(f)
        
    # Sample vulnerabilities to construct a manageable attack graph
    random.seed(42) # For reproducibility
    sampled_vulns = random.sample(vulns, min(50, len(vulns)))
    
    G = nx.DiGraph()
    
    # 1. Add simulated assets (DERIVED/SIMULATED)
    assets = [
        {"id": "A1", "type": "External Gateway", "layer": "Perimeter"},
        {"id": "A2", "type": "Web Server", "layer": "DMZ"},
        {"id": "A3", "type": "Application Server", "layer": "Internal"},
        {"id": "A4", "type": "Database Server", "layer": "Data"},
        {"id": "A5", "type": "Active Directory", "layer": "Internal"},
    ]
    
    for a in assets:
        G.add_node(a["id"], **a, node_type="Asset")
        
    # 2. Add real vulnerabilities as nodes and link them to assets (SIMULATED Mapping)
    for v in sampled_vulns:
        vuln_id = v["cve"]
        G.add_node(vuln_id, **v, node_type="Vulnerability")
        
        # Randomly assign vulnerability to 1 or 2 assets (SIMULATED)
        target_assets = random.sample(assets, k=random.randint(1, 2))
        for ta in target_assets:
            G.add_edge(vuln_id, ta["id"], relationship="EXPLOITS")
            
    # 3. Add realistic lateral movement paths (SIMULATED)
    lateral_movements = [
        ("A1", "A2"),
        ("A2", "A3"),
        ("A3", "A4"),
        ("A3", "A5"),
        ("A2", "A5")
    ]
    
    for src, dst in lateral_movements:
        G.add_edge(src, dst, relationship="LATERAL_MOVEMENT")
        
    # Save graph as JSON
    graph_data = nx.node_link_data(G)
    graph_out = os.path.join(PROCESSED_DIR, "attack_graph.json")
    
    with open(graph_out, "w", encoding="utf-8") as f:
        json.dump(graph_data, f, indent=4)
        
    print(f"Generated attack graph with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")
    
    # Update metadata
    meta_path = os.path.join(METADATA_DIR, "cisa_kev_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
            
        metadata["graph_nodes"] = G.number_of_nodes()
        metadata["graph_edges"] = G.number_of_edges()
        metadata["graph_generated_date"] = metadata.get("processed_date")
        
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4)

if __name__ == "__main__":
    build_graph()
