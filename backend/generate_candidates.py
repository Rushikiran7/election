import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    api_key = api_key.replace('"', '').replace(' ', '')
    
genai.configure(api_key=api_key)

PROMPT = """
Generate a comprehensive CSV file containing realistic mock data for Tamil Nadu election candidates. 
Include the following columns: Constituency, Pincode, Candidate_Name, Party, Manifesto_Summary. 
Generate at least 50 distinct candidates across various major constituencies in Tamil Nadu (like Chennai South, Coimbatore, Madurai, Trichy, Salem, Tirunelveli, Erode, Vellore, Thoothukudi, etc.). 
Include major parties like DMK, AIADMK, BJP, INC, NTK.
Return ONLY the raw CSV text. Do not include any markdown formatting like ```csv or ```.
"""

def generate_csv():
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(PROMPT)
        
        csv_content = response.text.strip()
        if csv_content.startswith("```csv"):
            csv_content = csv_content[6:]
        if csv_content.startswith("```"):
            csv_content = csv_content[3:]
        if csv_content.endswith("```"):
            csv_content = csv_content[:-3]
            
        with open("tamil_nadu_candidates.csv", "w", encoding="utf-8") as f:
            f.write(csv_content.strip())
            
        print("Successfully generated tamil_nadu_candidates.csv")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_csv()
