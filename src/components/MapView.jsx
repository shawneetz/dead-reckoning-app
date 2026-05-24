import { useMemo, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Popup,
  LayersControl,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
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

function FlyToStep({ coord, isPlaying }) {
  const map = useMap();
  useEffect(() => {
    if (isPlaying && coord) map.panTo(coord, { animate: true, duration: 0.5 });
  }, [coord]);
  return null;
}

function PanToCoord({ coord }) {
  const map = useMap();
  useEffect(() => {
    if (coord) map.panTo(coord, { animate: true, duration: 0.4 });
  }, [coord?.[0], coord?.[1]]);
  return null;
}

function makeDivIcon(pinIcon) {
  if (!pinIcon) return null;
  if (pinIcon.type === "default" && pinIcon.emoji) {
    return L.divIcon({
      className: "",
      html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(1px 1px 0px rgba(44,24,16,0.6));cursor:pointer">${pinIcon.emoji}</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -16],
    });
  }
  if (pinIcon.type === "custom" && pinIcon.url) {
    return L.divIcon({
      className: "",
      html: `<img src="${pinIcon.url}" style="width:32px;height:32px;object-fit:contain;filter:drop-shadow(1px 1px 0px rgba(44,24,16,0.6));cursor:pointer"/>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20],
    });
  }
  return null;
}

function popupHTML(step, index, total) {
  const isOrigin = index === -1;
  const title = isOrigin
    ? step.label || "Start"
    : step.label || `${step.bearing}° · ${step.distance}m`;
  const hasDesc = !!step.description;

  return `
    <div style="font-family:'EB Garamond',Garamond,serif;min-width:200px;max-width:280px;">
      <div style="
        font-family:'Cinzel','Palatino Linotype',serif;
        font-size:8px;letter-spacing:0.22em;
        color:#F5EDD6;background:#5C3A1E;
        padding:3px 10px;display:inline-block;
        margin-bottom:8px;border:1px solid #2C1810;
      ">${isOrigin ? "START" : `STEP ${index + 1}${total ? ` OF ${total}` : ""}`}</div>

      <div style="
        font-family:'Cinzel',serif;font-size:14px;font-weight:700;
        color:#2C1810;letter-spacing:0.05em;text-transform:uppercase;
        line-height:1.3;margin-bottom:${hasDesc ? "8px" : "10px"};
      ">${title}</div>

      ${
        hasDesc
          ? `
        <div style="border-top:3px double #B8986A;margin-bottom:8px;"></div>
        <div style="font-size:15px;color:#5C3A1E;line-height:1.65;margin-bottom:10px;">
          ${step.description}
        </div>
      `
          : ""
      }

      <div style="border-top:1px solid #C9C3B7;padding-top:8px;display:flex;gap:20px;">
        ${
          !isOrigin
            ? `
          <div>
            <div style="font-family:'Cinzel',serif;font-size:7px;letter-spacing:0.22em;color:#7A6B3C;text-transform:uppercase;margin-bottom:2px">Bearing</div>
            <div style="font-size:16px;font-weight:500;color:#2C1810;">${step.bearing}°</div>
          </div>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:7px;letter-spacing:0.22em;color:#7A6B3C;text-transform:uppercase;margin-bottom:2px">Distance</div>
            <div style="font-size:16px;font-weight:500;color:#2C1810;">${step.distance}m</div>
          </div>
        `
            : ""
        }
        ${
          step.duration
            ? `
          <div>
            <div style="font-family:'Cinzel',serif;font-size:7px;letter-spacing:0.22em;color:#7A6B3C;text-transform:uppercase;margin-bottom:2px">Timer</div>
            <div style="font-size:16px;font-weight:500;color:#2C1810;">${step.duration}s</div>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

export default function MapView({
  steps,
  origin,
  originMeta,
  playIndex,
  onMapClick,
  isPlaying,
  onMarkerClick,
  onOriginClick,
  activeModalIndex,
  onPopupClose,
}) {
  const visibleCount = playIndex !== undefined ? playIndex : steps.length;
  const allCoords = useMemo(() => buildCoords(steps, origin), [steps, origin]);
  const visibleCoords = allCoords.slice(0, visibleCount + 1);
  const visibleStepCount = visibleCoords.length - 1;
  const finalCoord =
    visibleCoords.length > 0 ? visibleCoords[visibleCoords.length - 1] : null;
  const trueFinal =
    allCoords.length > 0 ? allCoords[allCoords.length - 1] : null;
  const showDisplacement = visibleCount >= steps.length && steps.length > 0;

  const markerRefs = useRef({});
  const originRef = useRef(null);

  // Open/close popups imperatively based on activeModalIndex
  useEffect(() => {
    // Close all step markers
    Object.values(markerRefs.current).forEach((ref) => {
      try {
        ref?.closePopup();
      } catch {}
    });
    // Close origin
    try {
      originRef.current?.closePopup();
    } catch {}

    if (activeModalIndex === null || activeModalIndex === undefined) return;

    setTimeout(() => {
      try {
        if (activeModalIndex === -1) {
          originRef.current?.openPopup();
        } else {
          markerRefs.current[activeModalIndex]?.openPopup();
        }
      } catch {}
    }, 60);
  }, [activeModalIndex]);

  // Pan to active coord
  const activeCoord =
    activeModalIndex === -1
      ? origin
      : activeModalIndex !== null && activeModalIndex !== undefined
        ? visibleCoords[activeModalIndex + 1]
        : null;

  return (
    <MapContainer
      center={origin || [14.1673, 121.2414]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <MapClickHandler onMapClick={onMapClick} />
      <FlyToStep coord={finalCoord} isPlaying={isPlaying} />
      {activeCoord && <PanToCoord coord={activeCoord} />}

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

      {/* Route lines */}
      {origin &&
        visibleCoords.length > 1 &&
        Array.from({ length: visibleStepCount }).map((_, i) => (
          <Polyline
            key={i}
            positions={[visibleCoords[i], visibleCoords[i + 1]]}
            pathOptions={{
              color: stepColor(i, Math.max(visibleStepCount, 1)),
              weight: 3,
            }}
          />
        ))}

      {/* Step markers with anchored popups */}
      {origin &&
        visibleCoords.length > 1 &&
        Array.from({ length: visibleStepCount }).map((_, i) => {
          const step = steps[i];
          const coord = visibleCoords[i + 1];
          const color = stepColor(i, Math.max(visibleStepCount, 1));
          const pinIcon = step?.pinIcon || null;
          const divIcon = makeDivIcon(pinIcon);
          const hasContent = step?.description || step?.imageUrl;

          const popup = (
            <Popup
              offset={[0, divIcon ? -20 : -8]}
              closeButton={true}
              autoPan={true}
              eventHandlers={{ remove: () => onPopupClose?.(i) }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: popupHTML(step, i, steps.length),
                }}
              />
            </Popup>
          );

          const eventHandlers = {
            click: (e) => {
              e.originalEvent.stopPropagation();
              onMarkerClick?.(i);
            },
          };

          if (divIcon) {
            return (
              <Marker
                key={`pin-${i}`}
                position={coord}
                icon={divIcon}
                eventHandlers={eventHandlers}
                ref={(r) => {
                  if (r) markerRefs.current[i] = r;
                }}
              >
                {popup}
              </Marker>
            );
          }

          return (
            <CircleMarker
              key={`dot-${i}`}
              center={coord}
              radius={hasContent ? 7 : 5}
              pathOptions={{
                color: hasContent ? "#5C3A1E" : color,
                fillColor: hasContent ? "#E8D5A3" : color,
                fillOpacity: 1,
                weight: hasContent ? 2 : 0,
              }}
              eventHandlers={eventHandlers}
              ref={(r) => {
                if (r) markerRefs.current[i] = r;
              }}
            >
              {popup}
            </CircleMarker>
          );
        })}

      {/* Displacement line */}
      {origin && trueFinal && showDisplacement && (
        <Polyline
          positions={[origin, trueFinal]}
          pathOptions={{ color: "#9B3A1A", weight: 2, dashArray: "6 4" }}
        />
      )}

      {/* Origin marker — clickable, with popup */}
      {origin &&
        (() => {
          const originDivIcon = originMeta?.pinIcon
            ? makeDivIcon(originMeta.pinIcon)
            : null;
          const originPopup = (
            <Popup
              offset={[0, originDivIcon ? -20 : -8]}
              closeButton={true}
              autoPan={true}
              eventHandlers={{ remove: () => onPopupClose?.(-1) }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: popupHTML(
                    {
                      label: originMeta?.label,
                      description: originMeta?.description,
                      duration: originMeta?.duration,
                    },
                    -1,
                    steps.length,
                  ),
                }}
              />
            </Popup>
          );

          if (originDivIcon) {
            return (
              <Marker
                position={origin}
                icon={originDivIcon}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    onOriginClick?.();
                  },
                }}
                ref={(r) => {
                  originRef.current = r;
                }}
              >
                {originPopup}
              </Marker>
            );
          }

          return (
            <CircleMarker
              center={origin}
              radius={9}
              pathOptions={{
                color: "#3D5A2E",
                fillColor: "#F5EDD6",
                fillOpacity: 1,
                weight: 2.5,
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  onOriginClick?.();
                },
              }}
              ref={(r) => {
                originRef.current = r;
              }}
            >
              {originPopup}
            </CircleMarker>
          );
        })()}

      {/* Current position marker */}
      {finalCoord && visibleCoords.length > 1 && (
        <CircleMarker
          center={finalCoord}
          radius={8}
          pathOptions={{
            color: "#5C3A1E",
            fillColor: "#E8D5A3",
            fillOpacity: 1,
            weight: 2,
          }}
        />
      )}
    </MapContainer>
  );
}
