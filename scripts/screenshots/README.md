# Schermafbeeldingen maken

Draait de echte kaart en editor tegen een **nep-Home Assistant** (`demo-hass.js`) met het verzonnen Voorbeeldhuis (`../../examples/voorbeeldhuis.json`). Er wordt geen echte HA of echte data gebruikt.

```bash
cd scripts/screenshots
npm install            # playwright + @mdi/js (iconen)
npx playwright install chromium   # eenmalig, als je nog geen Chromium hebt
node shoot.mjs         # alles, of: node shoot.mjs melding   (alleen namen met "melding")
python compress.py     # verkleinen (Pillow nodig)
```

De beelden komen in `docs/img/`. `demo.html` kun je ook zelf openen via een lokale webserver vanuit de repo-root, bijv. `/scripts/screenshots/demo.html?theme=rock` of `?view=panel`.
