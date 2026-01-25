# TeachAssist PWA Icons

This folder should contain the following icon files for PWA support:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Generating Icons

You can use a service like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Or use ImageMagick:

```bash
# From a 512x512 source image:
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

## Design Guidelines

**TeachAssist Icon:**
- Background: Slate 900 (#0f172a)
- Accent: Indigo 600 (#4f46e5)
- Symbol: Graduation cap or book icon
- Style: Clean, professional, education-focused
- Safe area: 10% padding from edges for maskable icons
