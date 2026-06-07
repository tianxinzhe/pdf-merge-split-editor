from PIL import Image, ImageDraw
import os

icons_dir = os.path.join(os.path.dirname(__file__), '..', 'dist', 'icons')
os.makedirs(icons_dir, exist_ok=True)

for size in [16, 48, 128]:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = int(size * 0.18)
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=(37, 99, 235, 255))
    s1_top = int(size * 0.30)
    s1_h = max(1, int(size * 0.08))
    s1_l = int(size * 0.20)
    s1_r = int(size * 0.80)
    s2_top = s1_top + s1_h + max(1, int(size * 0.04))
    s2_w = int(size * 0.40)
    draw.rectangle([s1_l, s1_top, s1_r, s1_top + s1_h], fill=(255, 255, 255, 255))
    draw.rectangle([s1_l, s2_top, s1_l + s2_w, s2_top + s1_h], fill=(255, 255, 255, 255))
    out = os.path.join(icons_dir, 'icon{}.png'.format(size))
    img.save(out, 'PNG')
    print('icon{}.png: {} bytes'.format(size, os.path.getsize(out)))
print('Done')
