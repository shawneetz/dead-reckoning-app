# Dead Reckoning Simulation Interactive Web App: Navigating Like an Austronesian Sailor

> _"They had no compass, no GPS, no instruments. Just the stars, the waves, and an intimate knowledge of direction and distance. And somehow, they found every island in the Pacific."_

This app is a tribute to that. It's an interactive dead reckoning simulator built with React and Leaflet, centered on the Philippines because Filipino sailors were among the greatest navigators in human history, and most people have no idea.

---

## What Even Is Dead Reckoning?

Dead reckoning is one of the oldest navigation techniques in the world.
The idea is simple: **if you know where you started, which direction you're heading, and how far you've traveled you can figure out where you are.**

No landmarks. No GPS. Just math and trust.

The name itself is a bit mysterious. It's likely a corruption of "ded. reckoning" short for _deduced reckoning_, though sailors have been arguing about the etymology for centuries. What's not up for debate is how effective it was. Polynesian and Austronesian sailors used it (along with star paths, wave patterns, and bird behavior) to navigate the Pacific Ocean the largest body of water on Earth thousands of years before European explorers had even considered the possibility.

The catch? Errors accumulate. Every small mistake in bearing or distance compounds over time. By the end of a long voyage, you might be miles from where you _thought_ you were. That gap between where you walked and where you actually ended up is what this app calls **drift** and it's the core educational concept the app is built around.

---

## The History Behind It

Long before GPS, long before compasses reached Southeast Asia, the Austronesian peoples ancestors of modern Filipinos, Indonesians, Malaysians, and Pacific Islanders were the greatest maritime civilization on Earth.

Starting around 3000 BCE, they expanded outward from Taiwan across the Philippine archipelago, down through Island Southeast Asia, and eventually across the open Pacific to Hawaii, New Zealand, and Easter Island. This is the single largest geographic expansion of any human culture before the modern era.

They navigated using a system called **wayfinding**: memorized star paths, the feel of ocean swells against the hull, wind direction, cloud formations above islands, and the behavior of migratory birds. Dead reckoning tracking cumulative direction and distance was the backbone of it all.

The UPLB Campus Walk preset in this app is a small homage to that tradition, plotted right here in Los Baños, Laguna, Philippines where the University of the Philippines Los Baños sits at the foot of Mount Makiling, itself a place of deep cultural significance in Filipino folklore.

---

## How the App Works

### The Core Math

The core of the app lives in `src/utils/deadReckoning.js`. Two functions do the heavy lifting:

**`bearingToLatLng()`** takes a starting coordinate, a direction in degrees, and a distance in meters and returns where you end up. Under the hood, it uses [Turf.js](https://turfjs.org/), a geospatial math library that handles the curvature of the Earth for you.

```js
// Start at UPLB main gate, walk 200m due East
bearingToLatLng([14.1667, 121.2435], 90, 200);
// → [14.1667, 121.2461]  same latitude, shifted east
```

One critical gotcha that trips everyone up: **Turf.js uses GeoJSON coordinate order `[longitude, latitude]`, but Leaflet uses `[latitude, longitude]`**. They're reversed. The `bearingToLatLng()` function handles this conversion so nothing else in the app has to think about it.

**`calcStats()`** chains all your steps together and computes four things:

- **Total distance walked** the sum of every step's distance
- **Displacement** the straight-line distance from your origin to where you actually ended up
- **Drift %** `(totalWalked - displacement) / totalWalked × 100`. This is the hero stat. A perfect straight line gives 0% drift. Walking in a complete circle gives 100%.
- **Bearing from origin** which direction you ended up from where you started

**`buildCoords()`** chains all the steps iteratively each step's output becomes the next step's input producing the full coordinate path rendered on the map.

### The Map

The map is built with [Leaflet](https://leafletjs.com/) via [React-Leaflet](https://react-leaflet.js.org/). A few things worth noting:

- **The displacement vector** the dashed red line from your origin to your final position is the most important visual element. It's the difference between where dead reckoning _put_ you and where you actually went.
- **Step color interpolation** each step segment fades from blue (`#378ADD`) to teal (`#1D9E75`) as you progress, giving you a visual sense of direction and sequence.
- **The map doesn't re-center on origin change** this is a React-Leaflet constraint. `MapContainer` can only be mounted once; re-mounting it destroys and recreates the map, which causes a flicker. Instead, the map pans smoothly to each step during playback using Leaflet's `panTo()`.

### State Management

All global state lives in `App.jsx` no Redux, no Zustand, just React's `useState` and `useRef`. The undo/redo system works by maintaining a `history[]` array of full step snapshots. Every time you add a step, the current state is pushed onto the history stack. Undo pops it back off. It's not memory-efficient for thousands of steps, but for a navigation tool with under 20 steps it's perfectly fine and dead simple to reason about.

```
steps[]       the current route
history[]     stack of previous steps[] states (for undo)
redoStack[]   stack of undone states (for redo)
origin        [lat, lng] of the starting point
playIndex     how many steps are currently visible during animation
isPlaying     whether the animation interval is running
```

### The Animation

Playback is a `setInterval` that increments `playIndex` every 600ms. `MapView` slices the coordinate array to `allCoords.slice(0, playIndex + 1)` so it only renders the steps revealed so far. When the interval reaches `steps.length`, it clears itself and sets `isPlaying` to false.

Pause works by clearing the interval without resetting `playIndex`. Resume restarts the interval from wherever `playIndex` left off. The map pans to each new coordinate automatically during playback via a `FlyToStep` child component that uses React-Leaflet's `useMap()` hook.

---

## Tech Stack

| Tool                    | What it does                                     |
| ----------------------- | ------------------------------------------------ |
| React 18 + Vite         | UI framework + dev/build tooling                 |
| Leaflet + React-Leaflet | Interactive map rendering                        |
| Turf.js                 | Geospatial math (bearing, distance, destination) |
| Tailwind CSS v4         | Utility-first styling                            |
| Vercel                  | Deployment                                       |

---

## Project Structure

```
dead-reckoning-app/
├── src/
│   ├── App.jsx              ← global state + layout
│   ├── components/
│   │   ├── MapView.jsx      ← Leaflet map, polylines, markers
│   │   ├── StepForm.jsx     ← direction/distance input + validation
│   │   ├── StepList.jsx     ← scrollable step audit trail
│   │   ├── StatsPanel.jsx   ← drift % hero stat overlay
│   │   └── Controls.jsx     ← play, undo, export, presets
│   └── utils/
│       ├── deadReckoning.js ← bearingToLatLng, calcStats, buildCoords
│       ├── presets.js       ← UPLB, Rizal Park, Bataan routes
│       ├── colors.js        ← step color interpolation
│       └── export.js        ← GeoJSON download, screenshot guide
```

---

## The Presets

Three routes are built in, all set in the Philippines:

**UPLB Campus Walk** traces real landmarks around the University of the Philippines Los Baños campus: the main gate, Baker Hall, the College Chapel, Oblation Plaza, and Copeland Gym. The near-circular route produces high drift, illustrating how easily you stray from a straight-line displacement even on a familiar campus.

**Rizal Park Manila Loop** a loop around Rizal Park in Manila, from the Rizal Monument to the Quirino Grandstand, Agrifina Circle, and the National Museum. A landmark of Philippine national identity rendered as a dead reckoning problem.

**Bataan Death March Segment** eight kilometers northward from Mariveles, Bataan the historical starting point of the 1942 Bataan Death March. The near-straight route produces very low drift, which quietly makes the point: the soldiers knew exactly where they were going. They just had no choice about going there.

---

## The Drift Stat and Why It Matters

A lot of mapping apps will just draw your route. This one judges it.

The drift percentage is the single number that makes dead reckoning tangible. Walk in a perfect straight line: 0% drift. Walk in a square and return to start: 100% drift. Walk eight steps around the UPLB campus: 97.3% drift you walked over a kilometer but only moved 28 meters from where you started.

That number is what Austronesian navigators were fighting against on every voyage. Every imprecise bearing, every wave that pushed the canoe sideways, every moment of fatigue that made them estimate instead of measure it all accumulated into drift. The ones who made it to Hawaii and back were the ones who kept that number low across thousands of kilometers of open ocean.

This app just makes it visible.

---

## License

MIT. Build on it, learn from it, take it to sea.
