"""Constants for Floorplan Studio."""

DOMAIN = "floorplan_studio"
VERSION = "1.4.0b53"
REPO_URL = "https://github.com/trackerr/home-assistant-floorplan-studio"

STORAGE_KEY = "floorplan_studio.plans"
STORAGE_KEY_USAGE = "floorplan_studio.usage"
STORAGE_VERSION = 1

STATIC_URL = "/floorplan_studio_static"
MODELS_URL = "/floorplan_studio_models"   # your own 3D models (furniture), kept in <config>/floorplan_studio/models
MODELS_DIR = "floorplan_studio/models"
MODEL_MAX_BYTES = 40 * 1024 * 1024
MODEL_EXTS = (".glb", ".gltf", ".obj")
CARD_FILE = "fps-loader.js"   # tiny starter; it loads floorplan-studio-card.js
PANEL_FILE = "floorplan-studio-panel.js"
PANEL_URL_PATH = "floorplan-studio"
PANEL_COMPONENT = "floorplan-studio-panel"

SIGNAL_PLAN_SAVED = "floorplan_studio_plan_saved"

DEFAULT_USAGE_DAYS = 14
USAGE_KEEP_DAYS = 60
