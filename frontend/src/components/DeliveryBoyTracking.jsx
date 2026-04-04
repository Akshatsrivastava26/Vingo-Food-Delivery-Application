import React from "react";
import scooter from "../assets/scooter.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import home from "../assets/home.png";
import { MapContainer, Polyline, Popup } from "react-leaflet";
import { TileLayer } from "react-leaflet";
import { Marker } from "react-leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});
const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

function DeliveryBoyTracking({ data }) {
  const deliveryBoyLat = data?.deliveryBoyLocation?.lat;
  const deliveryBoyLon = data?.deliveryBoyLocation?.lon;
  const customerLat = data?.deliveryAddress?.lat ?? data?.customerLocation?.lat;
  const customerLon = data?.deliveryAddress?.lon ?? data?.customerLocation?.lon;

  const hasDeliveryBoyCoords =
    typeof deliveryBoyLat === "number" && typeof deliveryBoyLon === "number";
  const hasCustomerCoords =
    typeof customerLat === "number" && typeof customerLon === "number";

  if (!hasDeliveryBoyCoords || !hasCustomerCoords) {
    return (
      <div className="w-full mt-3 rounded-lg border border-(--border-soft) bg-(--bg-subtle) p-4 text-sm text-(--text-secondary)">
        Live tracking will appear once both delivery and customer locations are
        available.
      </div>
    );
  }

  const distanceKm = getDistanceKm(
    deliveryBoyLat,
    deliveryBoyLon,
    customerLat,
    customerLon,
  );
  const roundedDistance = Number(distanceKm.toFixed(2));
  const etaMinutes = Math.max(2, Math.round((distanceKm / 22) * 60));

  const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [customerLat, customerLon],
  ];

  const center = [deliveryBoyLat, deliveryBoyLon];

  return (
    <div className="w-full mt-3 rounded-lg shadow-(--shadow-sm) border border-(--border-soft) overflow-hidden bg-(--bg-elevated)">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-(--border-soft) bg-(--bg-subtle)">
        <p className="text-sm font-semibold text-(--text-primary)">
          Live Route
        </p>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="soft-badge">Distance: {roundedDistance} km</span>
          <span className="soft-badge">ETA: ~{etaMinutes} min</span>
        </div>
      </div>

      <div className="h-[360px]">
        <MapContainer
          className={"w-full h-full"}
          center={center}
          zoom={17}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[deliveryBoyLat, deliveryBoyLon]}
            icon={deliveryBoyIcon}
          >
            <Popup>Delivery Partner</Popup>
          </Marker>
          <Marker position={[customerLat, customerLon]} icon={customerIcon}>
            <Popup>Customer</Popup>
          </Marker>

          <Polyline positions={path} color="#ff2d55" weight={5} />
        </MapContainer>
      </div>

      <div className="px-4 py-3 border-t border-(--border-soft) bg-white text-xs text-(--text-muted) flex items-center gap-4">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-(--brand-2)" /> Route
        </span>
        <span className="inline-flex items-center gap-1">
          <img src={scooter} alt="Delivery" className="h-4 w-4" /> Partner
        </span>
        <span className="inline-flex items-center gap-1">
          <img src={home} alt="Customer" className="h-4 w-4" /> Customer
        </span>
      </div>
    </div>
  );
}

export default DeliveryBoyTracking;
