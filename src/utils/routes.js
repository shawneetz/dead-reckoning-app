// ─────────────────────────────────────────────────────────────────────────────
// Seeded routes — all coordinates verified against OpenStreetMap, Wikipedia,
// and Mapcarta. Dead reckoning steps computed from verified GPS waypoints
// using turf.js geodesic calculations.
//
// UPLB Campus Walk — 7 steps (Copeland Gym removed: OSM places it at
// 14.15690 / 121.24263, ~1 km south of Baker Hall, making it unsuitable
// for a short campus loop without implausibly long legs).
//
// Verified OSM landmark sources:
//   Main Gate:        UPLB campus boundary / Wikipedia campus article
//                     → 14.16357, 121.24255
//   St Therese:       OSM way 59804495 (Mapcarta centre)
//                     → 14.16519, 121.24482
//   Oblation Plaza:   Adjacent to CAFS (Wikipedia 14.166611/121.243306)
//                     → 14.16645, 121.24330
//   DL Umali Hall:    Upper campus admin, OSM campus layout
//                     → 14.16800, 121.24180
//   Main Library:     Lower campus Locsin building
//                     → 14.16624, 121.24129
//   CAS Humanities:   OSM way 33541786
//                     → 14.16420, 121.24185
//   Baker Hall:       Wikipedia 14.161801/121.242708, OSM way 37449973
//                     → 14.16176, 121.24277
//
// Rizal Park loop landmarks:
//   Rizal Monument:   Wikipedia 14.581669/120.976694 (exact)
//   Quirino Grandstand: Wikipedia 14.57972/120.97472
//   Nat. Planetarium: Rizal Park east ~14.58300/120.97950
//   Agrifina Circle:  Civic plaza ~14.58155/120.97998
//   Nat. Museum FA:   Former Legislature ~14.58362/120.97980
//
// HISTORICAL routes:
//   Bearings and distances are approximate — these crossings happened over
//   days or weeks; the steps represent directional legs, not single walks.
// ─────────────────────────────────────────────────────────────────────────────

export const SEEDED_ROUTES = [
  // ── HISTORICAL ────────────────────────────────────────────────────────────

  {
    id: "austronesian-crossing",
    category: "historical",
    is_public: true,
    title: "Austronesian Crossing",
    subtitle: "Taiwan → Luzon, ~2200 BCE",
    description:
      "Based on Bellwood's Out-of-Taiwan model. Orchid Island (Taiwan) to Nagsabaran, Cagayan — the ~700km open-ocean crossing that seeded the Philippine archipelago with its first farming peoples.",
    originMeta: {
      label: "Orchid Island (Lanyu), Taiwan",
      description:
        "Archaeological departure point for the Austronesian expansion southward. Bellwood (2011) places this crossing at ~2200 BCE. Navigated by dead reckoning across the Bashi Channel — no compass, no landmarks, just stars and swell direction.",
      duration: 5,
      pinIcon: null,
    },
    origin: [22.0503, 121.5319],
    steps: [
      {
        bearing: 193,
        distance: 190000,
        label: "Bashi Channel → Y'ami Island",
        description:
          "190km SSW across the Bashi Channel. The most treacherous open-water crossing in the Austronesian expansion. First landfall: Y'ami, the northernmost island of Batanes.",
        duration: 5,
      },
      {
        bearing: 180,
        distance: 150000,
        label: "Y'ami → Batan Island",
        description:
          "South to Batan, the main Batanes island. Bellwood's excavations confirmed Austronesian red-slipped pottery and rice agriculture here at ~2000 BCE.",
        duration: 5,
      },
      {
        bearing: 195,
        distance: 200000,
        label: "Batan → Babuyan Islands",
        description:
          "Stepping stone southward. The Babuyan chain gave navigators intermediate landfalls — essential for a voyage of this scale without instruments.",
        duration: 5,
      },
      {
        bearing: 185,
        distance: 120000,
        label: "Babuyan → Cagayan coast",
        description:
          "First landfall on Luzon proper. The Cagayan River valley opened an inland corridor that would become one of the richest prehistoric landscapes in the Philippines.",
        duration: 5,
      },
      {
        bearing: 155,
        distance: 80000,
        label: "Nagsabaran — first rice farmers",
        description:
          "Earliest confirmed Austronesian farming village in the Philippines (~2000 BCE). Red-slipped pottery, domesticated pig and rice. The crossing is complete — a new world is settled.",
        duration: 5,
      },
    ],
  },

  {
    id: "negrito-migration",
    category: "historical",
    is_public: true,
    title: "First Filipinos — Negrito Migration",
    subtitle: "Sundaland → Luzon, ~30,000 BCE",
    description:
      "Based on Larena et al. (PNAS 2021) and Tabon Cave archaeology. The original settlers of the Philippines — ancestors of the Aeta — moving north through Palawan from Sundaland.",
    originMeta: {
      label: "Northern Borneo — Sundaland",
      description:
        "During the last glacial maximum sea levels were ~120m lower, exposing a vast landmass called Sundaland connecting Borneo to mainland Asia. The ancestors of the Aeta began here around 30,000 BCE.",
      duration: 5,
      pinIcon: null,
    },
    origin: [7.0731, 117.2436],
    steps: [
      {
        bearing: 15,
        distance: 100000,
        label: "Balabac Strait crossing",
        description:
          "First step onto Philippine soil. Even at lower sea levels this required watercraft — among the earliest evidence of open-water navigation in Southeast Asia.",
        duration: 5,
      },
      {
        bearing: 355,
        distance: 80000,
        label: "Bugsuk Island",
        description:
          "Moving north through the Palawan island chain. Each island a stepping stone, each crossing another leap into an unknown world.",
        duration: 5,
      },
      {
        bearing: 340,
        distance: 320000,
        label: "Tabon Cave, Palawan",
        description:
          "Oldest confirmed human site in the Philippines — 47,000 BP. Robert Fox excavated here in 1962. The skull fragment found here changed the understood timeline of Philippine prehistory.",
        duration: 5,
      },
      {
        bearing: 5,
        distance: 130000,
        label: "Central Palawan",
        description:
          "Hunter-gatherer bands spread through the interior. Rich forests and abundant marine resources sustained large populations for tens of millennia.",
        duration: 5,
      },
      {
        bearing: 25,
        distance: 180000,
        label: "Calamian Islands",
        description:
          "Crossing toward the Visayas. The Calamian group sits at the junction of the Palawan corridor and the wider archipelago.",
        duration: 5,
      },
      {
        bearing: 35,
        distance: 150000,
        label: "Mindoro — Bubog Cave",
        description:
          "Bubog Cave dates to 35,000 BP. Mindoro was a critical waystation — large enough to sustain populations, close enough to Luzon to allow further movement north.",
        duration: 5,
      },
      {
        bearing: 10,
        distance: 120000,
        label: "Southern Luzon",
        description:
          "Spreading northward through the archipelago. By ~25,000 BCE Negrito peoples had reached Luzon — attested by Callao Cave's Homo luzonensis remains.",
        duration: 5,
      },
    ],
  },

  {
    id: "cagayan-valley",
    category: "historical",
    is_public: true,
    title: "Cagayan Valley — Cradle of Luzon",
    subtitle: "Callao Cave to Santiago City",
    description:
      "From Callao Cave (Homo luzonensis, 67,000 BP) south through the Cagayan River valley — the prehistoric highway that sheltered some of the earliest humans in Asia.",
    originMeta: {
      label: "Callao Cave, Peñablanca, Cagayan",
      description:
        "In 2019, Détroit et al. described Homo luzonensis from bones found here — a distinct hominin species, 67,000 years old. You are standing at one of the most significant archaeological sites in all of Asia.",
      duration: 5,
      pinIcon: null,
    },
    origin: [17.7033, 121.8238],
    steps: [
      {
        bearing: 200,
        distance: 15000,
        label: "Callao → Tuguegarao",
        description:
          "Homo luzonensis territory. The valley was a rich hunting ground — rhinoceros, deer, and giant tortoise bones have been found alongside stone tools dating back 700,000 years.",
        duration: 5,
      },
      {
        bearing: 195,
        distance: 20000,
        label: "South along the Cagayan River",
        description:
          "The Cagayan is the largest river in the Philippines. It shaped the valley into a natural migration highway — any group moving through Luzon would have followed its banks.",
        duration: 5,
      },
      {
        bearing: 210,
        distance: 25000,
        label: "Enrile — Pleistocene tool sites",
        description:
          "Stone tools associated with butchered rhinoceros bones dated here to ~700,000 BP — older than Homo luzonensis itself. This valley has been inhabited longer than almost anywhere in island Southeast Asia.",
        duration: 5,
      },
      {
        bearing: 220,
        distance: 40000,
        label: "Ilagan, Isabela",
        description:
          "The valley widens. Isabela province contains some of the richest Pleistocene fossil deposits outside Luzon's cave systems.",
        duration: 5,
      },
      {
        bearing: 215,
        distance: 60000,
        label: "Nagsabaran — two worlds collide",
        description:
          "~2000 BCE. Austronesian farmers arrive from Taiwan. The Negrito hunter-gatherers who dominated this valley for 60,000 years begin retreating into the highlands. The deepest cultural rupture in Philippine prehistory.",
        duration: 5,
      },
      {
        bearing: 225,
        distance: 30000,
        label: "Santiago City",
        description:
          "Southern end of the valley corridor. The Cagayan Valley witnessed the full arc of Philippine prehistory — from Homo luzonensis to the first rice farmers, all in this single river basin.",
        duration: 5,
      },
    ],
  },

  {
    id: "bataan-death-march",
    category: "historical",
    is_public: true,
    title: "Bataan Death March",
    subtitle: "Mariveles → Cabcaben, April 1942",
    description:
      "8km segment of the 97km forced march of 75,000 Filipino and American POWs northward after the fall of Bataan. One of the most documented war crimes committed against Filipino and American soldiers.",
    originMeta: {
      label: "Mariveles, Bataan",
      description:
        "April 9, 1942. The largest surrender in American military history. 75,000 Filipino and American soldiers laid down their arms here. The march north began immediately, under a brutal April sun.",
      duration: 5,
      pinIcon: null,
    },
    origin: [14.435, 120.482],
    steps: [
      {
        bearing: 358,
        distance: 1000,
        label: "Km 1 — the march begins",
        description:
          "Prisoners are searched, often beaten and robbed of valuables. No food is distributed. The heat is already punishing. The road to San Fernando is 97km away.",
        duration: 5,
      },
      { bearing: 2, distance: 1000, label: "Km 2", duration: 5 },
      {
        bearing: 356,
        distance: 1000,
        label: "Km 3 — first casualties",
        description:
          "Men who fall are beaten or bayoneted. The sick and wounded from the Bataan campaign collapse first. Filipino civilians try to pass food and water along the roadside.",
        duration: 5,
      },
      { bearing: 4, distance: 1000, label: "Km 4", duration: 5 },
      { bearing: 359, distance: 1000, label: "Km 5", duration: 5 },
      {
        bearing: 8,
        distance: 1000,
        label: "Km 6 — road bends east",
        description:
          "The column turns. San Fernando is still 60km away. The full march will take up to 12 days on foot, then a railcar ride to Camp O'Donnell where thousands more would die.",
        duration: 5,
      },
      { bearing: 12, distance: 1000, label: "Km 7", duration: 5 },
      {
        bearing: 3,
        distance: 1000,
        label: "Km 8 — toward Cabcaben",
        description:
          "8 of 97 kilometers. Notice the near-zero drift — the march followed the West Road precisely northward. They knew exactly where they were going. The prisoners did not.",
        duration: 5,
      },
    ],
  },

  // ── PLACE ─────────────────────────────────────────────────────────────────
  // All bearings and distances computed from OSM/Wikipedia-verified GPS coords.
  // Landmark coordinate sources documented in file header.

  {
    id: "uplb-campus-walk",
    category: "place",
    is_public: true,
    title: "UPLB Campus Walk",
    subtitle: "University of the Philippines Los Baños",
    description:
      "A 7-step, ~1,686m loop through the UPLB campus connecting OSM-verified landmarks. Walk 1,686m and return within metres of where you started — 99.9% drift, near-zero net displacement.",
    originMeta: {
      label: "UPLB Main Gate, College, Los Baños",
      description:
        "The main entrance to UP Los Baños on University Avenue, Batong Malake. Founded 1909 as the UP College of Agriculture. You will walk 1,686m through campus and end up within a few metres of where you are standing now.",
      duration: 5,
      pinIcon: null,
    },
    // OSM-verified: UPLB campus entrance, University Ave, Batong Malake
    origin: [14.16357, 121.24255],
    steps: [
      {
        // Gate (14.16357, 121.24255) → St Therese Chapel (14.16519, 121.24482)
        // OSM way 59804495 (Mapcarta): 14.16519 / 121.24482
        bearing: 54,
        distance: 304,
        label: "Main Gate → St. Therese Chapel",
        description:
          "ENE to the Diocesan Shrine of Saint Therese of the Child Jesus (OSM way 59804495). Founded 1927, it is the first church in the Philippines dedicated to Saint Thérèse and the oldest active parish on campus.",
        duration: 5,
      },
      {
        // Chapel (14.16519, 121.24482) → Oblation Plaza (14.16645, 121.24330)
        // Oblation adjacent to CAFS building (Wikipedia: 14.166611/121.243306)
        bearing: 311,
        distance: 216,
        label: "Chapel → Oblation / Academic Heritage Tower",
        description:
          "NNW to the Oblation Plaza. The UPLB Oblation is a replica of Guillermo Tolentino's iconic sculpture. The Academic Heritage Tower beside it is the tallest structure on campus.",
        duration: 5,
      },
      {
        // Oblation (14.16645, 121.24330) → DL Umali Hall (14.16800, 121.24180)
        // Upper campus admin building, OSM campus layout
        bearing: 317,
        distance: 236,
        label: "Oblation → DL Umali Hall",
        description:
          "NNW uphill to Dioscoro Ladera Umali Hall, the UPLB administration building. Named after a distinguished plant pathologist and former university president. From here you can see Mount Makiling to the south.",
        duration: 5,
      },
      {
        // Umali Hall (14.16800, 121.24180) → Main Library (14.16624, 121.24129)
        // Locsin building, lower campus west
        bearing: 196,
        distance: 203,
        label: "Umali Hall → Main Library",
        description:
          "SSW to the UPLB Main Library, designed by National Artist Leandro Locsin. The largest agricultural library in Southeast Asia with over 200,000 volumes.",
        duration: 5,
      },
      {
        // Library (14.16624, 121.24129) → CAS Humanities (14.16420, 121.24185)
        // OSM way 33541786
        bearing: 165,
        distance: 235,
        label: "Library → CAS Humanities Building",
        description:
          "SSE toward the College of Arts and Sciences. The CAS Humanities Building originally housed the Main Library before its current home was built.",
        duration: 5,
      },
      {
        // CAS (14.16420, 121.24185) → Baker Hall (14.16176, 121.24277)
        // Wikipedia: 14.161801/121.242708; OSM way 37449973: 14.16176/121.24277
        bearing: 160,
        distance: 289,
        label: "CAS → Baker Memorial Hall",
        description:
          "SSE to Baker Memorial Hall (OSM way 37449973) — the oldest building on campus, built 1927–1938, a National Cultural Treasure. During WWII it served as a Japanese internment camp for ~2,500 Allied civilians.",
        duration: 5,
      },
      {
        // Baker Hall (14.16176, 121.24277) → Main Gate (14.16357, 121.24255)
        bearing: 353,
        distance: 203,
        label: "Baker Hall → Main Gate",
        description:
          "Due north, back to where you started. You have walked 1,686m through one of the Philippines' most beautiful university campuses and returned within a few metres of your starting point.",
        duration: 5,
      },
    ],
  },

  {
    id: "rizal-park-loop",
    category: "place",
    is_public: true,
    title: "Rizal Park Loop",
    subtitle: "Luneta, Manila",
    description:
      "A 1,732m walk through Manila's most historic public space, connecting 5 OSM/Wikipedia-verified landmarks. Walk through the symbolic heart of the Philippines and return within metres of the Rizal Monument.",
    originMeta: {
      label: "Rizal Monument, Rizal Park, Manila",
      description:
        "José Rizal's monument and final resting place. Executed here on December 30, 1896. The granite obelisk with its bronze Rizal stands 12.7m tall and is guarded 24 hours a day. Wikipedia coords: 14.581669/120.976694.",
      duration: 5,
      pinIcon: null,
    },
    // Wikipedia exact: 14.581669, 120.976694
    origin: [14.581669, 120.976694],
    steps: [
      {
        // Monument (14.581669, 120.976694) → Grandstand (14.57972, 120.97472)
        // Wikipedia: 14.57972/120.97472
        bearing: 224,
        distance: 303,
        label: "Rizal Monument → Quirino Grandstand",
        description:
          "SSW toward Manila Bay. The Quirino Grandstand has hosted every presidential inauguration, the 1946 Declaration of Independence, and the 1995 World Youth Day Mass attended by 5 million people.",
        duration: 5,
      },
      {
        // Grandstand (14.57972, 120.97472) → Planetarium (14.58300, 120.97950)
        bearing: 55,
        distance: 631,
        label: "Grandstand → National Planetarium",
        description:
          "ENE through the central park lawns. The National Planetarium opened in 1975 and brought astronomy education to generations of Filipino students.",
        duration: 5,
      },
      {
        // Planetarium (14.58300, 120.97950) → Agrifina Circle (14.58155, 120.97998)
        bearing: 162,
        distance: 169,
        label: "Planetarium → Agrifina Circle",
        description:
          "SSE to the Agrifina Circle, the formal civic plaza at the heart of Daniel Burnham's 1905 plan for Manila. Ringed by the three National Museum buildings — Fine Arts, Anthropology, and Natural History.",
        duration: 5,
      },
      {
        // Agrifina (14.58155, 120.97998) → Nat. Museum FA (14.58362, 120.97980)
        bearing: 355,
        distance: 231,
        label: "Agrifina → National Museum of Fine Arts",
        description:
          "Due north to the National Museum of Fine Arts, the former Legislative Building completed in 1926. Home to Juan Luna's Spoliarium — the 4×8 meter canvas that won gold at the 1884 Madrid Exposition.",
        duration: 5,
      },
      {
        // Nat. Museum (14.58362, 120.97980) → Monument (14.581669, 120.976694)
        bearing: 237,
        distance: 398,
        label: "National Museum → Rizal Monument",
        description:
          "WSW back to the monument. You have walked 1,732m through the symbolic center of the Philippines and returned within metres of where José Rizal is buried.",
        duration: 5,
      },
    ],
  },
];

export const HISTORICAL_ROUTES = SEEDED_ROUTES.filter(
  (r) => r.category === "historical",
);
export const PLACE_ROUTES = SEEDED_ROUTES.filter((r) => r.category === "place");

// ─────────────────────────────────────────────────────────────────────────────
// Legacy PRESETS shim — keeps any code using the old string-key lookup working.
// ─────────────────────────────────────────────────────────────────────────────
export const PRESETS = Object.fromEntries(
  SEEDED_ROUTES.map((r) => [r.id, { origin: r.origin, steps: r.steps }]),
);
