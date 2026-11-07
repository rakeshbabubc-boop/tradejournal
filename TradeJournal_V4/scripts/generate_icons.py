import os
import struct
import zlib
import math

def make_png(width, height, is_maskable=False):
    # Generates a PNG with dark navy/slate background and emerald/cyan candlestick & trend chart
    raw_rows = []
    
    bg_r, bg_g, bg_b = (10, 15, 29) # #0a0f1d
    emerald_r, emerald_g, emerald_b = (16, 185, 129) # #10b981
    cyan_r, cyan_g, cyan_b = (6, 182, 212) # #06b6d4
    white_r, white_g, white_b = (255, 255, 255)

    cx, cy = width / 2.0, height / 2.0
    radius = min(width, height) * (0.38 if is_maskable else 0.44)

    for y in range(height):
        row = bytearray([0]) # filter type 0 (None)
        ny = (y - cy) / (height / 2.0)
        for x in range(width):
            nx = (x - cx) / (width / 2.0)
            dist = math.sqrt(nx * nx + ny * ny)

            # Gradient background
            r = int(bg_r + (15 - bg_r) * (y / height))
            g = int(bg_g + (25 - bg_g) * (y / height))
            b = int(bg_b + (40 - bg_b) * (y / height))

            # Rounded square / circle container inside
            box_dist = max(abs(nx), abs(ny))
            if box_dist < 0.88:
                # Add subtle rim glow
                if 0.82 < box_dist < 0.88:
                    r, g, b = (16, 60, 50)
                elif box_dist <= 0.82:
                    r, g, b = (13, 22, 38)

            # Draw 3 candlesticks & rising trendline
            # Candlestick 1 (left, red/amber or small green)
            # Candlestick 2 (center, green)
            # Candlestick 3 (right, green breakout)
            
            # Bar 1: center x ~ 0.35 * width, w ~ 0.08 * width
            b1_x = int(width * 0.30)
            b1_w = int(width * 0.08)
            b1_top = int(height * 0.52)
            b1_bot = int(height * 0.70)
            w1_top = int(height * 0.46)
            w1_bot = int(height * 0.76)

            # Bar 2: center x ~ 0.50 * width
            b2_x = int(width * 0.46)
            b2_w = int(width * 0.08)
            b2_top = int(height * 0.40)
            b2_bot = int(height * 0.60)
            w2_top = int(height * 0.32)
            w2_bot = int(height * 0.66)

            # Bar 3: center x ~ 0.62 * width
            b3_x = int(width * 0.62)
            b3_w = int(width * 0.08)
            b3_top = int(height * 0.26)
            b3_bot = int(height * 0.48)
            w3_top = int(height * 0.20)
            w3_bot = int(height * 0.54)

            # Check wick 1
            if x == (b1_x + b1_w // 2) and w1_top <= y <= w1_bot:
                r, g, b = emerald_r, emerald_g, emerald_b
            elif b1_x <= x <= (b1_x + b1_w) and b1_top <= y <= b1_bot:
                r, g, b = (239, 68, 68) if False else (52, 211, 153)

            # Check wick 2
            if x == (b2_x + b2_w // 2) and w2_top <= y <= w2_bot:
                r, g, b = emerald_r, emerald_g, emerald_b
            elif b2_x <= x <= (b2_x + b2_w) and b2_top <= y <= b2_bot:
                r, g, b = emerald_r, emerald_g, emerald_b

            # Check wick 3
            if x == (b3_x + b3_w // 2) and w3_top <= y <= w3_bot:
                r, g, b = (52, 211, 153)
            elif b3_x <= x <= (b3_x + b3_w) and b3_top <= y <= b3_bot:
                r, g, b = (52, 211, 153)

            # Rising trendline across
            # y = -0.5 * x + height * 0.75
            line_y = int(height * 0.72 - (x - width * 0.22) * 0.62)
            if abs(y - line_y) <= max(1, width // 100):
                if int(width * 0.22) <= x <= int(width * 0.78):
                    r, g, b = cyan_r, cyan_g, cyan_b

            row.extend([r, g, b])
        raw_rows.append(bytes(row))

    raw_data = b''.join(raw_rows)
    compressed = zlib.compress(raw_data)

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)) # 8-bit RGB
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    return png

os.makedirs('/app/applet/public', exist_ok=True)

with open('/app/applet/public/pwa-192x192.png', 'wb') as f:
    f.write(make_png(192, 192, False))

with open('/app/applet/public/pwa-512x512.png', 'wb') as f:
    f.write(make_png(512, 512, False))

with open('/app/applet/public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(make_png(512, 512, True))

with open('/app/applet/public/apple-touch-icon.png', 'wb') as f:
    f.write(make_png(180, 180, False))

# Also copy 192 as favicon
with open('/app/applet/public/favicon.ico', 'wb') as f:
    f.write(make_png(64, 64, False))

print("Icons successfully created in /public")
