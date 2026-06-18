import requests
from bs4 import BeautifulSoup
from pathlib import Path

URLS_FILE = "../data/urls.txt"
OUTPUT_DIR = "../data/html_cache"

Path(OUTPUT_DIR).mkdir(exist_ok=True)

with open(URLS_FILE, "r", encoding="utf-8") as f:
    urls = [line.strip() for line in f if line.strip()]

for i, url in enumerate(urls, start=1):
    try:
        html = requests.get(url, timeout=20).text

        soup = BeautifulSoup(html, "html.parser")

        # remove script/style
        for tag in soup(["script", "style"]):
            tag.extract()

        text = soup.get_text(separator="\n")

        text = "\n".join(
            line.strip()
            for line in text.splitlines()
            if line.strip()
        )

        filename = f"page_{i}.txt"

        with open(
            f"{OUTPUT_DIR}/{filename}",
            "w",
            encoding="utf-8"
        ) as out:
            out.write(text)

        print(f"Saved {filename}")

    except Exception as e:
        print(url, e)