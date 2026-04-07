import requests
from bs4 import BeautifulSoup
import time


BASE_URL = "https://worldbeyblade.org"
FORUM_URL = "https://worldbeyblade.org/Forum-Beyblade-Tournaments"

headers = {
    "User-Agent": "Mozilla/5.0"
}

# ---------------------------
# STEP 1: Get all thread links
# ---------------------------
def get_threads():
    res = requests.get(FORUM_URL, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")

    threads = []

    panels = soup.select("div.panel-event-thread")

    for panel in panels:
        link = panel.find("a", href=True)

        if link:
            title = link.get_text(strip=True)
            href = link["href"]

            if not href.startswith("http"):
                href = BASE_URL + "/" + href

            threads.append({
                "title": title,
                "url": href
            })

    print(f"Found {len(threads)} threads")
    return threads


# ---------------------------
# STEP 2: Extract data per thread
# ---------------------------
def extract_thread_data(thread):
    res = requests.get(thread["url"], headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")

    # Find Google Maps link
    google_map = None

    for a in soup.find_all("a", href=True):
        href = a["href"]

        if href.startswith("https://maps.google.com/"):
            google_map = href
            break

    #Find Date
    date = None

    date_tag = soup.select_one("span.date_with_year")

    if not date_tag:
        date_tag = soup.select_one("span.date_text")

    if date_tag:
        date = date_tag.get_text(strip=True)


    #Clean up title
    title = thread["url"].removeprefix("https://worldbeyblade.org/Thread-")
    title = title.split('--', 1)[0].replace('-', ' ').strip()

    return {
        "title": title,
        "url": thread["url"],
        "google_maps": google_map,
        "date": date
    }


# ---------------------------
# MAIN
# ---------------------------
def main():
    threads = get_threads()

    if not threads:
        print("No threads found.")
        return []

    results = []

    for t in threads:
        try:
            data = extract_thread_data(t)
            results.append(data)
            print(f"Scraped: {data['title']}")
            time.sleep(1)  # avoid rate limiting
        except Exception as e:
            print(f"Error scraping {t['url']}: {e}")

    return results


if __name__ == "__main__":
    data = main()

    # Save results
    import json
    with open("tournaments.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)