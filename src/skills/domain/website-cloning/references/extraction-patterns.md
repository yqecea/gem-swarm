# Advanced Extraction Patterns

## Full Page Asset Inventory

```javascript
// Extract all images, videos, and background images
() => {
  const assets = { images: [], videos: [], backgrounds: [] };

  // <img> elements
  document.querySelectorAll('img').forEach(img => {
    assets.images.push({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      loading: img.loading
    });
  });

  // <video> elements
  document.querySelectorAll('video').forEach(vid => {
    assets.videos.push({
      src: vid.src || vid.querySelector('source')?.src,
      poster: vid.poster,
      autoplay: vid.autoplay,
      loop: vid.loop,
      muted: vid.muted
    });
  });

  // CSS background images
  document.querySelectorAll('*').forEach(el => {
    const bg = window.getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') {
      const urlMatch = bg.match(/url\(["']?(.+?)["']?\)/);
      if (urlMatch) {
        assets.backgrounds.push({
          element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
          url: urlMatch[1]
        });
      }
    }
  });

  return assets;
}
```

## Font Detection

```javascript
// Extract all fonts used on the page
() => {
  const fonts = new Set();

  // From computed styles
  document.querySelectorAll('*').forEach(el => {
    const family = window.getComputedStyle(el).fontFamily;
    if (family) fonts.add(family);
  });

  // From Google Fonts link tags
  const googleFonts = [];
  document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
    googleFonts.push(link.href);
  });

  // From @import in stylesheets
  const imports = [];
  try {
    [...document.styleSheets].forEach(sheet => {
      try {
        [...sheet.cssRules].forEach(rule => {
          if (rule.type === CSSRule.IMPORT_RULE && rule.href?.includes('font')) {
            imports.push(rule.href);
          }
        });
      } catch(e) {}
    });
  } catch(e) {}

  return {
    families: [...fonts],
    googleFontsLinks: googleFonts,
    importedFonts: imports
  };
}
```

## Animation Detection

```javascript
// Detect CSS transitions and animations
() => {
  const animations = [];
  const elements = document.querySelectorAll('*');

  elements.forEach(el => {
    const style = window.getComputedStyle(el);

    // CSS transitions
    if (style.transitionProperty && style.transitionProperty !== 'all' && style.transitionProperty !== 'none') {
      animations.push({
        type: 'transition',
        element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
        property: style.transitionProperty,
        duration: style.transitionDuration,
        timing: style.transitionTimingFunction,
        delay: style.transitionDelay
      });
    }

    // CSS animations
    if (style.animationName && style.animationName !== 'none') {
      animations.push({
        type: 'animation',
        element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
        name: style.animationName,
        duration: style.animationDuration,
        timing: style.animationTimingFunction,
        delay: style.animationDelay,
        iteration: style.animationIterationCount,
        direction: style.animationDirection
      });
    }
  });

  return animations;
}
```

## Full Section Map

```javascript
// Build a structural map of the page
() => {
  const sections = [];
  const candidates = document.querySelectorAll('nav, header, main, section, footer, [class*="hero"], [class*="section"], [class*="container"]');

  candidates.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    sections.push({
      index: i,
      tag: el.tagName,
      class: el.className?.toString().slice(0, 100),
      id: el.id,
      top: Math.round(rect.top + window.scrollY),
      height: Math.round(rect.height),
      backgroundColor: style.backgroundColor,
      childCount: el.children.length,
      hasText: el.textContent?.trim().length > 0
    });
  });

  return sections.filter(s => s.height > 50);
}
```

## Color Palette Extraction

```javascript
// Extract a deduplicated, organized color palette
() => {
  const colorMap = {};
  const elements = document.querySelectorAll('*');

  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    const props = {
      text: style.color,
      bg: style.backgroundColor,
      border: style.borderColor
    };

    Object.entries(props).forEach(([role, value]) => {
      if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
        // Convert rgb to hex
        const hex = value.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+).*?\)/, (_, r, g, b) =>
          '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('')
        );
        if (!colorMap[hex]) colorMap[hex] = { roles: new Set(), count: 0 };
        colorMap[hex].roles.add(role);
        colorMap[hex].count++;
      }
    });
  });

  return Object.entries(colorMap)
    .map(([hex, data]) => ({ hex, roles: [...data.roles], count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}
```
