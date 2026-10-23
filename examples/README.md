# Voorbeeld: Voorbeeldhuis

`voorbeeldhuis.json` is een verzonnen huis (geen echte gegevens) met 9 ruimtes, deuren en 22 nep-apparaten. Het wordt gebruikt voor de schermafbeeldingen in de handleiding.

**Inladen:** Floorplan → knop *Importeren* (naast de **+**) → kies dit bestand. De apparaten bestaan bij jou niet en staan dus grijs; koppel de ruimtes aan je eigen areas en klik bij stap 4 op *Alles automatisch plaatsen*.

## Bestandsformaat (kort)

| Veld | Betekenis |
|---|---|
| `width`, `height`, `grid` | Grootte van het tekenvlak en het raster. |
| `rooms[]` | `id`, `name`, `area_id` (HA-area) en `rects`: één of meer rechthoeken `[x0, y0, x1, y1]`. Meer rechthoeken = L-vormige ruimte. Optioneel `temperature`, `humidity` (sensor-id) en `vacuum_segments`. |
| `openings[]` | Deuren (`type: door`) en open doorgangen (`type: open`) als lijn `x1,y1 → x2,y2` op een muur. |
| `items[]` | Apparaten: `entity_id`, `x`, `y`, optioneel `name`, `icon`, `color` (`#rrggbb`) en `pin` (altijd tonen). |
| `background` | Optioneel: `url` (data-URL), `x`, `y`, `w`, `h`, `opacity`, `source` (kaart-entiteit) en `ops` (draaien/spiegelen). |
| `settings` | Alle instellingen van stap 5, zie `DEFAULT_SETTINGS` in `fps-core.js`. |

Muren staan niet in het bestand: die worden steeds uit de ruimtes berekend.
