import concurrent.futures
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1] / "src" / "lib" / "i18n" / "dictionaries"
source = (root / "tr" / "pricing.ts").read_text(encoding="utf-8")
values = [json.JSONDecoder().raw_decode(line.strip())[0] for line in source.splitlines()[1:-1]]

def translate(value):
    if value in {"Free", "Starter", "Pro", "Enterprise", "Brand DNA™", "Brand DNA (Web Sitesi Tarama)"}:
        return value
    query = urllib.parse.urlencode({"client": "gtx", "sl": "tr", "tl": "en", "dt": "t", "q": value})
    for attempt in range(3):
        try:
            request = urllib.request.Request("https://translate.googleapis.com/translate_a/single?" + query,
                                             headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(request, timeout=15) as response:
                data = json.load(response)
            result = "".join(chunk[0] or "" for chunk in data[0]).strip()
            return result or value
        except Exception:
            time.sleep(attempt + 1)
    return value

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    translated = list(pool.map(translate, values))

output = "export const enPricing = {\n" + "\n".join(
    f"  {json.dumps(key, ensure_ascii=False)}: {json.dumps(value, ensure_ascii=False)},"
    for key, value in zip(values, translated)
) + "\n} as const;\n"
(root / "en" / "pricing.ts").write_text(output, encoding="utf-8")
print(f"Translated {sum(a != b for a, b in zip(values, translated))} of {len(values)} entries")
