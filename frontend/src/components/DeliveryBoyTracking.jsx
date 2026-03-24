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
      <div className="w-full mt-3 rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm text-gray-700">
        Live tracking is not available yet.
      </div>
    );
  }

  const path = [
    [deliveryBoyLat, deliveryBoyLon],
    [customerLat, customerLon],
  ];

  const center = [deliveryBoyLat, deliveryBoyLon];

  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
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
        {/* icone for delivery boy */}
        <Marker
          position={[deliveryBoyLat, deliveryBoyLon]}
          icon={deliveryBoyIcon}
        >
          <Popup>Delivery Boy</Popup>
        </Marker>
        {/* icon for customer */}
        <Marker position={[customerLat, customerLon]} icon={customerIcon}>
          <Popup>Delivery Boy</Popup>
        </Marker>

        <Polyline positions={path} color="blue" weight={4} />
      </MapContainer>
    </div>
  );
}

export default DeliveryBoyTracking;
