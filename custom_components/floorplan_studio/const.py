"""Constants for Floorplan Studio."""

DOMAIN = "floorplan_studio"
VERSION = "1.3.0b23"
REPO_URL = "https://github.com/trackerr/home-assistant-floorplan-studio"

STORAGE_KEY = "floorplan_studio.plans"
STORAGE_KEY_USAGE = "floorplan_studio.usage"
STORAGE_VERSION = 1

STATIC_URL = "/floorplan_studio_static"
CARD_FILE = "fps-loader.js"   # tiny starter; it loads floorplan-studio-card.js
PANEL_FILE = "floorplan-studio-panel.js"
PANEL_URL_PATH = "floorplan-studio"
PANEL_COMPONENT = "floorplan-studio-panel"

DEFAULT_USAGE_DAYS = 14
USAGE_KEEP_DAYS = 60
