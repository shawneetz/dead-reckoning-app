export const PRESETS = {
  "UPLB Campus Walk": {
    origin: [14.1673, 121.2414],
    steps: [
      { bearing: 90, distance: 200, label: "East along oval" },
      { bearing: 180, distance: 150, label: "South to engineering" },
      { bearing: 270, distance: 200, label: "West back across" },
      { bearing: 0, distance: 150, label: "North to start" },
      { bearing: 45, distance: 100, label: "NE toward library" },
      { bearing: 135, distance: 100, label: "SE to cafeteria" },
      { bearing: 225, distance: 80, label: "SW shortcut" },
      { bearing: 315, distance: 80, label: "NW back to oval" },
    ],
  },
  "Rizal Park Manila Loop": {
    origin: [14.5831, 120.9794],
    steps: [
      { bearing: 90, distance: 300, label: "East along Roxas" },
      { bearing: 135, distance: 200, label: "SE corner" },
      { bearing: 180, distance: 250, label: "South end of park" },
      { bearing: 270, distance: 300, label: "West back" },
      { bearing: 0, distance: 250, label: "North to monument" },
      { bearing: 45, distance: 120, label: "NE to fountain" },
    ],
  },
  "Bataan Death March Segment": {
    origin: [14.6591, 120.4818],
    steps: [
      { bearing: 355, distance: 1000, label: "Km 1 — northward" },
      { bearing: 10, distance: 1000, label: "Km 2 — slight turn" },
      { bearing: 358, distance: 1000, label: "Km 3" },
      { bearing: 5, distance: 1000, label: "Km 4" },
      { bearing: 350, distance: 1000, label: "Km 5 — fatigue drift" },
      { bearing: 15, distance: 1000, label: "Km 6 — route correction" },
    ],
  },
};
