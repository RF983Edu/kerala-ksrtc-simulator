# Kerala KSRTC Simulator

A browser-based 3D Kerala bus simulation project.

## Current build
Phase 2 is an early Babylon.js driving prototype with:
- A temporary blue bus blockout
- A basic road and placeholder roadside buildings
- Acceleration, braking and steering
- Speed display
- Third-person and cockpit camera switching

## Run locally
Open `index.html` through a local static server such as VS Code Live Server, or enable GitHub Pages for the repository. Babylon.js is loaded from its public CDN, so an internet connection is required.

## Controls
- W / Up Arrow: accelerate
- S / Down Arrow: brake / reverse
- A / Left Arrow: steer left
- D / Right Arrow: steer right
- C: switch camera
- R: reset position

## Accuracy status
The bus is a simplified placeholder, not an authentic KSRTC or Ashok Leyland model. The scenery is generic, not the real Thrissur–Palakkad route. Vehicle configuration, route geometry, stops, bus stands and interiors must be researched and verified before being represented as accurate.

## Planned development
1. Identify the exact KSRTC Ashok Leyland configuration.
2. Model the bus exterior and cockpit in Blender.
3. Build and verify the Thrissur–Palakkad route and bus stands.
4. Add realistic vehicle physics, traffic, passengers and ticketing.
5. Add progression and multiplayer in later phases.
