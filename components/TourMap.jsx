'use client';

import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function TourMap({ locations = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !containerRef.current || locations.length === 0) return;

    let map;
    let cancelled = false;

    // mapbox-gl touches `window`, so it's imported dynamically inside the
    // effect rather than at module scope (keeps SSR happy).
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (cancelled) return;
      mapboxgl.accessToken = token;

      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach((loc) => {
        bounds.extend(loc.coordinates);
      });

      map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/medohaytham1/cmq4s2s0s000j01qr3r283v4h',
        scrollZoom: false,
        bounds: bounds,
        fitBoundsOptions: {
          padding: { top: 200, bottom: 150, left: 100, right: 100 },
        },
      });
      mapRef.current = map;

      locations.forEach((loc) => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(loc.coordinates)
          .addTo(map);

        new mapboxgl.Popup({ 
          offset: 30, 
          focusAfterOpen: false,
        })
          .setLngLat(loc.coordinates)
          .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
          .addTo(map);
      });

      map.on('load', () => {
        map.resize();
      });
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [locations]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-grey-100 text-grey-500 text-sm px-6 text-center">
        Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local to show the route map.
      </div>
    );
  }

  return <div id="map" ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
