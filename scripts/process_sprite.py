#!/usr/bin/env python3
"""
Auto-process sprite PNG: flood fill from 4 corners to remove
connected background pixels only. Preserves same-colored pixels
INSIDE the character (e.g. white t-shirt doesn't get erased).

Usage: python3 process_sprite.py <input.png> <output.png>
"""
import sys
from PIL import Image, ImageDraw

def process(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    w, h = img.size
    px = img.load()

    # Determine background color mode from 4 corners
    corners = [px[0, 0], px[w-1, 0], px[0, h-1], px[w-1, h-1]]
    avg_brightness = sum(sum(c[:3]) for c in corners) / (4 * 3)

    if avg_brightness < 60:
        mode = 'DARK'
        tolerance = 40
    elif avg_brightness > 195:
        mode = 'LIGHT'
        tolerance = 40
    else:
        print(f'  Corners avg brightness {avg_brightness:.0f} — neither clearly dark nor light, skipping')
        img.save(output_path)
        return

    # Flood fill from 4 corners with (0,0,0,0) = transparent
    # thresh controls how similar a pixel must be to spread
    for corner in [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]:
        ImageDraw.floodfill(img, corner, (0, 0, 0, 0), thresh=tolerance)

    # Count transparent pixels for logging
    px = img.load()
    transparent = sum(1 for y in range(h) for x in range(w) if px[x, y][3] == 0)

    img.save(output_path)
    print(f'  {mode} bg flood-filled: {transparent:,} pixels → transparent (character interior preserved)')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python3 process_sprite.py <input.png> <output.png>')
        sys.exit(1)
    process(sys.argv[1], sys.argv[2])
