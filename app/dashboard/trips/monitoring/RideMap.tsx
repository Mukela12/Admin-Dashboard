'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number;
  updatedAt: number;
}

interface ActiveRide {
  id: string;
  status: string;
  bookingType: string;
  origin: Location | null;
  destination: Location | null;
  passengerInfo: { fullName?: string; phoneNumber?: string } | null;
  confirmedDriver: { fullName?: string; phoneNumber?: string } | null;
  driverLocation: DriverLocation | null;
  price: number;
  distance: string;
  duration: string;
}

interface RideMapProps {
  rides: ActiveRide[];
  selectedRideId: string | null;
  onSelectRide: (id: string | null) => void;
}

// Car SVG icon as data URI for the driver marker
function createCarIcon(heading: number, status: string) {
  const color = status === 'in_progress' ? '%2316a34a' : status === 'arrived' ? '%238b5cf6' : '%232563eb';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="${color}" transform="rotate(${heading})"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>`;
  return L.divIcon({
    html: `<div style="transform: rotate(${heading}deg); width: 32px; height: 32px;">${decodeURIComponent(svg.replace(/%23/g, '#').replace(/%22/g, '"'))}</div>`,
    className: 'car-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createCircleIcon(color: string, label: string) {
  return L.divIcon({
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:white;">${label}</div>`,
    className: 'circle-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Default center: Lusaka, Zambia
const DEFAULT_CENTER: [number, number] = [-15.3875, 28.3228];
const DEFAULT_ZOOM = 13;

export default function RideMap({ rides, selectedRideId, onSelectRide }: RideMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routesRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    // Use OpenStreetMap tiles (completely free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    routesRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers and routes when rides or selection changes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !routesRef.current) return;

    markersRef.current.clearLayers();
    routesRef.current.clearLayers();

    const bounds: L.LatLng[] = [];

    rides.forEach(ride => {
      const isSelected = ride.id === selectedRideId;
      const opacity = selectedRideId && !isSelected ? 0.3 : 1;

      // Draw route line from origin to destination
      if (ride.origin && ride.destination) {
        const originLatLng = L.latLng(ride.origin.latitude, ride.origin.longitude);
        const destLatLng = L.latLng(ride.destination.latitude, ride.destination.longitude);

        const routeColor = ride.status === 'in_progress' ? '#16a34a' : ride.status === 'arrived' ? '#8b5cf6' : '#2563eb';
        const polyline = L.polyline([originLatLng, destLatLng], {
          color: routeColor,
          weight: isSelected ? 4 : 2,
          opacity: opacity * 0.6,
          dashArray: ride.status === 'in_progress' ? undefined : '8 8',
        });
        routesRef.current!.addLayer(polyline);

        // Origin marker
        const originMarker = L.marker(originLatLng, {
          icon: createCircleIcon('#16a34a', 'A'),
          opacity,
        }).bindTooltip(
          `<strong>Pickup</strong><br/>${ride.origin.address || 'Unknown'}`,
          { direction: 'top', offset: [0, -12] }
        );
        originMarker.on('click', () => onSelectRide(isSelected ? null : ride.id));
        markersRef.current!.addLayer(originMarker);

        // Destination marker
        const destMarker = L.marker(destLatLng, {
          icon: createCircleIcon('#ef4444', 'B'),
          opacity,
        }).bindTooltip(
          `<strong>Destination</strong><br/>${ride.destination.address || 'Unknown'}`,
          { direction: 'top', offset: [0, -12] }
        );
        destMarker.on('click', () => onSelectRide(isSelected ? null : ride.id));
        markersRef.current!.addLayer(destMarker);

        bounds.push(originLatLng, destLatLng);
      }

      // Driver location marker (car sprite)
      if (ride.driverLocation) {
        const driverLatLng = L.latLng(ride.driverLocation.latitude, ride.driverLocation.longitude);
        const carMarker = L.marker(driverLatLng, {
          icon: createCarIcon(ride.driverLocation.heading, ride.status),
          opacity,
          zIndexOffset: isSelected ? 1000 : 0,
        }).bindTooltip(
          `<strong>${ride.confirmedDriver?.fullName || 'Driver'}</strong><br/>` +
          `Status: ${ride.status.replace('_', ' ')}<br/>` +
          `${ride.confirmedDriver?.phoneNumber || ''}`,
          { direction: 'top', offset: [0, -16] }
        );
        carMarker.on('click', () => onSelectRide(isSelected ? null : ride.id));
        markersRef.current!.addLayer(carMarker);
        bounds.push(driverLatLng);
      } else if (ride.origin) {
        // If no live location, show car at origin
        const fallbackLatLng = L.latLng(ride.origin.latitude, ride.origin.longitude);
        const carMarker = L.marker(fallbackLatLng, {
          icon: createCarIcon(0, ride.status),
          opacity,
          zIndexOffset: isSelected ? 1000 : 0,
        }).bindTooltip(
          `<strong>${ride.confirmedDriver?.fullName || 'Driver'}</strong><br/>` +
          `Status: ${ride.status.replace('_', ' ')}<br/>` +
          `(Last known: pickup)`,
          { direction: 'top', offset: [0, -16] }
        );
        carMarker.on('click', () => onSelectRide(isSelected ? null : ride.id));
        markersRef.current!.addLayer(carMarker);
      }
    });

    // Fit map to show all markers
    if (bounds.length > 0 && !selectedRideId) {
      const latLngBounds = L.latLngBounds(bounds);
      mapRef.current.fitBounds(latLngBounds, { padding: [50, 50], maxZoom: 15 });
    } else if (selectedRideId) {
      const selectedRide = rides.find(r => r.id === selectedRideId);
      if (selectedRide?.driverLocation) {
        mapRef.current.flyTo(
          [selectedRide.driverLocation.latitude, selectedRide.driverLocation.longitude],
          15,
          { duration: 0.5 }
        );
      } else if (selectedRide?.origin) {
        mapRef.current.flyTo(
          [selectedRide.origin.latitude, selectedRide.origin.longitude],
          15,
          { duration: 0.5 }
        );
      }
    } else if (bounds.length === 0) {
      mapRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [rides, selectedRideId, onSelectRide]);

  return (
    <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden" />
  );
}
