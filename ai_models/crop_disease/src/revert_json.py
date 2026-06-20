import json
import os
import re

def main():
    disease_path = os.path.join(os.path.dirname(__file__), '../data/disease_info.json')
    report_path = r'C:\Users\PRIT\.gemini\antigravity\brain\44dac6d7-0457-48f0-acbd-89880a74b69f\missing_classes_report.md'

    with open(disease_path, 'r', encoding='utf-8') as f:
        disease_info = json.load(f)

    with open(report_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        if line.startswith('- '):
            key = line[2:].strip()
            if key in disease_info:
                del disease_info[key]

    with open(disease_path, 'w', encoding='utf-8') as f:
        json.dump(disease_info, f, indent=2)

if __name__ == '__main__':
    main()
