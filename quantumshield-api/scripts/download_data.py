import os
import json
import urllib.request
from datetime import datetime

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
METADATA_DIR = os.path.join(BASE_DIR, "data", "metadata")

CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

def download_cisa_kev():
    print(f"Downloading CISA KEV dataset from {CISA_KEV_URL}...")
    file_path = os.path.join(RAW_DIR, "cisa_kev.json")
    try:
        urllib.request.urlretrieve(CISA_KEV_URL, file_path)
        print(f"Downloaded to {file_path}")
        
        # Save metadata
        metadata = {
            "source_url": CISA_KEV_URL,
            "dataset_name": "CISA Known Exploited Vulnerabilities",
            "download_date": datetime.utcnow().isoformat(),
            "file_name": "cisa_kev.json"
        }
        
        with open(os.path.join(METADATA_DIR, "cisa_kev_metadata.json"), "w") as f:
            json.dump(metadata, f, indent=4)
            
    except Exception as e:
        print(f"Error downloading dataset: {e}")

if __name__ == "__main__":
    download_cisa_kev()
