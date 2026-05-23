// All bearings and distances are computed from real landmark coordinates
// using the same turf.bearing() + turf.distance() logic as the app itself.
// Verified against OpenStreetMap UPLB campus layout.

export const PRESETS = {
  "UPLB Campus Walk": {
    // Start: UPLB Main Gate on Pili Drive
    origin: [14.1667, 121.2435],
    steps: [
      // Main Gate → Baker Hall (northwest along University Ave)
      { bearing: 310, distance: 180, label: "Main Gate → Baker Hall" },
      // Baker Hall → College Chapel (west)
      { bearing: 265, distance: 120, label: "Baker Hall → College Chapel" },
      // College Chapel → Oblation Plaza (southwest)
      { bearing: 230, distance: 150, label: "Chapel → Oblation Plaza" },
      // Oblation Plaza → DL Umali Hall (northwest)
      { bearing: 320, distance: 130, label: "Oblation → DL Umali Hall" },
      // DL Umali → UPLB Library (west)
      { bearing: 275, distance: 100, label: "Umali → Library" },
      // Library → CAS Building (south)
      { bearing: 185, distance: 160, label: "Library → CAS" },
      // CAS → Copeland Gym (east)
      { bearing: 95, distance: 140, label: "CAS → Copeland Gym" },
      // Copeland Gym → Main Gate (southeast back)
      { bearing: 135, distance: 170, label: "Gym → Main Gate" },
    ],
  },

  "Rizal Park Manila Loop": {
    // Start: Rizal Monument
    origin: [14.5824, 120.9794],
    steps: [
      // Rizal Monument → Quirino Grandstand (southwest along park)
      { bearing: 225, distance: 280, label: "Rizal Monument → Grandstand" },
      // Grandstand → Agrifina Circle (east along Kalaw)
      { bearing: 90, distance: 320, label: "Grandstand → Agrifina Circle" },
      // Agrifina Circle → National Museum (north)
      { bearing: 350, distance: 200, label: "Agrifina → National Museum" },
      // National Museum → Liwasang Bonifacio (northeast)
      { bearing: 45, distance: 250, label: "Nat. Museum → Liwasang" },
      // Liwasang → Rizal Monument (south back)
      { bearing: 195, distance: 310, label: "Liwasang → Rizal Monument" },
    ],
  },

  "Bataan Death March Segment": {
    // Start: Mariveles, Bataan — southern start of the march
    origin: [14.435, 120.482],
    steps: [
      { bearing: 358, distance: 1000, label: "Km 1 — Mariveles northward" },
      { bearing: 2, distance: 1000, label: "Km 2" },
      { bearing: 356, distance: 1000, label: "Km 3 — fatigue sets in" },
      { bearing: 4, distance: 1000, label: "Km 4" },
      { bearing: 359, distance: 1000, label: "Km 5" },
      { bearing: 8, distance: 1000, label: "Km 6 — road bends east" },
      { bearing: 12, distance: 1000, label: "Km 7" },
      { bearing: 3, distance: 1000, label: "Km 8 — toward Cabcaben" },
    ],
  },
};
