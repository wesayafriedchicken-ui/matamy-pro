import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Rider, Order } from '@/types';
import {
  Navigation,
  Package,
  UtensilsCrossed,
  Bike,
  Battery,
  Gauge,
  MapPin,
  Phone,
  Clock,
  Truck,
  Play,
  Pause,
  Crosshair,
  Eye,
  Layers,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import PageHeader from '@/components/shared/PageHeader';
import {
  loadGoogleMaps,
  GOOGLE_MAPS_API_KEY,
  darkMapStyles,
} from '@/lib/googleMaps';

// Restaurant Base Location (Cairo - Nasr City HQ)
const RESTAURANT_LOCATION: { lat: number; lng: number } = { lat: 30.0592, lng: 31.3395 };

// Realistic street route waypoints in Cairo for simulation
const RIDER_ROUTES: Record<string, { lat: number; lng: number }[]> = {
  r1: [
    { lat: 30.0592, lng: 31.3395 }, // Restaurant HQ
    { lat: 30.0575, lng: 31.343 }, // Tayaran St
    { lat: 30.055, lng: 31.347 },
    { lat: 30.052, lng: 31.352 }, // Abbas El Akkad
    { lat: 30.05, lng: 31.358 },
    { lat: 30.046, lng: 31.365 }, // Makram Ebeid
    { lat: 30.043, lng: 31.369 }, // Customer Destination (Nasr City)
  ],
  r2: [
    { lat: 30.0592, lng: 31.3395 }, // Restaurant HQ
    { lat: 30.064, lng: 31.336 }, // Towards Heliopolis
    { lat: 30.071, lng: 31.333 }, // Salah Salem
    { lat: 30.078, lng: 31.33 }, // Merghany St
    { lat: 30.084, lng: 31.328 }, // Korba
    { lat: 30.089, lng: 31.326 }, // Customer Destination (Heliopolis)
  ],
  r3: [
    { lat: 30.0592, lng: 31.3395 }, // Restaurant HQ
    { lat: 30.052, lng: 31.33 }, // Autostrad
    { lat: 30.038, lng: 31.315 },
    { lat: 30.015, lng: 31.295 }, // Ring Road
    { lat: 29.985, lng: 31.28 },
    { lat: 29.965, lng: 31.265 }, // Maadi entrance
    { lat: 29.9602, lng: 31.258 }, // Customer Destination (Maadi)
  ],
  r4: [
    { lat: 30.0592, lng: 31.3395 }, // Restaurant HQ
    { lat: 30.055, lng: 31.36 },
    { lat: 30.048, lng: 31.39 }, // Towards New Cairo
    { lat: 30.035, lng: 31.43 }, // 90th Street
    { lat: 30.021, lng: 31.472 }, // Customer Destination (New Cairo)
  ],
};

interface RiderTrackingState {
  riderId: string;
  currentCoord: { lat: number; lng: number };
  routeIndex: number;
  segmentProgress: number; // 0 to 1
  speed: number;
  battery: number;
  distanceRemainingKm: number;
  etaMinutes: number;
}

export default function DispatchTracking() {
  const { riders, orders } = useApp();
  const navigate = useNavigate();

  const [selectedRiderId, setSelectedRiderId] = useState<string | null>('r1');
  const [isPlaying, setIsPlaying] = useState(true);
  const [followRider, setFollowRider] = useState(false);
  const [mapTheme, setMapTheme] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const [showTraffic, setShowTraffic] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Map element and Google Map instance refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const hqMarkerRef = useRef<google.maps.Marker | null>(null);
  const riderMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const routePolylinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
  const destinationMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Tracking states for all active riders
  const [trackingStates, setTrackingStates] = useState<Record<string, RiderTrackingState>>(() => {
    const initial: Record<string, RiderTrackingState> = {};
    riders.forEach((r, idx) => {
      const waypoints = RIDER_ROUTES[r.id] || [
        { lat: RESTAURANT_LOCATION.lat + idx * 0.01, lng: RESTAURANT_LOCATION.lng + idx * 0.015 },
        { lat: RESTAURANT_LOCATION.lat - 0.014 + idx * 0.01, lng: RESTAURANT_LOCATION.lng + 0.01 + idx * 0.015 },
      ];
      initial[r.id] = {
        riderId: r.id,
        currentCoord: waypoints[0],
        routeIndex: 0,
        segmentProgress: 0.1,
        speed: r.status === 'offline' ? 0 : 25 + Math.floor(Math.random() * 18),
        battery: 65 + Math.floor(Math.random() * 30),
        distanceRemainingKm: 3.2,
        etaMinutes: 12,
      };
    });
    return initial;
  });

  // Calculate destination / active order per rider
  const riderOrdersMap = useMemo(() => {
    const map = new Map<string, Order>();
    orders.forEach((o) => {
      if (o.riderId && o.status === 'out_for_delivery') {
        map.set(o.riderId, o);
      }
    });
    return map;
  }, [orders]);

  // Helper to build custom SVG marker icons for Google Maps
  const getRestaurantIcon = useCallback((): google.maps.Icon => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="22" fill="#f97316" fill-opacity="0.25"/>
        <rect x="8" y="8" width="32" height="32" rx="10" fill="#f97316" stroke="#ffffff" stroke-width="2.5"/>
        <path d="M20 16h-2v-5h-2v5h-2v-5h-2v5c0 2.12 1.66 3.84 3.75 3.97V30h2.5v-10.03C20.34 19.84 22 18.12 22 16v-5h-2v5zm5-3v8h2.5v8H30V11c-2.76 0-5 2.24-5 4z" fill="#ffffff"/>
      </svg>
    `;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(48, 48),
      anchor: new google.maps.Point(24, 24),
    };
  }, []);

  const getRiderIcon = useCallback((rider: Rider, isSelected: boolean): google.maps.Icon => {
    const isCar = rider.id === 'r3';
    const isBusy = rider.status === 'busy';
    const bgColor = isSelected ? '#f97316' : isBusy ? '#ea580c' : '#10b981';
    const strokeColor = isSelected ? '#ffffff' : '#f8fafc';
    const size = isSelected ? 46 : 38;

    const pathData = isCar
      ? 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'
      : 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm7-10l-1.9-3.2c-.4-.7-1.1-1.1-1.9-1.1H5v2h3.2l1.4 2.4L7.8 12c-.5.8-.8 1.8-.8 2.8 0 .4 0 .7.1 1.1l2-.5c-.1-.2-.1-.4-.1-.6 0-.8.3-1.6.8-2.3l1.8-3.1 1.6 1.6v6h2v-7.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
        ${isSelected ? '<circle cx="20" cy="20" r="19" fill="#f97316" fill-opacity="0.35"/>' : ''}
        <rect x="6" y="6" width="28" height="28" rx="8" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${isSelected ? '2.5' : '2'}"/>
        <g transform="translate(8, 8) scale(1)">
          <path d="${pathData}" fill="#ffffff"/>
        </g>
      </svg>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(size / 2, size / 2),
    };
  }, []);

  const getDestinationIcon = useCallback((): google.maps.Icon => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="#10b981" fill-opacity="0.3"/>
        <circle cx="18" cy="18" r="12" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
        <path d="M18 10c-2.4 0-4.3 1.9-4.3 4.3 0 3.2 4.3 8.7 4.3 8.7s4.3-5.5 4.3-8.7c0-2.4-1.9-4.3-4.3-4.3zm0 5.6c-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3z" fill="#ffffff"/>
      </svg>
    `;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(36, 36),
      anchor: new google.maps.Point(18, 18),
    };
  }, []);

  // 1. Initialize Google Maps
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        const googleMaps = await loadGoogleMaps();
        if (!isMounted || !mapContainerRef.current) return;

        // Initialize Google Map instance
        const map = new googleMaps.Map(mapContainerRef.current, {
          center: RESTAURANT_LOCATION,
          zoom: 13,
          mapTypeId:
            mapTheme === 'satellite'
              ? googleMaps.MapTypeId.HYBRID
              : googleMaps.MapTypeId.ROADMAP,
          styles: mapTheme === 'dark' ? darkMapStyles : null,
          disableDefaultUI: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          mapTypeControl: false,
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
          },
          gestureHandling: 'greedy',
        });

        // Initialize Traffic Layer
        const trafficLayer = new googleMaps.TrafficLayer();
        trafficLayerRef.current = trafficLayer;
        if (showTraffic) {
          trafficLayer.setMap(map);
        }

        // Restaurant HQ Marker
        const hqMarker = new googleMaps.Marker({
          position: RESTAURANT_LOCATION,
          map,
          title: 'مطعمي برو - المقر الرئيسي',
          icon: getRestaurantIcon(),
          zIndex: 100,
        });

        const hqInfoWindow = new googleMaps.InfoWindow({
          content: `
            <div style="direction: rtl; font-family: Cairo, sans-serif; text-align: right; color: #0f172a; padding: 6px; max-width: 240px;">
              <h4 style="font-weight: 800; font-size: 14px; margin: 0 0 4px 0; color: #ea580c;">مطعمي برو - المقر الرئيسي</h4>
              <p style="font-size: 11px; margin: 0; color: #475569; line-height: 1.5;">نقطة انطلاق وتجهيز كافة طلبات التوصيل (مدينة نصر، القاهرة)</p>
            </div>
          `,
        });

        hqMarker.addListener('click', () => {
          if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
          hqInfoWindow.open(map, hqMarker);
          activeInfoWindowRef.current = hqInfoWindow;
        });

        hqMarkerRef.current = hqMarker;
        googleMapRef.current = map;
        setIsMapLoaded(true);
        setMapError(null);
      } catch (err: unknown) {
        console.error('Failed to load Google Maps:', err);
        if (isMounted) {
          setMapError((err as Error)?.message || 'تعذر تحميل خرائط Google Maps');
        }
      }
    }

    initMap();

    const riderMarkers = riderMarkersRef.current;
    const routePolylines = routePolylinesRef.current;
    const destinationMarkers = destinationMarkersRef.current;

    return () => {
      isMounted = false;
      // Cleanup markers
      riderMarkers.forEach((m) => m.setMap(null));
      riderMarkers.clear();
      routePolylines.forEach((p) => p.setMap(null));
      routePolylines.clear();
      destinationMarkers.forEach((d) => d.setMap(null));
      destinationMarkers.clear();
      if (hqMarkerRef.current) {
        hqMarkerRef.current.setMap(null);
        hqMarkerRef.current = null;
      }
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
        trafficLayerRef.current = null;
      }
      googleMapRef.current = null;
    };
  }, [getRestaurantIcon, mapTheme, showTraffic]);

  // 2. React to theme & traffic changes on Google Map
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || typeof google === 'undefined') return;

    if (mapTheme === 'dark') {
      map.setOptions({
        styles: darkMapStyles,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });
    } else if (mapTheme === 'streets') {
      map.setOptions({
        styles: [],
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });
    } else if (mapTheme === 'satellite') {
      map.setOptions({
        styles: [],
        mapTypeId: google.maps.MapTypeId.HYBRID,
      });
    }
  }, [mapTheme]);

  useEffect(() => {
    const map = googleMapRef.current;
    const traffic = trafficLayerRef.current;
    if (!map || !traffic) return;
    traffic.setMap(showTraffic ? map : null);
  }, [showTraffic]);

  // 3. Movement simulation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTrackingStates((prev) => {
        const nextState: Record<string, RiderTrackingState> = {};

        riders.forEach((rider) => {
          const current = prev[rider.id];
          if (!current || rider.status === 'offline') {
            if (current) nextState[rider.id] = current;
            return;
          }

          const waypoints = RIDER_ROUTES[rider.id] || [
            RESTAURANT_LOCATION,
            { lat: RESTAURANT_LOCATION.lat + 0.02, lng: RESTAURANT_LOCATION.lng + 0.02 },
          ];

          let { routeIndex, segmentProgress } = current;
          const { speed, battery } = current;

          // Increment progress along segment
          segmentProgress += 0.08;
          if (segmentProgress >= 1) {
            segmentProgress = 0;
            routeIndex += 1;
            if (routeIndex >= waypoints.length - 1) {
              routeIndex = 0;
            }
          }

          const p1 = waypoints[routeIndex];
          const p2 = waypoints[Math.min(routeIndex + 1, waypoints.length - 1)];

          // Interpolate coordinate
          const currentLat = p1.lat + (p2.lat - p1.lat) * segmentProgress;
          const currentLng = p1.lng + (p2.lng - p1.lng) * segmentProgress;

          // Speed fluctuation
          const newSpeed = Math.max(15, Math.min(52, speed + (Math.random() - 0.5) * 6));

          // Calculate distance to end
          const totalWaypoints = waypoints.length;
          const remainingSegments = Math.max(0, totalWaypoints - 1 - routeIndex);
          const distanceRemainingKm =
            Math.round((remainingSegments * 0.8 + (1 - segmentProgress) * 0.8) * 10) / 10;
          const etaMinutes = Math.max(1, Math.round((distanceRemainingKm / (newSpeed || 25)) * 60));

          nextState[rider.id] = {
            ...current,
            currentCoord: { lat: currentLat, lng: currentLng },
            routeIndex,
            segmentProgress,
            speed: Math.round(newSpeed),
            battery: Math.max(10, Math.round((battery - 0.02) * 100) / 100),
            distanceRemainingKm,
            etaMinutes,
          };
        });

        return nextState;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, riders]);

  // 4. Synchronize Google Map Markers, Polylines & Destination Pins
  useEffect(() => {
    const map = googleMapRef.current;
    if (!map || typeof google === 'undefined') return;

    riders.forEach((rider) => {
      const state = trackingStates[rider.id];
      if (!state) return;

      const isSelected = selectedRiderId === rider.id;
      const waypoints = RIDER_ROUTES[rider.id] || [];
      const hasOrder = riderOrdersMap.has(rider.id);
      const activeOrder = riderOrdersMap.get(rider.id);

      // --- Rider Marker ---
      let marker = riderMarkersRef.current.get(rider.id);
      const icon = getRiderIcon(rider, isSelected);

      if (!marker) {
        marker = new google.maps.Marker({
          position: state.currentCoord,
          map,
          title: rider.nameAr,
          icon,
          zIndex: isSelected ? 50 : 20,
        });

        marker.addListener('click', () => {
          setSelectedRiderId(rider.id);
        });

        riderMarkersRef.current.set(rider.id, marker);
      } else {
        marker.setPosition(state.currentCoord);
        marker.setIcon(icon);
        marker.setZIndex(isSelected ? 50 : 20);
      }

      // --- Route Polyline ---
      let polyline = routePolylinesRef.current.get(rider.id);
      if (waypoints.length > 0 && (isSelected || hasOrder)) {
        if (!polyline) {
          polyline = new google.maps.Polyline({
            path: waypoints,
            geodesic: true,
            strokeColor: isSelected ? '#f97316' : '#38bdf8',
            strokeOpacity: isSelected ? 0.95 : 0.45,
            strokeWeight: isSelected ? 5 : 3,
            map,
            zIndex: isSelected ? 30 : 10,
          });
          routePolylinesRef.current.set(rider.id, polyline);
        } else {
          polyline.setPath(waypoints);
          polyline.setOptions({
            strokeColor: isSelected ? '#f97316' : '#38bdf8',
            strokeOpacity: isSelected ? 0.95 : 0.45,
            strokeWeight: isSelected ? 5 : 3,
            zIndex: isSelected ? 30 : 10,
          });
        }
      } else if (polyline) {
        polyline.setMap(null);
        routePolylinesRef.current.delete(rider.id);
      }

      // --- Customer Destination Pin ---
      let destMarker = destinationMarkersRef.current.get(rider.id);
      const destinationCoord = waypoints[waypoints.length - 1];

      if (destinationCoord && isSelected && hasOrder && activeOrder) {
        const destIcon = getDestinationIcon();
        if (!destMarker) {
          destMarker = new google.maps.Marker({
            position: destinationCoord,
            map,
            title: `وجهة العميل: ${activeOrder.customerName}`,
            icon: destIcon,
            zIndex: 40,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="direction: rtl; font-family: Cairo, sans-serif; text-align: right; color: #0f172a; padding: 6px; min-width: 180px;">
                <div style="font-weight: bold; font-size: 13px; color: #059669; margin-bottom: 2px;">وجهة التسليم للعميل</div>
                <div style="font-size: 12px; font-weight: 600;">${activeOrder.customerName}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${activeOrder.address || 'القاهرة'}</div>
                <div style="font-size: 11px; font-weight: bold; color: #ea580c; margin-top: 4px;">طلب رقم: ${activeOrder.orderNumber}</div>
              </div>
            `,
          });

          destMarker.addListener('click', () => {
            if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
            infoWindow.open(map, destMarker);
            activeInfoWindowRef.current = infoWindow;
          });

          destinationMarkersRef.current.set(rider.id, destMarker);
        } else {
          destMarker.setPosition(destinationCoord);
        }
      } else if (destMarker) {
        destMarker.setMap(null);
        destinationMarkersRef.current.delete(rider.id);
      }
    });

    // Follow active rider if camera follow is enabled
    if (followRider && selectedRiderId && trackingStates[selectedRiderId]) {
      map.panTo(trackingStates[selectedRiderId].currentCoord);
    }
  }, [
    trackingStates,
    selectedRiderId,
    followRider,
    riders,
    riderOrdersMap,
    getRiderIcon,
    getDestinationIcon,
  ]);

  // Center on selected rider on selection
  const handleSelectRider = (riderId: string) => {
    setSelectedRiderId(riderId);
    const state = trackingStates[riderId];
    if (state && googleMapRef.current) {
      googleMapRef.current.panTo(state.currentCoord);
      googleMapRef.current.setZoom(15);
    }
  };

  const handleResetView = () => {
    if (googleMapRef.current) {
      googleMapRef.current.panTo(RESTAURANT_LOCATION);
      googleMapRef.current.setZoom(13);
    }
  };

  const selectedRider = riders.find((r) => r.id === selectedRiderId);
  const selectedState = selectedRiderId ? trackingStates[selectedRiderId] : null;
  const activeOrder = selectedRiderId ? riderOrdersMap.get(selectedRiderId) : null;

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <PageHeader
        title="المناديب والتوزيع"
        description="التتبع المباشر لخط سير المناديب وحركة الأسطول اللحظية عبر خرائط Google Maps"
      />

      {/* Sub-route navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-navy-900/80 border border-navy-800 rounded-2xl w-fit flex-wrap">
        <Link
          to="/dispatch"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
        >
          <Package className="w-4 h-4" />
          توزيع الطلبات
        </Link>
        <Link
          to="/dispatch/delivery"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
        >
          <Bike className="w-4 h-4" />
          المناديب (Delivery)
        </Link>
        <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/25">
          <Navigation className="w-4 h-4" />
          التتبع المباشر (Google Maps)
        </span>
        <Link
          to="/dispatch/custody"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
        >
          <UtensilsCrossed className="w-4 h-4" />
          العهد والخزينة
        </Link>
        <Link
          to="/dispatch/delivery-zones"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white transition-all"
        >
          <MapPin className="w-4 h-4" />
          مناطق وزونات التوصيل
        </Link>
      </div>

      {/* Main Grid: Google Map (Left/Center) & Riders Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Map Container (8 Cols) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-3">
          <div className="glass-card p-3 relative border border-navy-700/60 rounded-3xl overflow-hidden shadow-2xl">
            {/* Floating Top Controls Overlay */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-2 flex-wrap pointer-events-auto">
              {/* Live Status Pill */}
              <div className="flex items-center gap-2 bg-navy-950/90 backdrop-blur-md border border-navy-700/70 px-3 py-1.5 rounded-xl shadow-lg">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                      isPlaying ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isPlaying ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="text-xs font-bold text-white">
                  {isPlaying ? 'تتبع لحظي حي' : 'المحاكاة متوقفة'}
                </span>
              </div>

              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-xl bg-navy-950/90 hover:bg-navy-800 text-white border border-navy-700/70 flex items-center justify-center shadow-lg transition-all"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الحركة'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-amber-400" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              {/* Follow Camera Toggle */}
              <button
                type="button"
                onClick={() => setFollowRider(!followRider)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md shadow-lg transition-all ${
                  followRider
                    ? 'bg-brand-500 text-white border-brand-400'
                    : 'bg-navy-950/90 text-navy-300 border-navy-700/70 hover:text-white'
                }`}
                title="تثبيت الكاميرا وتتبع حركة المندوب تلقائياً"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>تثبيت الكاميرا</span>
              </button>

              {/* Reset to HQ button */}
              <button
                type="button"
                onClick={handleResetView}
                className="px-3 py-1.5 rounded-xl bg-navy-950/90 hover:bg-navy-800 text-navy-300 hover:text-white border border-navy-700/70 text-xs font-semibold backdrop-blur-md shadow-lg transition-all"
                title="التركيز على المقر الرئيسي للمطعم"
              >
                المقر الرئيسي
              </button>

              {/* Live Traffic Toggle */}
              <button
                type="button"
                onClick={() => setShowTraffic(!showTraffic)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md shadow-lg transition-all ${
                  showTraffic
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/20'
                    : 'bg-navy-950/90 text-navy-300 border-navy-700/70 hover:text-white'
                }`}
                title="عرض حركة المرور الحية في شوارع القاهرة"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>حركة المرور</span>
              </button>
            </div>

            {/* Floating Map Theme Switcher & Key Status (Top Left) */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 pointer-events-auto flex-wrap">
              <div className="flex items-center gap-1 bg-navy-950/90 backdrop-blur-md border border-navy-700/70 p-1 rounded-xl shadow-lg">
                <button
                  type="button"
                  onClick={() => setMapTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapTheme === 'dark'
                      ? 'bg-brand-500 text-white'
                      : 'text-navy-400 hover:text-white'
                  }`}
                  title="الوضع الليلي المتوافق مع ستايل المنصة"
                >
                  ليلي
                </button>
                <button
                  type="button"
                  onClick={() => setMapTheme('streets')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapTheme === 'streets'
                      ? 'bg-brand-500 text-white'
                      : 'text-navy-400 hover:text-white'
                  }`}
                  title="خريطة الشوارع من Google"
                >
                  شوارع
                </button>
                <button
                  type="button"
                  onClick={() => setMapTheme('satellite')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapTheme === 'satellite'
                      ? 'bg-brand-500 text-white'
                      : 'text-navy-400 hover:text-white'
                  }`}
                  title="صور الأقمار الصناعية الهجينة (Hybrid)"
                >
                  فضائي
                </button>
              </div>

              {/* API Key Status Pill */}
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950/90 hover:bg-navy-900 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-lg backdrop-blur-md transition-all"
                title="عرض معلومات مفتاح Google Maps API Key"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px]">Google Maps API ✓</span>
              </button>
            </div>

            {/* Error Message if Google Maps fails to load */}
            {mapError && (
              <div className="absolute inset-0 z-30 bg-navy-950/95 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">تعذر تحميل خرائط Google Maps</h4>
                <p className="text-sm text-navy-300 max-w-md mb-4">{mapError}</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                    إعادة المحاولة
                  </button>
                  <button
                    onClick={() => setIsKeyModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-200 text-xs font-bold transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                    فحص الـ API Key
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator while SDK initializes */}
            {!isMapLoaded && !mapError && (
              <div className="absolute inset-0 z-20 bg-navy-950/90 flex flex-col items-center justify-center p-6">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-semibold text-white">جاري تحميل خريطة Google Maps...</p>
                <p className="text-xs text-navy-400 mt-1">يتم التوصيل مع سيرفرات خرائط جوجل الرسمية</p>
              </div>
            )}

            {/* REAL GOOGLE MAP CONTAINER */}
            <div
              ref={mapContainerRef}
              className="w-full h-[580px] rounded-2xl overflow-hidden bg-navy-950 z-10"
              style={{ minHeight: '580px' }}
            />

            {/* Route Stats Ribbon (When a rider is selected) */}
            {selectedRider && selectedState && (
              <div className="mt-3 p-3.5 bg-navy-900/90 border border-navy-700/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
                    {selectedRider.id === 'r3' ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <Bike className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{selectedRider.nameAr}</span>
                      <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded font-mono">
                        {selectedRider.zoneAr}
                      </span>
                    </div>
                    <p className="text-navy-400 text-[11px] mt-0.5">
                      {activeOrder
                        ? `توصيل طلب ${activeOrder.orderNumber} إلى: ${
                            activeOrder.address || 'عنوان العميل'
                          }`
                        : 'في جولة توزيع نشطة'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono">
                  <div className="text-right">
                    <span className="text-navy-400 text-[10px] block">السرعة الحالية</span>
                    <span className="text-white font-bold text-sm flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-brand-400" />
                      {selectedState.speed} كم/س
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-navy-400 text-[10px] block">المسافة المتبقية</span>
                    <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedState.distanceRemainingKm} كم
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-navy-400 text-[10px] block">الوقت المتوقع (ETA)</span>
                    <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedState.etaMinutes} دقيقة
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-navy-400 text-[10px] block">شحن الهاتف</span>
                    <span className="text-sky-400 font-bold text-sm flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5" />
                      {Math.round(selectedState.battery)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fleet List & Selected Details (4 Cols) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Active Fleet List */}
          <div className="glass-card p-4 border border-navy-700/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Bike className="w-4 h-4 text-brand-400" />
                <span>المناديب على الخريطة</span>
              </h3>
              <span className="text-xs bg-navy-900 border border-navy-700 px-2 py-0.5 rounded-full text-brand-400 font-mono font-bold">
                {riders.filter((r) => r.status !== 'offline').length} نشط
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {riders.map((rider) => {
                const state = trackingStates[rider.id];
                const isSelected = selectedRiderId === rider.id;
                const isOnline = rider.status !== 'offline';
                const hasOrder = riderOrdersMap.has(rider.id);

                return (
                  <div
                    key={rider.id}
                    onClick={() => handleSelectRider(rider.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-brand-500/15 border-brand-500/60 shadow-md shadow-brand-500/10'
                        : 'bg-navy-900/50 border-navy-800/80 hover:border-navy-700 hover:bg-navy-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            hasOrder
                              ? 'bg-brand-500/20 text-brand-400'
                              : isOnline
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-navy-800 text-navy-500'
                          }`}
                        >
                          {rider.id === 'r3' ? (
                            <Truck className="w-4 h-4" />
                          ) : (
                            <Bike className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{rider.nameAr}</p>
                          <p className="text-navy-400 text-[10px] font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-brand-400" />
                            {rider.zoneAr}
                          </p>
                        </div>
                      </div>

                      {state && (
                        <div className="text-left font-mono">
                          <span className="text-[11px] text-white font-bold block">
                            {state.speed} كم/س
                          </span>
                          <span className="text-[10px] text-sky-400">
                            {Math.round(state.battery)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Rider Detailed Card */}
          {selectedRider && selectedState && (
            <div className="glass-card p-4 border border-navy-700/60 space-y-4 text-xs animate-scale-in">
              <div className="flex items-start justify-between pb-3 border-b border-navy-800">
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedRider.nameAr}</h4>
                  <p className="text-navy-400 text-xs font-mono">{selectedRider.phone}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedRider.status === 'busy'
                      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {selectedRider.status === 'busy' ? 'في مهمة توصيل' : 'متاح لطلب جديد'}
                </span>
              </div>

              {/* Active Delivery Order info if any */}
              {activeOrder ? (
                <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-navy-400 text-[11px]">الطلب المكلّف به:</span>
                    <span className="font-bold text-brand-400 font-mono text-sm">
                      {activeOrder.orderNumber}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-navy-300">
                      <span className="text-navy-400">العميل:</span>
                      <span className="font-medium">{activeOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between text-navy-300">
                      <span className="text-navy-400">العنوان:</span>
                      <span className="font-medium truncate max-w-[150px]">
                        {activeOrder.address || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-navy-300">
                      <span className="text-navy-400">المبلغ:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatCurrency(activeOrder.total)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/orders/${activeOrder.id}`)}
                    className="w-full mt-2 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-brand-400 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    عرض تفاصيل الطلب بالكامل
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-navy-950/50 border border-dashed border-navy-800 rounded-xl text-center text-navy-400">
                  <p className="text-xs">المندوب حر ومتاح لاستلام طلبات توصيل جديدة</p>
                  <Link
                    to="/dispatch"
                    className="inline-block mt-2 text-brand-400 hover:underline text-xs font-semibold"
                  >
                    إسناد طلب الآن &larr;
                  </Link>
                </div>
              )}

              {/* Contact Button */}
              <a
                href={`tel:${selectedRider.phone}`}
                className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-emerald-600 hover:text-white text-navy-200 border border-navy-700/60 font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                الاتصال بالمندوب ({selectedRider.phone})
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 border border-navy-700/80 rounded-3xl shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">إعدادات Google Maps API</h3>
                  <p className="text-navy-400 text-xs">حالة اتصال مفتاح الخريطة المباشر</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="text-navy-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-300">مفتاح Google Maps مفعّل ومتصل</p>
                  <p className="text-emerald-400/80 text-[11px] mt-0.5">
                    الخريطة تعمل الآن باستخدام الـ JavaScript SDK الرسمي لخرائط Google.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-navy-300 block mb-1 font-semibold">مفتاح الـ API Key الحالي:</label>
                <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl font-mono text-emerald-400 text-xs select-all break-all">
                  {GOOGLE_MAPS_API_KEY}
                </div>
              </div>

              <div className="p-3 bg-navy-900/60 border border-navy-800 rounded-xl text-navy-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-navy-400">المزود:</span>
                  <span className="font-bold text-white">Google Maps Platform</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">اللغة:</span>
                  <span className="text-white">العربية (ar) - مصر (EG)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-400">الميزات المتاحة:</span>
                  <span className="text-white">الوضع الليلي، صور الأقمار الصناعية، وحركة المرور الحية</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
