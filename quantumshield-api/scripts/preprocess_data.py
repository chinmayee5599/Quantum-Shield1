import os
import json
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
METADATA_DIR = os.path.join(BASE_DIR, "data", "metadata")

def preprocess_cisa_kev():
    raw_path = os.path.join(RAW_DIR, "cisa_kev.json")
    if not os.path.exists(raw_path):
        print(f"Raw data not found at {raw_path}. Run download_data.py first.")
        return

    with open(raw_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    catalog = data.get("vulnerabilities", [])
    
    processed_records = []
    
    for vuln in catalog:
        cve = vuln.get("cveID")
        vendor = vuln.get("vendorProject")
        product = vuln.get("product")
        name = vuln.get("vulnerabilityName")
        ransomware_campaign = vuln.get("knownRansomwareCampaignUse", "Unknown")
        
        # Risk weight heuristic (DERIVED/SIMULATED)
        base_weight = 9.5 if ransomware_campaign == "Known" else 7.5
        
        record = {
            "cve": cve,
            "vendor": vendor,
            "product": product,
            "name": name,
            "ransomware_campaign": ransomware_campaign,
            "derived_risk_weight": base_weight,
            "source": "CISA_KEV"
        }
        processed_records.append(record)
        
    out_path = os.path.join(PROCESSED_DIR, "cisa_kev_processed.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(processed_records, f, indent=4)
        
    print(f"Processed {len(processed_records)} vulnerabilities and saved to {out_path}.")
    
    # Update metadata
    meta_path = os.path.join(METADATA_DIR, "cisa_kev_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
        
        metadata["processed_date"] = datetime.utcnow().isoformat()
        metadata["number_of_vulnerabilities"] = len(processed_records)
        metadata["catalog_version"] = data.get("catalogVersion", "Unknown")
        
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4)

if __name__ == "__main__":
    preprocess_cisa_kev()
