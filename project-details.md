# Dead Reckoning App - Project Documentation

**Project Name:** Balangay  
**Version:** 1.0  
**Type:** Full-Stack Web Application  
**Description:** Interactive web app for creating, visualizing, and sharing dead reckoning routes (navigation using bearing and distance)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Frontend Documentation](#frontend-documentation)
5. [Backend Documentation](#backend-documentation)
6. [App Flow & User Journeys](#app-flow--user-journeys)
7. [Database Schema](#database-schema)
8. [API Endpoints Summary](#api-endpoints-summary)

---

## Project Overview

Balangay is a full-stack application that allows users to:

- Create routes using dead reckoning navigation (bearing + distance)
- Visualize routes on interactive Leaflet maps
- Playback routes with step-by-step navigation and timers
- Save and share routes publicly or privately
- Fork existing public routes
- Upload custom pin icons and route images
- Browse historical and place-based seeded routes

**Core Feature:** Dead reckoning math using Turf.js for geodesic calculations (bearing + distance → lat/lng coordinates)

---

## Technology Stack

| Layer              | Technology                                                           |
| ------------------ | -------------------------------------------------------------------- |
| **Frontend**       | React 19, Vite, React Router v6, Leaflet/React-Leaflet, Tailwind CSS |
| **Backend**        | FastAPI (Python), Uvicorn                                            |
| **Authentication** | Supabase Auth (Email/Password, OAuth: Google, GitHub)                |
| **Database**       | Supabase PostgreSQL (Auth + Storage + Database)                      |
| **Storage**        | Supabase Storage (Images, Pin Icons)                                 |
| **Deployment**     | Vercel (Frontend), Render (Backend), Supabase (Backend Services)     |
| **Maps**           | OpenStreetMap tiles, Leaflet JS library                              |

---

## Folder Structure

```
dead-reckoning-app/
├── frontend (React/Vite)
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Router & main layout
│   │   ├── App.css                # Global styles
│   │   ├── index.css              # Base styles
│   │   ├── assets/                # Static images/files
│   │   ├── components/            # Reusable React components
│   │   ├── context/               # React Context (Auth state)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # API clients & utilities
│   │   ├── pages/                 # Page components
│   │   └── utils/                 # Helper functions
│   ├── index.html                 # HTML entry
│   ├── package.json               # Dependencies
│   ├── vite.config.js             # Vite config
│   └── tailwind.config.js         # Tailwind config
│
├── backend (FastAPI/Python)
│   ├── main.py                    # FastAPI app initialization
│   ├── render.yaml                # Render deployment config
│   ├── requirements.txt           # Python dependencies
│   ├── runtime.txt                # Python version for Render
│   └── app/
│       ├── __init__.py
│       ├── config.py              # Environment settings
│       ├── dependencies.py        # JWT auth utilities
│       ├── models.py              # Pydantic schemas
│       ├── supabase_client.py     # Supabase client
│       ├── routers/               # API endpoints
│       │   ├── routes.py          # /api/routes endpoints
│       │   ├── steps.py           # /api/routes/{id}/steps endpoints
│       │   ├── uploads.py         # /api/upload endpoints
│       │   └── profiles.py        # /api/profiles endpoints
│       └── services/
│           ├── __init__.py
│           ├── supabase_client.py # Supabase admin client
│           └── image_service.py   # Image processing
│
├── config files
│   ├── eslint.config.js
│   ├── postcss.config.js
│   ├── vercel.json
│   └── .env (not in repo)
│
└── README.md
```

---

# FRONTEND DOCUMENTATION

## Entry Point Files

### `main.jsx`

**Purpose:** Initialize React application, set up Leaflet icons, and wrap app with required providers

**Key Functions:**

- **Leaflet icon setup** - Fixes missing marker images by setting default icon URLs from CDN
- **App mounting** - Renders React app to DOM with providers

**Providers Initialized:**

- `BrowserRouter` - React Router for client-side navigation
- `AuthProvider` - Global authentication state context
- `StrictMode` - Development mode warnings

**Imported By:** `index.html` (Vite entry)

**Response:** Returns rendered React DOM tree

---

### `App.jsx`

**Purpose:** Main router configuration and OAuth redirect handling

**Key Functions:**

1. **`OAuthRedirectHandler()`** - Detects and cleans OAuth flow
   - Checks for hash token in URL from Supabase OAuth redirect
   - Cleans URL by removing hash
   - Returns null component
   - Used before route resolution

2. **Route Configuration** - Defines all application routes:

   ```
   / → LandingPage (home)
   /auth → AuthPage (login/signup)
   /auth/callback → AuthCallback (OAuth handler)
   /app → MapApp (editor, not logged in redirects to /auth)
   /app/:routeId → MapApp (edit existing route)
   /gallery → Gallery (browse public routes)
   /r/:routeId → RoutePage (view-only route sharing)
   /u/:username → ProfilePage (user public profile)
   ```

3. **`useAuth()` hook integration** - Checks authentication state
   - Redirects unauthorized users to `/auth`
   - Shows loading screen while fetching session

**State Managed:**

- User authentication status
- Current route display
- Loading indicators

**Used By:** Index of entire app

---

## Context

### `context/AuthContext.jsx`

**Purpose:** Centralized authentication state management using Supabase Auth

**State Variables:**

- `user` - Current Supabase user object (null if logged out)
- `session` - Active authentication session token
- `loading` - Boolean indicating session fetch in progress
- `error` - Auth error message if any

**Key Functions:**

1. **`signInWithGoogle()`**
   - Initiates Google OAuth login flow
   - Response: Redirects to Google, then to `/auth/callback`
   - State: Sets `user` and `session` on success

2. **`signInWithGitHub()`**
   - Initiates GitHub OAuth login flow
   - Response: Same as Google
   - State: Sets `user` and `session` on success

3. **`signInWithEmail(email, password)`**
   - Email/password authentication
   - Input: User email and password
   - Response: Auth session token
   - State: Sets `user` and `session`
   - Error: Throws error if credentials invalid

4. **`signUpWithEmail(email, password)`**
   - Create new user account
   - Input: Email and password
   - Response: Confirms account creation
   - State: Sets `user` and `session`
   - Error: Throws error if email exists

5. **`signOut()`**
   - Logout current user
   - Response: Clears session
   - State: Resets `user`, `session` to null

**Effects:**

- **On Mount:** Fetches initial session, sets `loading = true` then `false`
- **Auth Listener:** Subscribes to Supabase auth state changes (login, logout, token refresh)
- **On Unmount:** Cleans up subscription

**Used By:**

- All components via `useAuth()` hook
- AuthPage (for login/signup)
- MapApp (for permission checks)
- RoutePage (for fork functionality)

---

## Hooks

### `hooks/useRouteSync.js`

**Purpose:** Handle route persistence with backend, save/load/delete operations

**State Variables:**

- `savedRoute` - Currently saved route object (includes id, metadata, stats)
- `saving` - Boolean loading state during API operations
- `saveError` - Error message from failed save/update
- `routeCount` - Number of routes user has created
- `atRouteLimit` - Boolean (true if user at 10-route limit and creating new)

**Key Functions:**

1. **`saveRoute(title, description, isPublic)`**
   - Create new route or update existing
   - Input: Route metadata
   - Process:
     - If `savedRoute` exists: `PUT /api/routes/{id}` (update)
     - If new route: `POST /api/routes/` (create with origin + steps)
   - Response: Updated `savedRoute` object
   - State: Sets `saving = true/false`, `saveError` on failure
   - Validation: Enforces 10-route limit per user

2. **`loadRoute(routeId)`**
   - Fetch route and all steps from backend
   - Input: Route ID (UUID)
   - Process:
     - GET `/api/routes/{routeId}` (metadata)
     - GET `/api/routes/{routeId}/steps` (steps array)
   - Response: Returns route object + steps
   - State: Sets `savedRoute`, `saving`
   - Error: Throws error if route not found or not owner

3. **`togglePublic(routeId, isPublic)`**
   - Toggle route visibility
   - Input: Route ID, boolean public flag
   - Process: `PUT /api/routes/{routeId}` with is_public
   - Response: Updated route object
   - State: Updates `savedRoute`

4. **`deleteRoute(routeId)`**
   - Permanently delete route
   - Input: Route ID
   - Process: `DELETE /api/routes/{routeId}`
   - Response: Returns 204 (no content)
   - State: Clears `savedRoute`, decrements `routeCount`

5. **`clearSavedRoute()`**
   - Reset saved state
   - Used when starting new route
   - State: Sets `savedRoute = null`

**Effects:**

- **On User Login:** Auto-fetches `routeCount` via `GET /api/routes/mine`

**Used By:**

- MapApp (main editor - saves/loads routes)
- SaveRouteModal (triggers save)
- Controls (for browse routes)

---

## Utilities

### `utils/deadReckoning.js`

**Purpose:** Core dead reckoning mathematical calculations using Turf.js

**Key Functions:**

1. **`parseBearing(input)`**
   - Convert bearing input to degrees (0-360)
   - Input: String or number
     - Numbers: "90" → 90°
     - Cardinals: "N" → 0°, "NE" → 45°, "E" → 90°, "SE" → 135°, "S" → 180°, "SW" → 225°, "W" → 270°, "NW" → 315°
     - Abbrev: "N" → 0°, etc.
   - Response: Number 0-360
   - Error: Throws if invalid bearing

2. **`bearingToLatLng([lat, lng], bearingDeg, distMeters)`**
   - Calculate endpoint from origin + bearing + distance
   - Input: [lat, lng] array, bearing degrees, distance in meters
   - Process: Uses Turf.js `destination()` function (geodesic calculation)
   - Response: [lat, lng] array of destination
   - Used By: Building route paths step-by-step

3. **`buildCoords(steps, origin)`**
   - Build complete path coordinates from array of steps
   - Input: Steps array, origin [lat, lng]
   - Process: Iterates through steps, calculates each endpoint using `bearingToLatLng()`
   - Response: Array of [lat, lng] coordinates (full path)
   - Used By: MapView for drawing polyline

4. **`calcStats(steps, origin)`**
   - Calculate route statistics
   - Input: Steps array, origin point
   - Response: Object with:
     - `totalWalked` - Sum of all step distances (meters)
     - `displacement` - Great-circle distance origin → final point (meters)
     - `driftPct` - (totalWalked - displacement) / totalWalked × 100
       - Green if <10%, amber if 10-40%, red if >40%
     - `bearing` - Final bearing from origin to endpoint (degrees)
   - Used By: StatsPanel (display stats), backend (save with route)

**Math Library:** Turf.js (npm package)

- Uses geodesic (great-circle) calculations
- Accounts for Earth's curvature

**Used By:**

- MapApp (calculate endpoint for new steps)
- StatsPanel (display statistics)
- Backend (store pre-calculated stats)

---

### `utils/colors.js`

**Purpose:** Generate gradient colors for step visualization

**Key Function:**

**`stepColor(index, total)`**

- Generate color for step marker
- Input: Step index (0, 1, 2...), total steps
- Process: Linear interpolation between start and end colors
  - Start: Blue (#378ADD)
  - End: Brown-Red (#1D9E75)
- Response: Hex color string (e.g., "#378ADD")
- Used By: MapView (step marker color), StepList (color indicator)

---

### `utils/export.js`

**Purpose:** Export route data and visualization

**Key Functions:**

1. **`exportGeoJSON(steps, origin)`**
   - Generate and download GeoJSON file
   - Input: Steps array, origin point
   - Process:
     - Builds coordinates from steps
     - Creates GeoJSON FeatureCollection with route polyline
     - Triggers browser download as route_YYYY-MM-DD.geojson
   - Response: Downloads file to user's device
   - Used By: Controls (Export button)

2. **`captureScreenshot()`**
   - Display instructions for capturing screenshot
   - Note: html2canvas doesn't work with OSM tiles, so manual screenshot recommended
   - Used By: Controls (Export button alternative)

---

### `utils/routes.js`

**Purpose:** Seeded historical and place-based routes (embedded data)

**Exported Array:** `SEEDED_ROUTES` - Array of 10+ pre-configured routes

**Route Data Structure:**

```javascript
{
  id: "unique-id",
  title: "Route Name",
  subtitle: "Short description",
  category: "Historical" | "Place",
  origin: [latitude, longitude],
  originLabel: "Starting location name",
  originDescription: "Context about starting point",
  steps: [
    {
      bearing: 45,           // degrees
      distance: 5000,        // meters
      label: "Step name",
      description: "Details",
      duration: 5,           // seconds for playback
      pinIcon: "⚓"           // emoji or image URL
    },
    // ... more steps
  ]
}
```

**Example Routes:**

- Historical: Austronesian Crossing, Negrito Migration, Bataan Death March, etc.
- Places: UPLB Campus Walk, Rizal Park Walk, etc.

**Verification:** All coordinates verified against Wikipedia, OpenStreetMap, Mapcarta

**Used By:**

- RouteBrowser (Historical & Places tabs)
- Gallery (route selection)
- MapApp (load seeded route)

---

## Library Files

### `lib/supabase.js`

**Purpose:** Initialize and export Supabase client

**Exports:** `supabase` - Configured Supabase client instance

**Configuration:**

- Reads environment variables:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` - Anonymous API key
- Creates client with Supabase library

**Capabilities:**

- Auth operations (login, logout, OAuth)
- Database queries (read/write)
- File storage access (upload/download)

**Used By:**

- AuthContext (authentication)
- API calls (database operations)
- Image uploads (storage)

---

### `lib/api.js`

**Purpose:** HTTP client for backend API calls with authentication

**Key Functions:**

1. **`authHeaders()`**
   - Get Supabase JWT token
   - Process: Reads token from Supabase session
   - Response: Headers object with `Authorization: Bearer {token}`
   - Note: Called on each request (token may refresh)

2. **`apiFetch(path, options)`**
   - Fetch wrapper with automatic auth headers
   - Input: API path (e.g., "/routes"), fetch options
   - Process:
     - Adds auth headers to request
     - Prepends `VITE_API_URL` (backend base URL)
     - Makes fetch request
     - Throws error if response not OK
   - Response: Parsed JSON response
   - Error: Throws with detail message
   - Used By: All API calls

3. **`apiUpload(path, formData)`**
   - Multipart form upload wrapper
   - Input: API path, FormData object
   - Process: Same as `apiFetch()` but for file uploads
   - Response: Parsed JSON response
   - Used By: Image/pin uploads

**Error Handling:** All errors include:

- HTTP status code
- Error message from backend
- Logged to console

**Used By:**

- useRouteSync (save/load routes)
- PinPicker (upload custom pins)
- Components with image uploads

---

## Components

### `components/MapView.jsx`

**Purpose:** Leaflet map container displaying route visualization

**Props:**

- `origin` - Starting point [lat, lng]
- `steps` - Array of step objects
- `isPlaying` - Boolean playback state
- `playIndex` - Current step index during playback
- `timerRemaining` - Countdown timer seconds
- `timerDuration` - Total step duration
- `activeModalIndex` - Which step modal is open
- `onMapClick` - Callback when user clicks map
- `onStepClick` - Callback when user clicks step marker

**Key Features:**

1. **Map Display**
   - Leaflet map with selectable tile layers (OpenStreetMap, Satellite)
   - Initial center: Philippines
   - Zoom level: 6

2. **Route Visualization**
   - **Route Polyline** - Line connecting all step coordinates
     - Color: Blue with opacity
   - **Step Markers** - Circle markers at each step
     - Color: Gradient from blue → brown-red based on step index
     - Size: 35px diameter
   - **Origin Marker** - Starting point
     - Icon: Custom emoji or image
     - Popup: Origin label + description

3. **Sub-components:**
   - **`MapClickHandler`** - Listens for map clicks
     - Calls `onMapClick()` with clicked coordinates
     - Used for setting origin on empty map

   - **`FlyToStep`** - Auto-pan during playback
     - Pans map to current step marker
     - Animated transition
     - Triggered when `playIndex` changes

   - **`PanToCoord`** - Manual pan to coordinates
     - Pans to specific [lat, lng]
     - Used when clicking step in list

   - **`makeDivIcon()`** - Create step markers
     - Input: Pin object, step color, step number
     - Creates custom HTML marker with emoji/image
     - Response: Leaflet DivIcon

   - **`popupHTML()`** - Generate step popup content
     - Shows step details: bearing, distance, label, description
     - Displays timer progress bar (red when <3 sec)
     - Response: HTML string

**State:**

- None (all state passed via props from parent MapApp)

**Used By:** MapApp (main editor)

**Response:** Rendered Leaflet map with visual route

---

### `components/Controls.jsx`

**Purpose:** Button bar at bottom of screen for playback and route management

**Props:**

- `isPlaying` - Playback state
- `canUndo` / `canRedo` - Undo/redo availability
- `steps` - Route steps (to check if exists)
- `origin` - Origin point (to check if exists)
- `playIndex` - Current step during playback
- `onPlay` - Start playback callback
- `onPause` - Pause playback callback
- `onReset` - Reset playback callback
- `onUndo` - Undo last action callback
- `onRedo` - Redo last action callback
- `onBrowseRoutes` - Open route browser callback

**Buttons & Logic:**

1. **Undo** - Grayed if `canUndo = false`
   - Calls `onUndo()` on click

2. **Redo** - Grayed if `canRedo = false`
   - Calls `onRedo()` on click

3. **Play/Resume** - Enabled only if `steps.length > 0` AND `origin` exists
   - Icon: ▶ Play (if not playing)
   - Icon: ⏸ Resume (if paused mid-playback)
   - Calls `onPlay()` on click

4. **Pause** - Shown only during playback
   - Calls `onPause()` on click

5. **Reset** - Enabled if playback started
   - Resets `playIndex` to 0
   - Calls `onReset()` on click

6. **Export** - Always enabled
   - Dropdown menu:
     - GeoJSON download
     - Screenshot help

7. **Browse Routes** - Always enabled
   - Opens RouteBrowser modal
   - Calls `onBrowseRoutes()` on click

**Styling:**

- Cinzel font (serif)
- Custom button shadows
- Disabled buttons grayed with reduced opacity

**Used By:** MapApp

**Response:** Rendered button bar with event handlers

---

### `components/StepForm.jsx`

**Purpose:** Form for adding individual steps to route

**Props:**

- `onAddStep` - Callback when user submits form
- `disabled` - Disable form (e.g., during save)

**State Variables:**

- `bearing` - Direction (0-360 or cardinal: "N", "NE", etc.)
- `distance` - Distance in meters (1-50,000)
- `label` - Optional step name
- `description` - Optional step notes
- `duration` - Display time in seconds (default: 5)
- `imageUrl` - Step image URL (optional)
- `pinIcon` - Step marker emoji or image
- `showPinPicker` - Boolean to toggle pin picker modal

**Key Functions:**

1. **`handleAdd()`**
   - Validate form inputs
   - Validation Rules:
     - Bearing: 0-360 degrees or cardinal abbreviation
     - Distance: 1-50,000 meters
     - Both required
   - Process:
     - Parse bearing via `parseBearing()`
     - Create step object
     - Call `onAddStep(stepObject)`
     - Reset form to defaults
   - Response: Adds step to route, clears form
   - Error: Shows alert if validation fails

**Sub-components:**

- `PinPicker` - Select emoji or custom pin

**Form Fields:**

- Input: Bearing (text or number)
- Input: Distance (number, meters)
- Input: Label (text)
- Textarea: Description
- Input: Duration (number, seconds)
- Input: Image URL (text)
- Button: Add Step

**Used By:** MapApp (left sidebar)

**Response:** Step object structure sent to parent

---

### `components/OriginForm.jsx`

**Purpose:** Configure starting point metadata

**Props:**

- `value` - Origin meta object:
  - `label` - Location name
  - `description` - Context text
  - `duration` - Popup display time
  - `pinIcon` - Emoji or image
- `onChange` - Callback when fields change
- `onConfirm` - Callback when user confirms (after setting on map)

**State:**

- Form fields track origin metadata

**Sub-components:**

- `PinPicker` - Select pin icon

**Key Features:**

1. **Manual Confirmation** - User enters metadata then clicks "Confirm Origin"
2. **Map Click** - Alternatively, user clicks map to set origin (triggers `onConfirm`)

**Form Fields:**

- Input: Label
- Textarea: Description
- Input: Duration (seconds)
- Button: Pin icon selector
- Button: Confirm Origin

**Used By:** MapApp (left sidebar)

**Response:** Origin metadata sent to parent

---

### `components/PinPicker.jsx`

**Purpose:** Select emoji, default, or custom pin icons

**Props:**

- `value` - Currently selected pin
- `onChange` - Callback with selected pin
- `disabled` - Disable inputs

**State:**

- `showPicker` - Toggle picker modal
- `customPins` - Array of user's uploaded pins
- `selectedDefault` - Active default pin

**Key Features:**

1. **Default Pins** - Built-in options:
   - Dot - Blue circle
   - Anchor - ⚓ emoji
   - Flag - 🚩 emoji
   - Ship - 🚢 emoji
   - Star - ⭐ emoji

2. **Custom Pins** - User-uploaded SVG/PNG icons:
   - Fetches on mount from `/api/upload/pin-icons/mine`
   - Each shows as thumbnail image

3. **File Upload**:
   - Accept SVG or PNG files
   - Max 512KB
   - POST to `/api/upload/pin-icon`
   - Response includes URL and ID
   - Error handling for failed uploads

**Picker Behavior:**

- Dropdown/modal interface
- Click outside to close
- Click pin to select and close

**Used By:**

- StepForm
- OriginForm
- MapApp

**Response:** Selected pin string (emoji, URL, or id) sent to parent

---

### `components/StepList.jsx`

**Purpose:** Right-side panel displaying all steps in route

**Props:**

- `steps` - Array of step objects
- `onDelete` - Remove step callback
- `activeModalIndex` - Which step's modal is open
- `onStepClick` - Called when user clicks step

**Features:**

1. **Step Count** - Shows "Steps: X" at top

2. **Scrollable List**:
   - Auto-scrolls to bottom when new step added
   - Max height with overflow scroll

3. **Each Step Row** displays:
   - Step number (1, 2, 3...)
   - Pin icon (emoji color swatch)
   - Bearing + Distance text (e.g., "NE 5.0 km")
   - Description preview (first 50 chars)
   - Delete button (trash icon)
   - Color indicator (left border matches map marker)

4. **Row Highlighting**:
   - Active step (during playback) highlighted with background + border
   - Clickable to jump to step in playback

**State:** None (all state passed from parent)

**Used By:** MapApp (right sidebar)

**Response:** Rendered list of steps with event handlers

**Returns:** null if no steps exist

---

### `components/StepModal.jsx`

**Purpose:** Full-screen overlay showing step details during playback

**Props:**

- `step` - Current step object
- `stepIndex` - Position in route (0-indexed)
- `totalSteps` - Total route length
- `isPlayingStep` - Whether this step is currently active
- `onClose` - Close modal callback
- `onResume` - Resume playback callback
- `onPrevStep` - Go to previous step callback
- `onNextStep` - Go to next step callback

**Features:**

1. **Auto-Open During Playback**
   - If step has description or image
   - Auto-closes after step duration

2. **Timer Management**
   - Countdown timer bar at top (red if <3 seconds)
   - Shows remaining seconds
   - Auto-advances to next step when timer ends

3. **Content Display**
   - Step title/number
   - Full description text
   - Image if present
   - Step index counter (e.g., "Step 3 of 10")

4. **Navigation Buttons**
   - ⏮ Previous Step
   - ⏯ Resume (extends timer)
   - ⏭ Next Step
   - ✕ Close

5. **Dismiss Methods**
   - Timer expires (auto-close)
   - Click X button
   - Click outside modal
   - Click "Resume" button

**Timer Logic:**

- `setInterval` ticks down every 100ms
- Turns red when `timerRemaining < 3`
- Calls `onClose()` when timer hits 0

**Used By:** MapApp (overlay during playback)

**Response:** Rendered modal with overlay

---

### `components/StatsPanel.jsx`

**Purpose:** Bottom-left statistics display showing route metrics

**Props:**

- `steps` - Array of steps
- `origin` - Starting point

**Computed Statistics:**

- **Drift %** - `(totalWalked - displacement) / totalWalked × 100`
  - Interpretation: Percentage of distance "wasted" due to inaccuracy
  - Green if <10% (accurate navigation)
  - Amber if 10-40% (moderate drift)
  - Red if >40% (poor accuracy)

- **Walked** - Total distance of all steps (meters)
  - Formatted with thousands separators (e.g., "12,345 m")

- **Displacement** - Great-circle distance from origin to final endpoint (meters)
  - Formatted with thousands separators

- **Direction** - Final bearing from origin to endpoint (degrees)
  - Formatted as bearing degree (e.g., "45°")

**Styling:**

- Large drift percentage display (main focus)
- Color-coded drift percentage
- Formatted numbers

**Returns:** null if no steps or origin

**Used By:** MapApp (bottom-left corner)

**Response:** Rendered statistics panel with formatted values

---

### `components/SaveRouteModal.jsx`

**Purpose:** Modal dialog to save or update route to backend

**Props:**

- `onSave` - Callback with (title, description, isPublic)
- `onClose` - Close modal callback
- `saving` - Boolean loading state
- `saveError` - Error message from backend
- `savedRoute` - Existing route object (if updating)

**State:**

- `title` - Route name input
- `description` - Route description input
- `isPublic` - Boolean public toggle

**Features:**

1. **Mode Detection**
   - If `savedRoute` exists: Title = "Update Route", pre-fill fields
   - If new: Title = "Save Route", empty fields

2. **Form Fields**
   - Input: Title (required, max 100 chars)
   - Textarea: Description (optional, max 500 chars)
   - Checkbox: "Make Public" (allow others to see/fork)

3. **Button States**
   - "Save" button disabled if `saving = true`
   - "Cancel" always enabled
   - Spinner shown during save

4. **Error Display**
   - If `saveError` exists, shows error message in red
   - Clears on next save attempt

5. **On Submit**
   - Validates title not empty
   - Calls `onSave(title, description, isPublic)`
   - Waits for async response
   - Closes modal on success

**Used By:** MapApp (triggered by "Save Route" button)

**Response:** Modal dialog with event handlers

---

### `components/RouteBrowser.jsx`

**Purpose:** Modal to browse and load seeded and public routes

**Props:**

- `onLoadRoute` - Callback when user selects a route
- `onClose` - Close modal callback

**Tabs:**

1. **Historical Seeded Routes**
   - Pre-configured historical routes
   - Examples: Austronesian Crossing, Negrito Migration, Bataan Death March
   - Data: Embedded in `SEEDED_ROUTES`

2. **Place Seeded Routes**
   - Pre-configured place-based routes
   - Examples: UPLB Campus Walk, Rizal Park Walk
   - Data: Embedded in `SEEDED_ROUTES`

3. **Public Routes**
   - User-created routes marked as public
   - Fetches from `/api/routes/`
   - Updates when modal opens

**Sub-component: RouteCard**

- Displays route card with:
  - Title
  - Subtitle/description
  - Category badge (Historical/Place)
  - Step count
  - "Load" button
- Click "Load":
  - For seeded: Use embedded data
  - For API: Fetch steps from `/api/routes/{id}/steps`
  - Calls `onLoadRoute(routeData)` on parent

**Features:**

- Tab navigation
- Search/filter by route name
- Lazy-load public routes
- Error handling for failed fetches

**Used By:** MapApp (via Browse button)

**Response:** Modal with route selection interface

---

## Pages

### `pages/MapApp.jsx`

**Purpose:** Main editor page - core application for creating and editing routes

**Complex State Management:**

1. **Route Data**:
   - `steps` - Array of step objects
   - `origin` - [lat, lng] starting point
   - `originMeta` - {label, description, duration, pinIcon}

2. **Playback State**:
   - `playIndex` - Current step during playback
   - `isPlaying` - Boolean playback active
   - `hasStarted` - Whether playback ever started
   - `pausedByUser` - Boolean pause initiated by user

3. **UI State**:
   - `showSave` - Show SaveRouteModal
   - `showBrowser` - Show RouteBrowser
   - `activeModalIndex` - Which step's detail modal open

4. **History (Undo/Redo)**:
   - `history` - Stack of previous states
   - `redoStack` - Stack for redo operations

5. **Timer State**:
   - `timerRemaining` - Countdown seconds

**Key Effects:**

1. **Load Route from URL**
   - If `routeId` in URL params: `GET /api/routes/{id}` + steps
   - Populate state with loaded route

2. **Playback Loop**
   - While `isPlaying = true`:
     - Auto-advance to next step at intervals
     - Auto-close modals after step duration
   - Interval: Based on step duration or default 5 seconds

3. **Timer Countdown**
   - Decrements `timerRemaining` every 100ms
   - Stops when reaches 0

**Main Functions:**

1. **Step Management**:
   - `addStep(step)` - Add step, push to history
   - `deleteStep(index)` - Remove step, push to history
   - `updateStep(index, newStep)` - Modify step
   - `moveStep(fromIndex, toIndex)` - Reorder steps

2. **Origin Management**:
   - `setOrigin(lat, lng)` - Set starting point
   - `setOriginMeta(meta)` - Update origin metadata

3. **Playback Control**:
   - `play()` - Start playback from current position
   - `pause()` - Pause playback
   - `resume()` - Resume from paused state
   - `reset()` - Clear playback, reset to step 0
   - `stepForward()` - Manually advance step
   - `stepBackward()` - Manually go back step

4. **Undo/Redo**:
   - `undo()` - Pop from history, push current to redo
   - `redo()` - Pop from redo, push current to history
   - Track changes to steps/origin

5. **Save/Load Integration**:
   - `handleSaveRoute(title, desc, isPublic)` - Call `useRouteSync.saveRoute()`
   - `handleLoadRoute(routeId)` - Call `useRouteSync.loadRoute()`
   - `handleForkRoute()` - POST `/api/routes/{id}/fork`

**Layout:**

- **Left Sidebar**:
  - OriginForm - Set origin point
  - StepForm - Add new steps
  - Controls - Playback buttons

- **Center**:
  - MapView - Interactive map showing route

- **Right Sidebar**:
  - StepList - All steps in list
  - StatsPanel - Route statistics (drift %, distance, etc.)

- **Overlays/Modals**:
  - RouteBrowser - Load seeded/public routes
  - StepModal - Step details during playback (auto-open)
  - SaveRouteModal - Save/update route

**Permissions:**

- Show "Delete" button only if user is route owner
- Show "Fork" button only for non-owner viewing public route

**Used By:** App.jsx (main route `/app`, `/app/:routeId`)

**Response:** Full interactive map editor with playback

---

### `pages/LandingPage.jsx`

**Purpose:** Home page with introduction and call-to-action

**Sections:**

1. **Navigation Bar**
   - Balangay logo
   - "Explore" link → `/gallery`
   - Auth links (Login/Logout based on state)

2. **Hero Section**
   - Headline: Dead reckoning explanation
   - Subheading: App overview
   - Background image/design

3. **Feature Highlights**
   - Feature cards describing app capabilities:
     - Create routes with bearing + distance
     - Playback routes with step-by-step navigation
     - Share routes publicly or privately
     - Fork existing routes

4. **Preset Route Cards**
   - 3 example routes from SEEDED_ROUTES
   - Each shows: Title, snippet, preview
   - Click → Load in MapApp

5. **Call-to-Action Buttons**
   - "Explore Gallery" → `/gallery` (view public routes)
   - "Start Creating" → Redirects to `/app` if logged in, else `/auth`

**Auth State**:

- Different CTA based on `useAuth()` state
- Show different button text for logged in vs. not

**Used By:** App.jsx (route `/`)

**Response:** Rendered landing page

---

### `pages/AuthPage.jsx`

**Purpose:** Login and signup page

**Modes:**

- "login" - Sign in with existing credentials
- "signup" - Create new account

**Auth Methods:**

1. **Email/Password**:
   - Input: Email, Password
   - Submit button triggers either:
     - `signInWithEmail()` (login mode)
     - `signUpWithEmail()` (signup mode)
   - Response: Sets user session, redirects to `/app`

2. **Google OAuth**:
   - Button: "Sign in with Google"
   - Calls `signInWithGoogle()`
   - Redirects to Google login, then back to `/auth/callback`

3. **GitHub OAuth**:
   - Button: "Sign in with GitHub"
   - Calls `signInWithGitHub()`
   - Redirects to GitHub login, then back to `/auth/callback`

**Error Handling**:

- Shows error message if auth fails
- Catches: Invalid credentials, network errors, etc.

**Mode Toggle**:

- Link to switch between "Login" and "Sign up"

**Redirect**:

- On successful auth: Navigate to `/app`

**Used By:** App.jsx (route `/auth`)

**Response:** Rendered auth form with authentication handlers

---

### `pages/AuthCallback.jsx`

**Purpose:** OAuth redirect handler after Supabase redirects back

**Flow:**

1. Supabase redirects to `/auth/callback` with hash token
2. AuthContext checks session state
3. If authenticated: Redirect to `/app`
4. If failed: Redirect to `/auth`

**Event Listener**:

- Waits for `SIGNED_IN` event from Supabase
- Confirms authentication successful before redirect

**Used By:** App.jsx (route `/auth/callback`)

**Response:** Redirect to `/app` or `/auth` based on auth result

---

### `pages/Gallery.jsx`

**Purpose:** Browse all public routes (both seeded and user-created)

**Display:**

1. **Seeded Routes Section**:
   - Historical routes (Austronesian Crossing, etc.)
   - Place routes (UPLB Campus, etc.)
   - Each route card shows: Title, subtitle, category

2. **Public Routes Section**:
   - User-created routes marked as `is_public: true`
   - Fetches from `/api/routes/` on mount
   - Each route card shows:
     - Title, description
     - Category badge
     - Drift % (color-coded)
     - View count

**Route Card Features**:

- Click card → Navigate to `/r/{routeId}` (RoutePage)

**Fetching**:

- `GET /api/routes/` - List public routes (paginated)

**Used By:** App.jsx (route `/gallery`), LandingPage

**Response:** Rendered gallery with route cards

---

### `pages/RoutePage.jsx`

**Purpose:** View-only page for sharing a specific route

**Params:** `routeId` - Route UUID

**Display:**

- Interactive map showing route (read-only)
- Route metadata: Title, description, stats
- Step list or playback controls
- Creator username

**Conditionally Shown:**

If **not logged in**:

- View-only access

If **logged in & not owner**:

- "Fork Route" button → Create personal copy
  - POST `/api/routes/{routeId}/fork`
  - Redirects to `/app/{newRouteId}` for editing

If **logged in & owner**:

- "Edit" button → Go to `/app/{routeId}`
- "Delete" button → Delete route, redirect to `/gallery`

**Fetching**:

- `GET /api/routes/{routeId}` - Route metadata
- `GET /api/routes/{routeId}/steps` - Steps array
- View count auto-increments on fetch

**Permissions**:

- Private routes: Only owner can view
- Public routes: Anyone can view
- Throws 404 if not authorized

**Used By:** App.jsx (route `/r/:routeId`)

**Response:** Rendered read-only route viewer with conditional buttons

---

### `pages/ProfilePage.jsx`

**Purpose:** User profile showing their public routes

**Params:** `username` - Username to view

**Display**:

- Username
- User bio (if any)
- Grid of user's public routes
- Each route shows: Title, snippet, view count

**Route Cards**:

- Click → Navigate to `/r/{routeId}` (RoutePage)

**Fetching**:

- `GET /api/profiles/{username}` - Profile + public routes

**Access**:

- Only shows public routes
- Private routes hidden from profile

**Used By:** App.jsx (route `/u/:username`)

**Response:** Rendered user profile with route grid

---

# BACKEND DOCUMENTATION

## Configuration Files

### `backend/config.py`

**Purpose:** Centralized environment configuration management

**Settings Class Variables:**

1. **`supabase_url`** - Supabase project URL
   - Read from: `SUPABASE_URL` env var
   - Used: Supabase client initialization

2. **`supabase_anon_key`** - Anonymous API key
   - Read from: `SUPABASE_ANON_KEY` env var
   - Used: Supabase client (public operations)

3. **`supabase_service_role_key`** - Admin API key
   - Read from: `SUPABASE_SERVICE_ROLE_KEY` env var
   - Used: Admin operations (server-side only)
   - **Security Note:** Never send to frontend

4. **`supabase_jwt_secret`** - JWT signing secret
   - Read from: `SUPABASE_JWT_SECRET` env var
   - Used: Verify JWT tokens from Supabase

5. **`allowed_origins`** - CORS allowed origins
   - Read from: `ALLOWED_ORIGINS` env var (comma-separated)
   - Used: CORS middleware configuration
   - Example: "http://localhost:5173,https://balangay.vercel.app"

**Loading Method**:

- Uses Python-dotenv to read `.env` file
- Falls back to environment variables if file not found

**Used By:**

- main.py (CORS setup)
- dependencies.py (JWT verification)
- supabase_client.py (client init)

---

### `backend/main.py`

**Purpose:** FastAPI application initialization, middleware setup, and router registration

**Middleware Setup:**

1. **CORS Middleware** - Allow cross-origin requests
   - Reads `allowed_origins` from config
   - Enables credentials (cookies, auth headers)
   - Allows methods: GET, POST, PUT, DELETE, OPTIONS, PATCH

**Router Registration** (all prefixed with `/api`):

1. **Routes Router** - `/api/routes`
   - Handles: GET, POST, PUT, DELETE operations on routes
   - File: `routers/routes.py`

2. **Steps Router** - `/api/routes` (same prefix as Routes)
   - Handles: GET, PUT operations on steps
   - File: `routers/steps.py`

3. **Uploads Router** - `/api/upload`
   - Handles: Image and pin icon uploads
   - File: `routers/uploads.py`

4. **Profiles Router** - `/api/profiles`
   - Handles: Profile retrieval
   - File: `routers/profiles.py`

**Health Check Endpoint**:

- `GET /api/health` → `{"status": "ok"}`
- Used for deployment monitoring

**Used By:** Render.io (server startup)

---

## Dependency & Authentication

### `backend/dependencies.py`

**Purpose:** JWT authentication utilities and user extraction

**Key Functions:**

1. **`get_current_user()` - Optional Auth**
   - Extract user from Authorization header
   - Bearer token format: `Authorization: Bearer {token}`
   - Process:
     - Decode JWT token
     - Validate token signature
     - Extract user ID (`sub` claim)
   - Response: Dict with decoded JWT payload
     - Includes: `user_id` (sub), email, etc.
   - **If token missing or invalid:** Returns None
   - Used By: Endpoints that work for both logged-in and anonymous users

2. **`require_auth()` - Required Auth**
   - Same as `get_current_user()` but raises 401 error if missing
   - Raises: `HTTPException(status_code=401, detail="Unauthorized")`
   - Used By: Endpoints that require authentication

**Token Verification Process**:

1. **Extract Token** from `Authorization: Bearer {token}` header

2. **Decode Token** - Supports two JWT algorithms:

   a. **ES256 (new Supabase)**:
   - Fetches public key from Supabase JWKS endpoint
   - Verifies signature using public key
   - Handles key rotation automatically

   b. **HS256 (legacy)**:
   - Uses `JWT_SECRET` from config
   - Verifies signature with secret

3. **Validate Claims**:
   - `audience: authenticated` - Must be present
   - `iat` - Issued at time (not too old)
   - `exp` - Expiration time (not expired)

4. **Extract Payload**:
   - Returns decoded JWT dict with all claims
   - Includes: `sub` (user UUID), `email`, `role`, etc.

**Error Handling**:

- Invalid token format → 401
- Expired token → 401
- Invalid signature → 401
- Missing audience claim → 401

**Used By:**

- routes.py (require_auth for mutations)
- uploads.py (require_auth for uploads)
- profiles.py (get_current_user for optional auth)

---

### `backend/models.py`

**Purpose:** Pydantic request/response schemas for API validation

**Request Models:**

1. **`StepCreate`** - Input for creating/updating steps
   - `bearing_deg: float` - Direction 0-360
   - `distance_m: float` - Distance in meters
   - `label: str | None` - Optional step name
   - `description: str | None` - Optional details
   - `image_url: str | None` - Image URL
   - `pin_icon_id: str | None` - Custom pin ID
   - `pin_color: str | None` - Hex color
   - `duration_sec: int` - Display time seconds

2. **`RouteCreate`** - Input for creating new route
   - `title: str` - Route name
   - `description: str | None` - Route details
   - `cover_image_url: str | None` - Cover image
   - `origin_lat: float` - Starting latitude
   - `origin_lng: float` - Starting longitude
   - `origin_label: str | None` - Origin name
   - `origin_description: str | None` - Origin details
   - `origin_duration: int` - Origin popup time
   - `is_public: bool` - Visibility flag
   - `steps: list[StepCreate]` - Array of steps
   - `total_walked_m: float` - Pre-calculated total
   - `displacement_m: float` - Pre-calculated displacement
   - `drift_pct: float` - Pre-calculated drift %
   - `bearing_deg: float` - Pre-calculated final bearing

3. **`RouteUpdate`** - Partial update input
   - All fields optional
   - Allows updating title, description, visibility, etc.

**Response Models:**

1. **`StepOut`** - Full step response
   - All StepCreate fields plus:
   - `id: str` - Step UUID
   - `route_id: str` - Parent route UUID
   - `step_index: int` - Position in route
   - `created_at: datetime` - Creation timestamp

2. **`RouteOut`** - Full route response
   - All RouteCreate fields plus:
   - `id: str` - Route UUID
   - `user_id: str` - Owner UUID
   - `view_count: int` - Number of views
   - `fork_count: int` - Number of forks
   - `forked_from: str | None` - Original route ID if forked
   - `created_at: datetime` - Creation timestamp
   - `updated_at: datetime` - Last update timestamp
   - `steps: list[StepOut]` - Full steps array (if included)

**Validation**:

- Pydantic automatically validates types
- Converts datetime strings to datetime objects
- Rejects extra fields by default

**Used By:**

- routes.py (request/response parsing)
- steps.py (step request validation)
- uploads.py (response formatting)

---

## Services

### `backend/services/supabase_client.py`

**Purpose:** Supabase client singleton for database/storage access

**Exports:**

- `supabase` - Initialized Supabase client with service role key

**Configuration**:

- Uses `SUPABASE_URL` from config
- Uses `SUPABASE_SERVICE_ROLE_KEY` (admin access)
- **Security:** Service role key is server-side only, never sent to frontend

**Capabilities** (via Supabase client):

- Database queries (select, insert, update, delete)
- File storage operations (upload, download, delete)
- User management (admin operations)
- Full access without row-level security restrictions

**Used By:**

- routes.py (database operations)
- steps.py (database operations)
- uploads.py (storage operations)
- profiles.py (profile queries)

---

### `backend/services/image_service.py`

**Purpose:** Image processing, compression, and validation

**Constants**:

1. **`MAX_IMAGE_DIM`** - 1200px
   - Max dimension for route images

2. **`PIN_DIM`** - 64px
   - Target size for pin icons

3. **`ALLOWED_IMAGE_TYPES`** - ["image/jpeg", "image/png", "image/webp"]
   - Permitted image formats

4. **`ALLOWED_PIN_TYPES`** - ["image/svg+xml", "image/png"]
   - Permitted pin icon formats

**Key Functions:**

1. **`sanitize_svg(data: bytes) → bytes`**
   - Remove malicious SVG elements (security)
   - Process:
     - Parse SVG as XML
     - Remove dangerous tags: `<script>`, `<style>`, `<meta>`, etc.
     - Remove event handlers: onclick, onload, etc.
     - Remove javascript: URIs in href/src
     - Whitelist safe tags: `<svg>`, `<path>`, `<circle>`, `<g>`, etc.
     - Whitelist safe attributes: id, class, viewBox, d, etc.
     - Optimize with scour library (removes redundant attributes)
   - Response: Sanitized SVG bytes
   - Error: Throws if SVG malformed

2. **`compress_image(data: bytes, mime: str) → bytes`**
   - Resize and compress image
   - Process:
     - Load image from bytes using PIL
     - Check file size (max 5MB)
     - Resize to MAX_IMAGE_DIM if larger
     - Convert JPEG to RGB, others to RGBA
     - Save with quality=82 for JPEG (reduces size)
     - Return compressed bytes
   - Response: Compressed image bytes
   - Error: Throws if format unsupported

3. **`upload_to_storage(bucket: str, path: str, data: bytes, content_type: str) → str`**
   - Upload to Supabase Storage
   - Input:
     - `bucket` - Storage bucket name ("route-images", "pin-icons")
     - `path` - File path in bucket (e.g., "user-id/uuid.jpg")
     - `data` - Image bytes
     - `content_type` - MIME type
   - Process:
     - Upload to Supabase Storage
     - Generate public URL
   - Response: Public URL string
   - Error: Throws if upload fails

**Size Limits**:

- Images: 5MB max
- Pin icons: 512KB max
- Enforced before processing

**Used By:**

- uploads.py (image upload endpoint)
- uploads.py (pin icon upload endpoint)

---

## Routers

### `backend/routers/routes.py`

**Purpose:** REST API endpoints for route management (CRUD)

**Endpoints:**

#### **1. GET `/api/routes/` - List Public Routes**

**Purpose:** Browse all public routes (paginated)

**Auth:** Optional (get_current_user)

**Query Parameters**:

- `limit` - Results per page (default: 20, max: 100)
- `offset` - Pagination offset (default: 0)

**Process**:

- Query routes where `is_public = true`
- Order by `created_at DESC` (newest first)
- Limit results

**Response**:

```json
{
  "routes": [
    {
      "id": "uuid",
      "title": "Route Name",
      "description": "...",
      "is_public": true,
      "view_count": 42,
      "drift_pct": 15.5,
      "created_at": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

**Used By:** Gallery page, RouteBrowser (Public Routes tab)

---

#### **2. GET `/api/routes/mine` - List Current User's Routes**

**Purpose:** Get all routes owned by authenticated user

**Auth:** Required (require_auth)

**Process**:

- Query routes where `user_id = current_user`
- Include private routes (only visible to owner)
- Order by `created_at DESC`

**Response**:

```json
{
  "routes": [
    {
      "id": "uuid",
      "title": "Route Name",
      "is_public": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

**Used By:** useRouteSync hook (count user's routes)

---

#### **3. POST `/api/routes/` - Create Route**

**Purpose:** Save new route to database

**Auth:** Required (require_auth)

**Request Body** (RouteCreate):

```json
{
  "title": "My Route",
  "description": "Route description",
  "origin_lat": 14.1627,
  "origin_lng": 121.2427,
  "origin_label": "UPLB",
  "is_public": false,
  "total_walked_m": 5000,
  "displacement_m": 3200,
  "drift_pct": 36,
  "bearing_deg": 45,
  "steps": [
    {
      "bearing_deg": 45,
      "distance_m": 1000,
      "label": "First step",
      "description": "Go northeast",
      "duration_sec": 5
    },
    ...
  ]
}
```

**Process**:

- Create route record with user_id
- Insert all steps into steps table
- Set step_index for each step
- Save statistics (drift, displacement, etc.)

**Response** (RouteOut):

```json
{
  "id": "new-uuid",
  "user_id": "user-uuid",
  "title": "My Route",
  "is_public": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Cases**:

- 401 - Not authenticated
- 400 - Invalid request data

**Used By:** MapApp (Save Route modal)

---

#### **4. GET `/api/routes/{route_id}` - Get Route Details**

**Purpose:** Fetch single route metadata

**Auth:** Optional (get_current_user)

**Process**:

- Query route by ID
- **Check permissions**: If private, only owner can access
- Increment `view_count` by 1
- Return route metadata

**Response** (RouteOut):

```json
{
  "id": "uuid",
  "title": "Route Name",
  "user_id": "creator-uuid",
  "is_public": true,
  "drift_pct": 15.5,
  "view_count": 43,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Cases**:

- 404 - Route not found
- 403 - Private route, not owner

**Used By:** RoutePage, MapApp (load route info)

---

#### **5. PUT `/api/routes/{route_id}` - Update Route**

**Purpose:** Modify route metadata

**Auth:** Required (require_auth)

**Authorization**: User must be route owner

**Request Body** (RouteUpdate - partial):

```json
{
  "title": "Updated Title",
  "description": "New description",
  "is_public": true
}
```

**Process**:

- Verify user owns route (403 if not)
- Update fields in routes table
- Set `updated_at = now()`

**Response** (RouteOut):

```json
{
  "id": "uuid",
  "title": "Updated Title",
  "is_public": true,
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Error Cases**:

- 401 - Not authenticated
- 403 - Not route owner
- 404 - Route not found

**Used By:** MapApp (Update Route after editing)

---

#### **6. DELETE `/api/routes/{route_id}` - Delete Route**

**Purpose:** Permanently remove route and all steps

**Auth:** Required (require_auth)

**Authorization**: User must be route owner

**Process**:

- Verify user owns route (403 if not)
- Delete route from routes table (cascade deletes steps)

**Response**: 204 No Content

**Error Cases**:

- 401 - Not authenticated
- 403 - Not route owner
- 404 - Route not found

**Used By:** RoutePage (Delete button), MapApp

---

#### **7. POST `/api/routes/{route_id}/fork` - Fork Route**

**Purpose:** Create personal copy of public route

**Auth:** Required (require_auth)

**Authorization**: Route must be public

**Process**:

- Check route is public (403 if private)
- Copy route record with:
  - `user_id = current_user`
  - `is_public = false` (new copy is private by default)
  - `forked_from = original_route_id`
- Copy all steps from original
- Increment original route's `fork_count`

**Response** (RouteOut):

```json
{
  "id": "new-uuid",
  "title": "Original Title (copy)",
  "user_id": "current-user-uuid",
  "forked_from": "original-uuid",
  "is_public": false
}
```

**Error Cases**:

- 401 - Not authenticated
- 403 - Route is private
- 404 - Route not found

**Used By:** RoutePage (Fork button)

---

### `backend/routers/steps.py`

**Purpose:** API endpoints for route steps

**Endpoints:**

#### **1. GET `/api/routes/{route_id}/steps` - Get Route Steps**

**Purpose:** Fetch all steps for a route in order

**Auth:** Optional (get_current_user)

**Process**:

- Query steps where `route_id = {id}`
- Order by `step_index ASC`
- Return all steps

**Response**:

```json
{
  "steps": [
    {
      "id": "step-uuid",
      "route_id": "route-uuid",
      "step_index": 0,
      "bearing_deg": 45,
      "distance_m": 1000,
      "label": "First step",
      "duration_sec": 5,
      "created_at": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

**Used By:**

- MapApp (load steps for editing)
- RoutePage (load steps for viewing)
- RouteBrowser (load seeded route steps)

---

#### **2. PUT `/api/routes/{route_id}/steps` - Replace All Steps**

**Purpose:** Update entire route step list at once

**Auth:** Required (require_auth)

**Authorization**: User must be route owner

**Request Body**: Array of StepCreate:

```json
{
  "steps": [
    {
      "bearing_deg": 45,
      "distance_m": 1000,
      "label": "First step",
      "duration_sec": 5
    },
    {
      "bearing_deg": 90,
      "distance_m": 2000,
      "label": "Second step",
      "duration_sec": 5
    }
  ]
}
```

**Process**:

- Verify user owns route (403 if not)
- Delete existing steps for route
- Insert new steps with:
  - `step_index = array position`
  - `route_id = route_id`
  - Other fields from request
- Return new steps array

**Response**:

```json
{
  "steps": [
    {
      "id": "uuid",
      "step_index": 0,
      "bearing_deg": 45,
      ...
    },
    ...
  ]
}
```

**Error Cases**:

- 401 - Not authenticated
- 403 - Not route owner
- 404 - Route not found

**Used By:** MapApp (update steps after editing)

---

### `backend/routers/uploads.py`

**Purpose:** File upload endpoints (images and pin icons)

**Endpoints:**

#### **1. POST `/api/upload/image` - Upload Route/Step Image**

**Purpose:** Upload and compress image for route or step

**Auth:** Required (require_auth)

**Request**: Multipart form-data

- Field: `file` - Image file (JPEG, PNG, WebP)
- Max size: 5MB

**Process**:

- Validate MIME type (JPEG, PNG, WebP only)
- Check file size <5MB
- Compress image via `image_service.compress_image()`
- Generate unique filename: `{user_id}/{uuid}.{ext}`
- Upload to Supabase Storage bucket: "route-images"
- Generate public URL

**Response**:

```json
{
  "url": "https://storage.supabase.co/route-images/user-id/uuid.jpg"
}
```

**Error Cases**:

- 401 - Not authenticated
- 400 - Invalid MIME type
- 413 - File too large
- 500 - Upload failed

**Used By:**

- MapApp (upload cover image)
- StepForm (upload step image)
- PinPicker (fallback for custom images)

---

#### **2. POST `/api/upload/pin-icon` - Upload Custom Pin Icon**

**Purpose:** Upload custom pin icon (SVG or PNG)

**Auth:** Required (require_auth)

**Request**: Multipart form-data

- Field: `file` - Icon file (SVG or PNG)
- Max size: 512KB

**Process**:

- Validate MIME type (SVG or PNG only)
- Check file size <512KB
- **If SVG**: Sanitize via `image_service.sanitize_svg()`
- **If PNG**: Resize to PIN_DIM (64×64) via `image_service.compress_image()`
- Generate filename: `{user_id}/{uuid}.{ext}`
- Upload to Supabase Storage bucket: "pin-icons"
- Create record in `pin_icons` table:
  - `user_id = current_user`
  - `file_url = public_url`
  - `file_type = svg | png`
  - `width_px` / `height_px` = dimensions
- Generate public URL

**Response**:

```json
{
  "url": "https://storage.supabase.co/pin-icons/user-id/uuid.svg",
  "id": "pin-uuid",
  "file_type": "svg"
}
```

**Error Cases**:

- 401 - Not authenticated
- 400 - Invalid MIME type or SVG malformed
- 413 - File too large
- 500 - Upload failed

**Used By:** PinPicker (upload custom pins)

---

#### **3. GET `/api/upload/pin-icons/mine` - List User's Custom Pins**

**Purpose:** Fetch all custom pin icons uploaded by user

**Auth:** Required (require_auth)

**Process**:

- Query pin_icons where `user_id = current_user`
- Return all pins

**Response**:

```json
{
  "pins": [
    {
      "id": "pin-uuid",
      "file_url": "https://...",
      "file_type": "svg",
      "created_at": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

**Used By:** PinPicker (load user's custom pins on init)

---

#### **4. DELETE `/api/upload/pin-icons/{pin_id}` - Delete Custom Pin**

**Purpose:** Permanently remove custom pin icon

**Auth:** Required (require_auth)

**Authorization**: User must own pin

**Process**:

- Query pin record by ID
- Verify user owns pin (403 if not)
- Delete file from Supabase Storage
- Delete pin record from pin_icons table

**Response**: 204 No Content

**Error Cases**:

- 401 - Not authenticated
- 403 - Not pin owner
- 404 - Pin not found

**Used By:** PinPicker (delete button on custom pin)

---

### `backend/routers/profiles.py`

**Purpose:** API endpoints for user profile information

**Endpoints:**

#### **1. GET `/api/profiles/{username}` - Get Public Profile**

**Purpose:** Fetch user's public profile and public routes

**Auth:** Optional (get_current_user)

**Process**:

- Query profiles table by username
- Get route count for user
- Query public routes where `user_id` and `is_public = true`
- Return profile + routes

**Response**:

```json
{
  "username": "john_doe",
  "bio": "Dead reckoning enthusiast",
  "avatar_url": "https://...",
  "routes": [
    {
      "id": "route-uuid",
      "title": "Route Name",
      "drift_pct": 15.5,
      "view_count": 42
    },
    ...
  ]
}
```

**Error Cases**:

- 404 - User not found

**Used By:** ProfilePage (load user profile)

---

#### **2. GET `/api/profiles/me/profile` - Get Current User's Profile**

**Purpose:** Fetch authenticated user's own profile

**Auth:** Required (require_auth)

**Process**:

- Query profiles table for current user UUID
- Return full profile

**Response**:

```json
{
  "username": "john_doe",
  "bio": "My bio",
  "avatar_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Cases**:

- 401 - Not authenticated
- 404 - Profile not found

**Used By:** Internal use (future profile edit functionality)

---

## Database Schema (Supabase PostgreSQL)

### **Routes Table**

```sql
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  origin_lat FLOAT NOT NULL,
  origin_lng FLOAT NOT NULL,
  origin_label TEXT,
  origin_description TEXT,
  origin_duration INT DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  total_walked_m FLOAT,
  displacement_m FLOAT,
  drift_pct FLOAT,
  bearing_deg FLOAT,
  view_count INT DEFAULT 0,
  fork_count INT DEFAULT 0,
  forked_from UUID REFERENCES routes(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Columns**:

- `id` - Unique identifier
- `user_id` - Route owner (cascade delete)
- `title` - Route name
- `description` - Route details
- `cover_image_url` - Route cover image
- `origin_lat/lng` - Starting point coordinates
- `origin_label/description/duration` - Origin popup metadata
- `is_public` - Visibility flag
- `total_walked_m` - Pre-calculated total distance
- `displacement_m` - Pre-calculated displacement
- `drift_pct` - Pre-calculated drift percentage
- `bearing_deg` - Pre-calculated final bearing
- `view_count` - Number of route views
- `fork_count` - Number of times forked
- `forked_from` - ID of original route if forked
- `created_at/updated_at` - Timestamps

---

### **Steps Table**

```sql
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  step_index INT,
  bearing_deg FLOAT NOT NULL,
  distance_m FLOAT NOT NULL,
  label TEXT,
  description TEXT,
  image_url TEXT,
  pin_icon_id UUID REFERENCES pin_icons(id),
  pin_color TEXT DEFAULT '#378ADD',
  duration_sec INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);
```

**Columns**:

- `id` - Unique step identifier
- `route_id` - Parent route (cascade delete)
- `step_index` - Position in route (0-indexed)
- `bearing_deg` - Direction (0-360°)
- `distance_m` - Distance in meters
- `label` - Step name
- `description` - Step details
- `image_url` - Optional step image
- `pin_icon_id` - Link to custom pin icon
- `pin_color` - Hex color for step marker
- `duration_sec` - Playback display time
- `created_at` - Creation timestamp

---

### **Pin Icons Table**

```sql
CREATE TABLE pin_icons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  file_url TEXT,
  file_type TEXT,
  width_px INT,
  height_px INT,
  created_at TIMESTAMP DEFAULT now()
);
```

**Columns**:

- `id` - Unique icon identifier
- `user_id` - Icon owner (cascade delete)
- `name` - Icon name/title
- `file_url` - Public URL to icon file
- `file_type` - "svg" or "png"
- `width_px/height_px` - Icon dimensions
- `created_at` - Upload timestamp

---

### **Profiles Table** (created by Supabase Auth)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

**Columns**:

- `id` - Links to auth.users
- `username` - Unique username
- `bio` - User biography
- `avatar_url` - Profile picture URL
- `created_at` - Account creation timestamp

---

# App Flow & User Journeys

## 1. Authentication Flow

```
User Visits / (LandingPage)
  ↓
Click Login → Navigate to /auth (AuthPage)
  ↓
Choose Auth Method:
  ├─→ Email/Password:
  │     ├─→ signInWithEmail() or signUpWithEmail()
  │     ├─→ Supabase creates/verifies user
  │     └─→ Session stored in browser
  │
  ├─→ Google OAuth:
  │     ├─→ signInWithGoogle()
  │     ├─→ Redirect to Google login
  │     ├─→ Google redirects to /auth/callback
  │     └─→ Supabase confirms auth
  │
  └─→ GitHub OAuth:
        ├─→ signInWithGitHub()
        ├─→ Redirect to GitHub login
        ├─→ GitHub redirects to /auth/callback
        └─→ Supabase confirms auth
  ↓
AuthContext updates: user ≠ null, session set
  ↓
Navigate to /app (MapApp)
  ↓
useRouteSync auto-fetches route count
```

---

## 2. Creating a Route

```
User at /app (MapApp - logged in)
  ↓
Click map to set origin
  ↓
OriginForm populated with origin coordinates
  ├─→ Enter label, description, duration, pin
  ├─→ Click "Confirm Origin"
  └─→ originMeta saved to state
  ↓
Enter step in StepForm
  ├─→ Bearing (compass or degrees)
  ├─→ Distance (meters)
  ├─→ Optional: label, description, duration, image, pin
  ├─→ Click "Add Step"
  └─→ Step added to steps array, form resets
  ↓
Steps accumulate in StepList (right panel)
  ↓
MapView auto-updates:
  ├─→ buildCoords() calculates path
  ├─→ Polyline drawn on map
  ├─→ Step markers with gradient colors added
  └─→ StatsPanel shows drift %, distance, etc.
  ↓
Repeat: Add more steps...
  ↓
Click "Save Route" → SaveRouteModal opens
  ├─→ Enter title, description
  ├─→ Toggle "Make Public"
  ├─→ Click "Save"
  └─→ Modal shows saving state
  ↓
saveRoute() called:
  ├─→ If new: POST /api/routes/ with all data
  ├─→ If existing: PUT /api/routes/{id}
  ├─→ PUT /api/routes/{id}/steps with steps array
  └─→ Response: savedRoute object set
  ↓
Route saved to backend
  ├─→ Steps inserted into database
  ├─→ Statistics pre-calculated and stored
  └─→ User can continue editing or finish
```

---

## 3. Playback Flow

```
User at /app with route loaded (steps + origin)
  ↓
Click "▶ Play" button
  ↓
MapApp state: isPlaying = true, playIndex = 0
  ↓
Playback loop starts:
  ├─→ MapView pans to step[0]
  ├─→ If step has description/image: StepModal auto-opens
  ├─→ StepModal shows timer countdown
  ├─→ Timer ticks down from step.duration_sec
  │   (If duration_sec = 0: defaults to 5 seconds)
  ├─→ After timer reaches 0:
  │   ├─→ StepModal closes
  │   ├─→ playIndex increments
  │   ├─→ Loop repeats for next step
  │   └─→ MapView pans to next step
  └─→ Repeat until playIndex = totalSteps
  ↓
Playback complete:
  ├─→ isPlaying = false
  ├─→ playIndex = totalSteps (last step)
  └─→ User can click "Reset" to restart
  ↓
User can override playback:
  ├─→ Pause button: isPlaying = false
  ├─→ Resume button: isPlaying = true (continue from current)
  ├─→ Click step in StepList: Jump to step
  ├─→ Prev/Next buttons: Manual step navigation
  └─→ Reset button: Clear playback, go to start
```

---

## 4. Browsing & Forking Routes

```
User at /app clicks "Browse Routes"
  ↓
RouteBrowser modal opens
  ↓
Choose tab:
  ├─→ Historical: Load seeded SEEDED_ROUTES (embedded data)
  ├─→ Places: Load seeded SEEDED_ROUTES (embedded data)
  └─→ Public Routes:
      ├─→ Fetch GET /api/routes/
      ├─→ Display public user-created routes
      └─→ Each card shows: title, description, drift %, view count
  ↓
Click "Load" on a route
  ├─→ If seeded: Use embedded route data directly
  ├─→ If API route: Fetch GET /api/routes/{id}/steps
  ├─→ Populate MapApp with route data
  ├─→ Close modal
  └─→ User can now edit/play the route
  ↓
Alternative: View existing public route
  ├─→ Navigate to /r/{routeId} (RoutePage)
  ├─→ View route (read-only on map)
  ├─→ Click "Fork" button (if not owner)
  ├─→ POST /api/routes/{id}/fork
  │   └─→ Creates copy with user_id = current_user
  ├─→ Redirect to /app/{newRouteId}
  └─→ Now user can edit their personal copy
```

---

## 5. Sharing & Viewing Routes

```
User saves route with is_public = true
  ↓
Route appears in:
  ├─→ GET /api/routes/ (public list)
  ├─→ /gallery page
  ├─→ User's profile page (/u/{username})
  └─→ Search/browse features
  ↓
User gets shareable link: /r/{routeId}
  ↓
Others visit /r/{routeId}:
  ├─→ GET /api/routes/{routeId} (fetch metadata)
  ├─→ GET /api/routes/{routeId}/steps (fetch steps)
  ├─→ view_count incremented
  ├─→ Display route on map (read-only)
  ├─→ Show step details and metadata
  └─→ Route owner can see Edit/Delete buttons
  ↓
Non-owner can:
  ├─→ View route
  ├─→ Playback route
  ├─→ Click "Fork" → Create personal copy
  └─→ Export/share link
  ↓
Owner can:
  ├─→ View their own route
  ├─→ Click "Edit" → Go to /app/{routeId}
  ├─→ Click "Delete" → Permanently remove
  ├─→ Toggle is_public (private ↔ public)
  └─→ View analytics (view_count, fork_count)
```

---

## 6. User Profile

```
Navigate to /u/{username}
  ↓
GET /api/profiles/{username}
  ├─→ Fetch profile data (bio, avatar)
  ├─→ Fetch user's public routes
  └─→ Get view counts for routes
  ↓
Display profile:
  ├─→ Username, bio, avatar
  └─→ Grid of public routes:
      ├─→ Show title, description
      ├─→ Show view count
      ├─→ Show drift % color-coded
      └─→ Click card → /r/{routeId}
  ↓
Users can browse creator's routes
  └─→ Fork routes they like
```

---

# API Endpoints Summary

## Routes

| Method | Endpoint                | Auth     | Purpose                              |
| ------ | ----------------------- | -------- | ------------------------------------ |
| GET    | `/api/routes/`          | Optional | List public routes (paginated)       |
| GET    | `/api/routes/mine`      | Required | List current user's routes           |
| POST   | `/api/routes/`          | Required | Create new route                     |
| GET    | `/api/routes/{id}`      | Optional | Get route details (increments views) |
| PUT    | `/api/routes/{id}`      | Required | Update route metadata                |
| DELETE | `/api/routes/{id}`      | Required | Delete route                         |
| POST   | `/api/routes/{id}/fork` | Required | Create copy of public route          |

## Steps

| Method | Endpoint                 | Auth     | Purpose                 |
| ------ | ------------------------ | -------- | ----------------------- |
| GET    | `/api/routes/{id}/steps` | Optional | Get all steps for route |
| PUT    | `/api/routes/{id}/steps` | Required | Replace all steps       |

## Uploads

| Method | Endpoint                     | Auth     | Purpose                 |
| ------ | ---------------------------- | -------- | ----------------------- |
| POST   | `/api/upload/image`          | Required | Upload route/step image |
| POST   | `/api/upload/pin-icon`       | Required | Upload custom pin icon  |
| GET    | `/api/upload/pin-icons/mine` | Required | List user's custom pins |
| DELETE | `/api/upload/pin-icons/{id}` | Required | Delete custom pin       |

## Profiles

| Method | Endpoint                   | Auth     | Purpose                     |
| ------ | -------------------------- | -------- | --------------------------- |
| GET    | `/api/profiles/{username}` | Optional | Get public profile + routes |
| GET    | `/api/profiles/me/profile` | Required | Get current user's profile  |

## Health

| Method | Endpoint      | Auth | Purpose      |
| ------ | ------------- | ---- | ------------ |
| GET    | `/api/health` | None | Health check |

---

## Summary

This dead reckoning app is a full-featured web application combining:

- **Interactive map editing** with Leaflet
- **Mathematical calculations** for geodesic navigation
- **Full-stack authentication** via Supabase
- **Database persistence** with PostgreSQL
- **File storage** for images and custom icons
- **Social features** like sharing, forking, and profiles
- **Step-by-step playback** with timers and modals

The architecture cleanly separates frontend (React) from backend (FastAPI), with Supabase handling all auth, database, and storage concerns.
