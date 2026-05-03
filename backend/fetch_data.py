import requests
import json
import csv
import re

url_candidates = "https://tnelections2026.in/data/candidates_bundle.min.js"
url_constituencies = "https://tnelections2026.in/data/constituencies.js"

print(f"Fetching {url_constituencies}")
res_const = requests.get(url_constituencies)

print(f"Fetching {url_candidates}")
res_cand = requests.get(url_candidates)

const_text = res_const.text
cand_text = res_cand.text

# Try to extract the constituency mapping
match_const = re.search(r'\[\s*\{.*?\}\s*\]', const_text, re.DOTALL)
constituency_map = {}
if match_const:
    try:
        const_data = json.loads(match_const.group(0))
        for c in const_data:
            ac_no = c.get('id') or c.get('acNo') or c.get('no')
            name = c.get('name') or c.get('constituency')
            if ac_no is not None and name is not None:
                constituency_map[str(ac_no)] = name
        print(f"Found {len(constituency_map)} constituencies.")
    except Exception as e:
        print("Failed to parse constituency JSON:", e)

match_cand = re.search(r'\[\s*\{.*?\}\s*\]', cand_text, re.DOTALL)
if match_cand:
    try:
        cand_data = json.loads(match_cand.group(0))
        print(f"Found {len(cand_data)} candidates!")
        
        if len(cand_data) > 0:
            keys = set()
            for row in cand_data:
                # Add constituency name
                ac_no = str(row.get('acNo', ''))
                row['constituency'] = constituency_map.get(ac_no, f"Unknown ({ac_no})")
                keys.update(row.keys())
            keys = list(keys)
            
            # Put 'constituency' at the beginning
            if 'constituency' in keys:
                keys.remove('constituency')
                keys.insert(0, 'constituency')
                
            # Saving to a different file name to avoid permission issues if the user has it open
            file_name = "tamil_nadu_2026_candidates_full.csv"
            with open(file_name, "w", newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=keys, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(cand_data)
            print(f"Successfully saved real dataset with constituencies to {file_name}")
    except Exception as e:
        print("Failed to parse candidates JSON:", e)
else:
    print("Could not find candidate array")
