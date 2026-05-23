import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import { buildCoords } from "../utils/deadReckoning";
import { stepColor } from "../utils/colors";

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapView({ steps, origin, playIndex, onMapClick }) {
  const visibleSteps = steps.slice(
    0,
    playIndex !== undefined ? playIndex : steps.length,
  );

  const coords = useMemo(
    () => buildCoords(visibleSteps, origin),
    [visibleSteps, origin],
  );

  const allCoords = useMemo(() => buildCoords(steps, origin), [steps, origin]);

  const finalCoord = coords.length > 0 ? coords[coords.length - 1] : null;
  const trueFinal =
    allCoords.length > 0 ? allCoords[allCoords.length - 1] : null;

  return (
    <MapContainer
      center={origin || [14.1673, 121.2414]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <MapClickHandler onMapClick={onMapClick} />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            crossOrigin="anonymous"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Esri World Imagery"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {origin &&
        coords.length > 1 &&
        visibleSteps.map((step, i) => {
          const from = coords[i];
          const to = coords[i + 1];
          const color = stepColor(i, visibleSteps.length);
          return (
            <Polyline
              key={i}
              positions={[from, to]}
              pathOptions={{ color, weight: 3 }}
            />
          );
        })}
      {origin &&
        coords.length > 1 &&
        visibleSteps.map((step, i) => {
          const to = coords[i + 1];
          const color = stepColor(i, visibleSteps.length);
          return (
            <CircleMarker
              key={`dot-${i}`}
              center={to}
              radius={4}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 1,
                weight: 0,
              }}
            />
          );
        })}
      {origin && trueFinal && (
        <Polyline
          key={steps.length}
          positions={[origin, trueFinal]}
          pathOptions={{ color: "red", weight: 2, dashArray: "6 4" }}
        />
      )}
      {origin && (
        <CircleMarker
          center={origin}
          radius={8}
          pathOptions={{
            color: "#1D9E75",
            fillColor: "#E1F5EE",
            fillOpacity: 1,
            weight: 2,
          }}
        />
      )}
      {finalCoord && coords.length > 1 && (
        <CircleMarker
          center={finalCoord}
          radius={8}
          pathOptions={{
            color: "#185FA5",
            fillColor: "#BFD7F5",
            fillOpacity: 1,
            weight: 2,
          }}
        />
      )}{" "}
    </MapContainer>
  );
}
