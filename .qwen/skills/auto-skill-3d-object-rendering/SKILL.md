---
name: 3d-object-rendering
description: Render 3D-looking objects in 2D canvas games using images, clipping, and gradient overlays
source: auto-skill
extracted_at: '2026-09-01T09:06:43.449Z'
---

# 3D Object Rendering in 2D Canvas Games

## Approach

Create realistic 3D-looking objects by combining image textures with radial gradient overlays for lighting and shadows.

## Implementation Steps

### 1. Load Image Asset
```javascript
const objectImage = new Image();
objectImage.src = 'texture.avif';
```

Always check if the image is loaded before drawing:
```javascript
if (objectImage.complete && objectImage.naturalWidth > 0) {
    // draw image
} else {
    // fallback: draw a colored circle
}
```

### 2. Draw with Circular Clipping
```javascript
ctx.save();
ctx.beginPath();
ctx.arc(cx, cy, radius, 0, Math.PI * 2);
ctx.clip();

// Draw image centered
ctx.drawImage(objectImage, cx - radius, cy - radius, radius * 2, radius * 2);
ctx.restore();
```

### 3. Add 3D Lighting Effects
Apply radial gradients OVER the image to create depth:

**Shadow (bottom-right):**
```javascript
const shadowGradient = ctx.createRadialGradient(
    cx + radius * 0.5, cy + radius * 0.5, 0,
    cx, cy, radius
);
shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
shadowGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.3)');
shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
```

**Highlight (top-left):**
```javascript
const highlightGradient = ctx.createRadialGradient(
    cx - radius * 0.6, cy - radius * 0.6, 0,
    cx - radius * 0.6, cy - radius * 0.6, radius * 0.8
);
highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
highlightGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
```

### 4. Add Rotation Animation
For rolling objects, use time-based rotation:
```javascript
const rotation = (Date.now() / 500 + object.x) % (Math.PI * 2);

ctx.save();
ctx.translate(cx, cy);
ctx.rotate(rotation);
// Draw clipped image
ctx.restore();
```

### 5. Conditional Animation
Only animate when appropriate (e.g., only when on ground):
```javascript
if (object.onGround) {
    rotation = (Date.now() / 500 + object.x) % (Math.PI * 2);
} else {
    rotation = 0; // Static when in air
}
```

## Key Principles

- **Layer gradients over images** to create realistic lighting
- **Use circular clipping** to constrain textures to object shape
- **Offset light source** (top-left) for natural appearance
- **Multiple gradient layers** (shadow + highlight) for depth
- **Time-based rotation** tied to object position for rolling effect
- **State-based animation** (only animate when appropriate)

## Use Cases

- Balls, coins, power-ups in platformers
- Any spherical or cylindrical objects
- Objects that need to appear 3D in a 2D game
