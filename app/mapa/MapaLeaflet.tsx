"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CollectionEntry } from "@/types";

const icono = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CENTRO_CHILE: [number, number] = [-35.6751, -71.543];

export default function MapaLeaflet({ entradas }: { entradas: CollectionEntry[] }) {
  const centro: [number, number] =
    entradas.length > 0 ? [entradas[0].latitude!, entradas[0].longitude!] : CENTRO_CHILE;

  return (
    <MapContainer
      center={centro}
      zoom={entradas.length > 0 ? 10 : 5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {entradas.map((entrada) => (
        <Marker key={entrada.id} position={[entrada.latitude!, entrada.longitude!]} icon={icono}>
          <Popup>
            <p className="font-bold">{entrada.plant.commonName}</p>
            <p className="italic">{entrada.plant.scientificName}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
