from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT / "public" / "icons"
ICONS_DIR.mkdir(parents=True, exist_ok=True)

BACKGROUND = (6, 26, 56)
LIME = (197, 243, 51)
WHITE = (255, 255, 255)


def draw_icon(size: int, maskable: bool = False) -> Image.Image:
    image = Image.new("RGBA", (size, size), BACKGROUND + (255,))
    draw = ImageDraw.Draw(image)

    margin = size * 0.14
    shield_width = size * 0.58
    shield_left = (size - shield_width) / 2
    shield_top = size * 0.18
    shield_bottom = size * 0.82

    points = [
        (size / 2, shield_top),
        (size - margin, size * 0.37),
        (size - margin, size * 0.72),
        (size / 2, shield_bottom),
        (margin, size * 0.72),
        (margin, size * 0.37),
    ]
    draw.polygon(points, fill=LIME)

    arrow_left = size * 0.35
    arrow_top = size * 0.38
    arrow_right = size * 0.65
    arrow_bottom = size * 0.62
    draw.polygon(
        [
            (size / 2, arrow_top),
            (arrow_right, size / 2),
            (size * 0.6, size / 2),
            (size * 0.6, arrow_bottom),
            (arrow_left, arrow_bottom),
            (arrow_left, size / 2),
        ],
        fill=BACKGROUND,
    )

    if maskable:
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((margin * 0.75, margin * 0.75, size - margin * 0.75, size - margin * 0.75), fill=255)
        image.putalpha(mask)

    # Draw a white accent line for clarity.
    accent = size * 0.11
    draw.rounded_rectangle(
        (size * 0.22, size * 0.24, size * 0.78, size * 0.68),
        radius=int(size * 0.08),
        outline=WHITE,
        width=max(2, int(size * 0.04)),
    )

    return image


for size in (192, 512):
    icon = draw_icon(size)
    icon.save(ICONS_DIR / f"icon-{size}.png")

maskable = draw_icon(512, maskable=True)
maskable.save(ICONS_DIR / "icon-maskable-512.png")

apple = draw_icon(180)
apple.save(ICONS_DIR / "apple-touch-icon-180.png")

svg_path = ICONS_DIR / "app-icon.svg"
svg_path.write_text(
    """<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\">\n  <defs>\n    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n      <stop offset=\"0%\" stop-color=\"#061a38\"/>\n      <stop offset=\"100%\" stop-color=\"#0b244e\"/>\n    </linearGradient>\n  </defs>\n  <rect width=\"512\" height=\"512\" rx=\"92\" fill=\"url(#bg)\"/>\n  <path d=\"M256 90 L406 195 L406 321 L256 422 L106 321 L106 195 Z\" fill=\"#c5f333\"/>\n  <path d=\"M256 174 L331 240 L291 240 L291 302 L221 302 L221 240 L181 240 Z\" fill=\"#061a38\"/>\n</svg>\n""",
    encoding="utf-8",
)

print(f"Ícones gerados em {ICONS_DIR}")
