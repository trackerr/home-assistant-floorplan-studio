"""Shrink docs/img/*.png after shoot.mjs (max 1400 px wide, 256 colours). Needs Pillow."""
import glob, pathlib
from PIL import Image

root = pathlib.Path(__file__).resolve().parents[2]
for f in glob.glob(str(root / 'docs/img/*.png')):
    im = Image.open(f).convert('RGB')
    if im.width > 1400:
        im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
    im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(f, optimize=True)
    print('ok', pathlib.Path(f).name)
