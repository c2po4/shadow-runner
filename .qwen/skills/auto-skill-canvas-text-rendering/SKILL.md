---
name: canvas-text-rendering
description: Optimize canvas text rendering to avoid pixelation and achieve smooth, crisp typography
source: auto-skill
extracted_at: '2026-08-31T17:08:28.109Z'
---

# Canvas Text Rendering Optimization

## Problem
Canvas text often appears pixelated or blurry, especially when:
- Using `image-rendering: pixelated` in CSS
- Canvas is scaled or resized
- Default rendering settings are used

## Solution - Both Steps Required!

**Important:** You must do BOTH steps to fix pixelated text. Doing only one is often not enough.

### 1. CSS Settings (Most Common Culprit)
**Remove pixelated rendering:**
```css
canvas {
    /* Remove this if present: */
    /* image-rendering: pixelated; */
}
```

This is the #1 cause of pixelated text. Even if you set everything else correctly, this CSS property will override it.

### 2. Canvas Context Settings
Enable high-quality smoothing in your draw function:
```javascript
function draw() {
    ctx.save();

    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // ... rest of draw code
}
```

### 3. Font Selection
Use system fonts for crisp rendering:
```javascript
ctx.font = 'bold 48px monospace';  // Good
ctx.font = '48px "Segoe UI", sans-serif';  // Also good
```

## When to Use Pixelated Rendering
Only use `image-rendering: pixelated` when:
- Creating retro/pixel art games
- All graphics are intentionally pixelated
- You want consistent pixel scaling

**Never use it** when you need:
- Smooth text
- Anti-aliased graphics
- Modern UI elements

## Additional Tips

### Text Alignment
Always set text alignment explicitly:
```javascript
ctx.textAlign = 'center';  // or 'left', 'right'
ctx.textBaseline = 'middle';  // or 'top', 'bottom'
```

### Text Effects
Add glow/shadow effects for emphasis:
```javascript
ctx.save();
ctx.shadowColor = '#ff0000';
ctx.shadowBlur = 20;
ctx.fillText('GAME OVER', x, y);
ctx.restore();
```

## Common Mistakes

1. **Only setting `imageSmoothingEnabled = true`** - Won't help if CSS has `image-rendering: pixelated`
2. **Only removing `image-rendering: pixelated`** - Still need to enable smoothing in context
3. **Using `imageSmoothingEnabled = false`** - Makes text pixelated
4. **Forgetting to reset context** - Use `ctx.save()` and `ctx.restore()`
5. **Scaling canvas via CSS** - Set width/height attributes instead
6. **Using pixelated rendering with smooth text** - They conflict

## Debugging Checklist

If your canvas text is still pixelated:
1. ✓ Check CSS for `image-rendering: pixelated` - remove it
2. ✓ Set `ctx.imageSmoothingEnabled = true` in draw()
3. ✓ Set `ctx.imageSmoothingQuality = 'high'`
4. ✓ Use `ctx.save()` and `ctx.restore()` around effects
5. ✓ Check if canvas is being scaled via CSS (use attributes instead)
