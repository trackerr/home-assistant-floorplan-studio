"""Set one version everywhere (manifest, const.py, JS VERSION and the ?v= cache-busters in imports).

    python scripts/bump_version.py 1.1.0
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CC = ROOT / "custom_components" / "floorplan_studio"


def main(version: str) -> None:
    man = CC / "manifest.json"
    data = json.loads(man.read_text(encoding="utf-8"))
    data["version"] = version
    man.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    const = CC / "const.py"
    const.write_text(re.sub(r'VERSION = "[^"]+"', f'VERSION = "{version}"', const.read_text(encoding="utf-8")), encoding="utf-8")

    for js in (CC / "frontend").glob("*.js"):
        txt = js.read_text(encoding="utf-8")
        txt = re.sub(r"export const VERSION = '[^']+'", f"export const VERSION = '{version}'", txt)
        txt = re.sub(r"(\.js)\?v=[0-9A-Za-z.\-]+'", rf"\1?v={version}'", txt)
        js.write_bytes(txt.encode("utf-8"))
    print("version", version)


if __name__ == "__main__":
    main(sys.argv[1])
