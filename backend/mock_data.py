# Mock Data for Tamil Nadu Constituencies and Candidates

mock_db = {
    "constituencies": {
        "Chennai South": {
            "pincode_ranges": ["600001", "600020", "600032", "600041"],
            "candidates": [
                {
                    "name": "Thamizhachi Thangapandian",
                    "party": "DMK",
                    "party_symbol_url": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Dravida_Munnetra_Kazhagam_Flag.svg",
                    "manifesto_summary": "Focus on IT corridor infrastructure, water management, and women's empowerment."
                },
                {
                    "name": "J. Jayavardhan",
                    "party": "AIADMK",
                    "party_symbol_url": "https://upload.wikimedia.org/wikipedia/commons/2/25/AIADMK_Flag.svg",
                    "manifesto_summary": "Promising better healthcare facilities, MSME support, and improved public transport."
                },
                {
                    "name": "Tamilisai Soundararajan",
                    "party": "BJP",
                    "party_symbol_url": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Bharatiya_Janata_Party_logo.svg",
                    "manifesto_summary": "Central government schemes integration, national security, and digital India initiatives."
                }
            ]
        },
        "Coimbatore": {
            "pincode_ranges": ["641001", "641018", "641020"],
            "candidates": [
                {
                    "name": "Ganapathi P. Rajkumar",
                    "party": "DMK",
                    "party_symbol_url": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Dravida_Munnetra_Kazhagam_Flag.svg",
                    "manifesto_summary": "Industrial growth, airport expansion, and skill development for youth."
                },
                {
                    "name": "Singai G. Ramachandran",
                    "party": "AIADMK",
                    "party_symbol_url": "https://upload.wikimedia.org/wikipedia/commons/2/25/AIADMK_Flag.svg",
                    "manifesto_summary": "Reviving the textile industry, agricultural support, and infrastructure."
                },
                {
                    "name": "K. Annamalai",
                    "party": "BJP",
                    "party_symbol_url": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Bharatiya_Janata_Party_logo.svg",
                    "manifesto_summary": "Eradicating corruption, boosting local manufacturing, and strong leadership."
                }
            ]
        }
    }
}

def get_candidates_by_pincode(pincode: str):
    for constituency, data in mock_db["constituencies"].items():
        if pincode in data["pincode_ranges"]:
            return {
                "constituency": constituency,
                "candidates": data["candidates"]
            }
    return None
