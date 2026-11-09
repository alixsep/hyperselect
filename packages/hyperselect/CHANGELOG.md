# Changelog

## 0.1.2

- Effects inside painted containers and on `highlight()` elements no longer swap red and blue in Firefox versions whose accelerated 2D canvas swaps them when copying from WebGL.
- The effect no longer adds a pixel of scroll to a scrolling box whose height is not a whole number of pixels.
- On Android, the copy and share menu no longer jumps or flickers while text in or next to a painted element is selected.

## 0.1.1

- Text inside a closed `<details>`, or anything else the browser hides from view, is no longer highlighted when it is part of the selection.
- The effect no longer grows the scrollable area of a scrolling box it draws in, such as a code block.
- The effect stays inside a `<details>` while it opens or closes.

## 0.1.0

First release.

- `createHyperSelect()` draws a WebGL effect behind selected text while the selection itself stays native.
- `highlight()` draws an effect on an element's text all the time, for badges and preset pickers, and `setPaused()` freezes it.
- Custom presets are plain objects: a GLSL surface for each selected line, plus optional instanced particles driven by a JavaScript behavior. Shaders can use `hash`, `hash2`, `noise`, `fbm`, `fbm3`, `voronoi`, `sdBox`, `sdRBox` and `over`.
- Options: `theme`, which follows the system color scheme when left out, `root`, `zIndex`, `padding`, and `adaptive` to lower the render resolution while frames are slow.
- The effect follows its text through scrolling, zooming, reflow and transforms, inside scrolling containers, sticky headers, fixed bars and modal dialogs.
- The native highlight is kept for rotated or vertical text, shadow roots, forced colors mode, elements marked `data-hyperselect-ignore` and browsers without WebGL2.
- Respects `prefers-reduced-motion`, works under a strict Content Security Policy, and is safe to call during server rendering.
- Nothing is drawn while nothing is selected or animating. The engine with one preset is about 14 kB gzipped.
