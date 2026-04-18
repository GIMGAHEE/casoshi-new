#!/usr/bin/env python3
"""
Auto-process sprite PNG: detect single-color background (black or white)
from 4 corners and make it transparent.

Usage: python3 process_sprite.py <input.png> <output.png>
"""
import sys
from PIL import Image

def process(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    px = img.load()
    w, h = img.size

    # Sample 4 corners to detect background color
    corners = [px[0, 0], px[w-1, 0], px[0, h-1], px[w-1, h-1]]
    avg_brightness = sum(sum(c[:3]) for c in corners) / (4 * 3)

    if avg_brightness < 60:
        # Dark background (e.g. ChatGPT black)
        mode = 'DARK'
        def is_bg(r, g, b):
            return r < 30 and g < 30 and b < 30
    elif avg_brightness > 195:
        # Light background (e.g. manually exported on white canvas)
        mode = 'LIGHT'
        def is_bg(r, g, b):
            return r > 240 and g > 240 and b > 240
    else:
        print(f'  Corners avg brightness {avg_brightness:.0f} — neither clearly dark nor light, skipping')
        img.save(output_path)
        return

    removed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_bg(r, g, b):
                px[x, y] = (0, 0, 0, 0)
                removed += 1

    img.save(output_path)
    print(f'  {mode} bg removed: {removed:,} pixels → transparent')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python3 process_sprite.py <input.png> <output.png>')
        sys.exit(1)
    process(sys.argv[1], sys.argv[2])
