// Built-in seeded routes — treated as real routes in the system.
// historical: Philippine prehistory & history (public, citable)
// place: walkable public locations (public)

export const SEEDED_ROUTES = [
  // ── HISTORICAL ──────────────────────────────────────────────────
  {
    id: "austronesian-crossing",
    category: "historical",
    is_public: true,
    title: "Austronesian Crossing",
    subtitle: "Taiwan → Luzon, ~2200 BCE",
    description:
      "Based on Bellwood's Out-of-Taiwan model. Orchid Island (Taiwan) to Nagsabaran, Cagayan — the ~700km open-ocean crossing that seeded the Philippine archipelago with its first farming peoples.",
    originMeta: {
      label: "Orchid Island, Taiwan",
      description:
        "Archaeological departure point for the Austronesian expansion into the Philippines. Bellwood (2011) places the crossing at ~2200 BCE, navigated by dead reckoning across the Bashi Channel.",
      duration: 0,
      pinIcon: null,
    },
    origin: [22.0503, 121.5319],
    steps: [
      {
        bearing: 193,
        distance: 190000,
        label: "Bashi Channel → Y'ami Island",
        description:
          "190km SSW across the Bashi Channel. The most treacherous crossing — open Pacific, no landmarks. First Philippine landfall at Y'ami, northernmost Batanes.",
      },
      {
        bearing: 180,
        distance: 150000,
        label: "Batanes → Batan Island",
        description:
          "South to Batan, the main Batanes island. Bellwood's excavations here confirmed Austronesian pottery and rice agriculture at ~2000 BCE.",
      },
      {
        bearing: 195,
        distance: 200000,
        label: "Babuyan Islands",
        description:
          "Stepping stone southward. The Babuyan chain gave navigators intermediate landfalls — critical for a crossing of this scale without instruments.",
      },
      {
        bearing: 185,
        distance: 120000,
        label: "Northern Luzon — Cagayan Valley",
        description:
          "First landfall on Luzon's northern coast. The Cagayan River valley opened an inland corridor southward.",
      },
      {
        bearing: 155,
        distance: 80000,
        label: "Nagsabaran — first rice farmers",
        description:
          "Earliest confirmed Austronesian farming village in the Philippines (~2000 BCE). Red-slipped pottery, domesticated pig and rice. The crossing is complete.",
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
      "Based on Larena et al. (PNAS 2021) genomic study and Tabon Cave archaeology. The original settlers of the Philippines — ancestors of the Aeta — moving north from Sundaland through Palawan.",
    originMeta: {
      label: "Northern Borneo — Sundaland",
      description:
        "During glacial maximum sea levels were ~120m lower. Sundaland connected Borneo to mainland Asia. The ancestors of the Aeta began here, ~30,000 BCE.",
      duration: 0,
      pinIcon: null,
    },
    origin: [7.0731, 117.2436],
    steps: [
      {
        bearing: 15,
        distance: 100000,
        label: "Balabac Strait crossing",
        description:
          "First step onto Philippine soil. Even at lower sea levels this crossing required watercraft — the earliest evidence of open-water navigation in Southeast Asia.",
      },
      {
        bearing: 355,
        distance: 80000,
        label: "Bugsuk Island",
        description:
          "Moving north through the Palawan island chain. Each island a stepping stone, each crossing a leap into the unknown.",
      },
      {
        bearing: 340,
        distance: 320000,
        label: "Tabon Cave, Palawan",
        description:
          "Oldest confirmed human site in the Philippines — 47,000 BP. Robert Fox excavated here in 1962. The skull fragment found here changed everything.",
      },
      {
        bearing: 5,
        distance: 130000,
        label: "Central Palawan",
        description:
          "Hunter-gatherer bands spread through the interior. Rich forest, abundant marine resources — Palawan sustained large populations for millennia.",
      },
      {
        bearing: 25,
        distance: 180000,
        label: "Calamian Islands",
        description:
          "Crossing toward the Visayas. The Calamian group sits at the junction of the Palawan corridor and the wider archipelago.",
      },
      {
        bearing: 35,
        distance: 150000,
        label: "Mindoro — Bubog Cave",
        description:
          "Bubog Cave site dates to 35,000 BP. Mindoro was an important waystation — large enough to sustain populations, close enough to Luzon to allow further movement.",
      },
      {
        bearing: 10,
        distance: 120000,
        label: "Southern Luzon",
        description:
          "Spreading northward through the archipelago. By ~25,000 BCE, Negrito peoples had settled Luzon — evidenced by Callao Cave's Homo luzonensis remains.",
      },
    ],
  },

  {
    id: "cagayan-valley",
    category: "historical",
    is_public: true,
    title: "Cagayan Valley — Cradle of Luzon",
    subtitle: "Callao Cave → Santiago City",
    description:
      "The Cagayan River valley corridor: from Callao Cave (67,000 BP, Homo luzonensis) south through the valley that sheltered some of the earliest humans in Asia.",
    originMeta: {
      label: "Callao Cave, Peñablanca",
      description:
        "In 2019, Détroit et al. described Homo luzonensis from bones found here — a distinct hominin species that lived 67,000 years ago. You are standing at one of the most important archaeological sites in Asia.",
      duration: 0,
      pinIcon: null,
    },
    origin: [17.7033, 121.8238],
    steps: [
      {
        bearing: 200,
        distance: 15000,
        label: "Callao → Tuguegarao",
        description:
          "Homo luzonensis territory. The Cagayan Valley was a rich hunting ground — rhinoceros, deer, and giant tortoise bones have been found alongside stone tools.",
      },
      {
        bearing: 195,
        distance: 20000,
        label: "Cagayan River south",
        description:
          "Following the river corridor. The Cagayan is the largest river in the Philippines — it shaped the valley into a natural migration highway.",
      },
      {
        bearing: 210,
        distance: 25000,
        label: "Enrile — stone tool sites",
        description:
          "Pleistocene stone tools found in Enrile and nearby sites, some associated with butchered rhinoceros bones dated to ~700,000 BP — older than Homo luzonensis.",
      },
      {
        bearing: 220,
        distance: 40000,
        label: "Ilagan, Isabela",
        description:
          "The valley widens. Isabela province has some of the richest Pleistocene fossil deposits outside Luzon's cave systems.",
      },
      {
        bearing: 215,
        distance: 60000,
        label: "Nagsabaran region",
        description:
          "~2000 BCE — Austronesian farmers arrive. The Negrito hunter-gatherers who dominated the valley for 60,000 years retreat inland. Two worlds collide here.",
      },
      {
        bearing: 225,
        distance: 30000,
        label: "Santiago City",
        description:
          "Southern end of the valley corridor. By this point the Cagayan Valley had witnessed the full span of Philippine prehistory — from Homo luzonensis to the first rice farmers.",
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
      "8km segment of the 97km forced march of 75,000 Filipino and American prisoners of war from Mariveles northward after the fall of Bataan. One of the most documented atrocities of World War II in Asia.",
    originMeta: {
      label: "Mariveles, Bataan",
      description:
        "April 9, 1942. The largest surrender in American military history. 75,000 Filipino and American soldiers began the march here under Japanese guard. Many would not survive.",
      duration: 0,
      pinIcon: null,
    },
    origin: [14.435, 120.482],
    steps: [
      {
        bearing: 358,
        distance: 1000,
        label: "Km 1 — Mariveles northward",
        description:
          "The march begins. Prisoners are searched, often beaten. The April heat is already intense.",
      },
      { bearing: 2, distance: 1000, label: "Km 2" },
      {
        bearing: 356,
        distance: 1000,
        label: "Km 3 — fatigue sets in",
        description:
          "No food, little water. Men who fall are beaten or bayoneted. The road is lined with the dead.",
      },
      { bearing: 4, distance: 1000, label: "Km 4" },
      { bearing: 359, distance: 1000, label: "Km 5" },
      {
        bearing: 8,
        distance: 1000,
        label: "Km 6 — road bends east",
        description:
          "The column turns. San Fernando is still 60km away. The full march will take up to 12 days.",
      },
      { bearing: 12, distance: 1000, label: "Km 7" },
      {
        bearing: 3,
        distance: 1000,
        label: "Km 8 — toward Cabcaben",
        description:
          "8km of 97. The near-zero drift shows how disciplined the route was — they knew exactly where they were going.",
      },
    ],
  },

  // ── PLACE ───────────────────────────────────────────────────────
  {
    id: "uplb-campus-walk",
    category: "place",
    is_public: true,
    title: "UPLB Campus Walk",
    subtitle: "University of the Philippines Los Baños",
    description:
      "A loop around the UP Los Baños campus. 8 steps, ~1.15km walked, ~28m displaced — 97.3% drift. A reminder that even a careful campus walk accumulates almost no net progress.",
    originMeta: {
      label: "UPLB Main Gate",
      description:
        "University of the Philippines Los Baños. Start here and walk 1.1km — you'll end up just 28 meters from where you started.",
      duration: 0,
      pinIcon: null,
    },
    origin: [14.1667, 121.2435],
    steps: [
      { bearing: 310, distance: 180, label: "Main Gate → Baker Hall" },
      { bearing: 265, distance: 120, label: "Baker Hall → College Chapel" },
      { bearing: 230, distance: 150, label: "Chapel → Oblation Plaza" },
      { bearing: 320, distance: 130, label: "Oblation → DL Umali Hall" },
      { bearing: 275, distance: 100, label: "Umali → Library" },
      { bearing: 185, distance: 160, label: "Library → CAS" },
      { bearing: 95, distance: 140, label: "CAS → Copeland Gym" },
      { bearing: 135, distance: 170, label: "Gym → Main Gate" },
    ],
  },

  {
    id: "rizal-park-loop",
    category: "place",
    is_public: true,
    title: "Rizal Park Loop",
    subtitle: "Luneta, Manila",
    description:
      "A loop around Rizal Park — Manila's most visited public space. 5 steps around the monument to the Philippines' national hero.",
    originMeta: {
      label: "Rizal Monument",
      description:
        "José Rizal's monument and final resting place. Executed here on December 30, 1896. The park that bears his name is the symbolic heart of the Philippines.",
      duration: 0,
      pinIcon: null,
    },
    origin: [14.5824, 120.9794],
    steps: [
      { bearing: 225, distance: 280, label: "Rizal Monument → Grandstand" },
      { bearing: 90, distance: 320, label: "Grandstand → Agrifina Circle" },
      { bearing: 350, distance: 200, label: "Agrifina → National Museum" },
      { bearing: 45, distance: 250, label: "Nat. Museum → Liwasang" },
      { bearing: 195, distance: 310, label: "Liwasang → Rizal Monument" },
    ],
  },
];

export const HISTORICAL_ROUTES = SEEDED_ROUTES.filter(
  (r) => r.category === "historical",
);
export const PLACE_ROUTES = SEEDED_ROUTES.filter((r) => r.category === "place");
