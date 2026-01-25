#!/bin/bash
# Generate placeholder icons (requires ImageMagick)
# Replace this with actual icon generation once you have a logo

sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
  # Create a simple colored square as placeholder
  convert -size ${size}x${size} xc:#4f46e5 \
    -gravity center \
    -pointsize $((size/4)) \
    -fill white \
    -annotate +0+0 "TA" \
    icon-${size}x${size}.png 2>/dev/null || echo "ImageMagick not installed, skipping icon-${size}x${size}.png"
done

echo "Generated placeholder icons. Replace with actual TeachAssist logo."
