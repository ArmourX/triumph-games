import urllib.request
from pathlib import Path
from UnityPy import Environment

HEADERS = {"User-Agent": "UnityPlayer/2021.3.0f1 (UnityWebRequest/1.0, libcurl/7.84.0-DEV)"}
CDN = "https://bundles.sourceofmana.com/Android/prod_0.170.0/"
out = Path(r"C:\Users\dynam\triumph-games\assets\battlerise\champions")

for bundle in ["tutorial", "character_dependencies"]:
    print("===", bundle)
    data = urllib.request.urlopen(urllib.request.Request(CDN + bundle, headers=HEADERS), timeout=120).read()
    env = Environment(data)
    types = {}
    for obj in env.objects:
        types[obj.type.name] = types.get(obj.type.name, 0) + 1
    print("types", types)
    for obj in env.objects:
        if obj.type.name != "Sprite":
            continue
        d = obj.read()
        if "Invictus" in d.m_Name or "Heretic" in d.m_Name or "BlessedSentinel" in d.m_Name:
            print(" ", d.m_Name, "has image", bool(d.image))
