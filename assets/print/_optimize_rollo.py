"""One-shot optimizer: Gemini label -> Rollo 4x6 print PNGs."""
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

SRC = Path(r"C:\Users\aquac\Downloads\Gemini_Generated_Image_hqgjrqhqgjrqhqgj.png")
QR_PATH = Path(r"F:\repos\puzzlestats\assets\qr\boxqr.png")
OUT_DIR_DL = Path(r"C:\Users\aquac\Downloads")
OUT_DIR_REPO = Path(r"F:\repos\puzzlestats\assets\print")
OUT_DIR_REPO.mkdir(parents=True, exist_ok=True)

src = Image.open(SRC).convert("RGBA")
bg = Image.new("RGBA", src.size, (255, 255, 255, 255))
flat = Image.alpha_composite(bg, src).convert("L")
arr = np.array(flat)
bw = (arr < 128).astype(np.uint8)

# Detect QR modules in top-left (exclude outer border / title / Download text)
band = bw[50:330, 60:360]
ys, xs = np.where(band > 0)
y0, y1 = int(ys.min()) + 50, int(ys.max()) + 50
x0, x1 = int(xs.min()) + 60, int(xs.max()) + 60
pad = 8
x0e = max(40, x0 - pad)
y0e = max(40, y0 - pad)
x1e = min(348, x1 + pad)
y1e = min(340, y1 + pad)
print(f"QR replace region: ({x0e},{y0e})-({x1e},{y1e}) size {x1e - x0e + 1}x{y1e - y0e + 1}")

qr = Image.open(QR_PATH).convert("1")
region_w, region_h = x1e - x0e + 1, y1e - y0e + 1
side = min(region_w, region_h)
qr_resized = qr.resize((side, side), Image.Resampling.NEAREST)
qr_canvas = Image.new("L", (region_w, region_h), 255)
ox = (region_w - side) // 2
oy = (region_h - side) // 2
qr_canvas.paste(qr_resized.convert("L"), (ox, oy))

work = flat.copy()
work.paste(qr_canvas, (x0e, y0e))

work = work.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=2))
work = ImageEnhance.Contrast(work).enhance(1.35)
arr2 = np.array(work)
bin_arr = np.where(arr2 < 180, 0, 255).astype(np.uint8)
bw_img = Image.fromarray(bin_arr, mode="L")


def fit_to_label(img: Image.Image, tw: int, th: int) -> Image.Image:
    canvas = Image.new("L", (tw, th), 255)
    scale = min(tw / img.width, th / img.height)
    nw = max(1, int(round(img.width * scale)))
    nh = max(1, int(round(img.height * scale)))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    rarr = np.array(resized)
    resized = Image.fromarray(np.where(rarr < 160, 0, 255).astype(np.uint8), mode="L")
    x = (tw - nw) // 2
    y = (th - nh) // 2
    canvas.paste(resized, (x, y))
    return canvas.convert("1", dither=Image.Dither.NONE)


def save(img: Image.Image, path: Path, dpi: int) -> None:
    img.save(path, format="PNG", dpi=(dpi, dpi), optimize=True)
    check = Image.open(path)
    print(f"Saved {path}")
    print(f"  size={check.size} mode={check.mode} dpi={check.info.get('dpi')}")


img_300 = fit_to_label(bw_img, 1200, 1800)
img_203 = fit_to_label(bw_img, 812, 1218)

for path, im, dpi in [
    (OUT_DIR_DL / "puzzlestats-rollo-4x6-300dpi.png", img_300, 300),
    (OUT_DIR_DL / "puzzlestats-rollo-4x6-203dpi.png", img_203, 203),
    (OUT_DIR_REPO / "puzzlestats-rollo-4x6-300dpi.png", img_300, 300),
    (OUT_DIR_REPO / "puzzlestats-rollo-4x6-203dpi.png", img_203, 203),
]:
    save(im, path, dpi)

arr300 = np.array(img_300.convert("L"))
dark = arr300 < 128
ys, xs = np.where(dark)
dpi = 300
print("300dpi content margins (inches):")
print(
    f"  L={xs.min() / dpi:.3f} T={ys.min() / dpi:.3f} "
    f"R={(1199 - xs.max()) / dpi:.3f} B={(1799 - ys.max()) / dpi:.3f}"
)
print("Done.")
