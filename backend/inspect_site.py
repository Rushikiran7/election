import requests
import re

url = "https://tnelections2026.in/candidates.html"
response = requests.get(url)
html_content = response.text

# Find all occurrences of .json or .csv in the HTML
json_files = re.findall(r'[\w/.-]+\.json', html_content)
csv_files = re.findall(r'[\w/.-]+\.csv', html_content)
js_files = re.findall(r'[\w/.-]+\.js', html_content)

print("JSON files found:", set(json_files))
print("CSV files found:", set(csv_files))
print("JS files found:", set(js_files))

# Also check for API endpoints if any
endpoints = re.findall(r'https?://[^\s"\'<>]+', html_content)
print("URLs found:", [u for u in set(endpoints) if "tnelections2026" not in u])
