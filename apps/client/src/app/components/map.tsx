import React, { useEffect } from 'react';
import { LngLat, LngLatBounds, Map as Mapbox } from 'mapbox-gl';
import { FullContainer } from '@lucky-parking/ui';
import 'mapbox-gl/dist/mapbox-gl.css';

const LA_COUNTY_SW_POS = new LngLat(-117.646374, 34.823302);
const LA_COUNTY_NE_POS = new LngLat(-118.951721, 32.75004);
const LA_COUNTY_BOUNDS = new LngLatBounds(LA_COUNTY_SW_POS, LA_COUNTY_NE_POS);

function Map() {
  const container = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<Mapbox | null>(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new Mapbox({
      accessToken: process.env['NX_MAPBOX_TOKEN'],
      container: container.current as HTMLElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      bounds: LA_COUNTY_BOUNDS,
      zoom: 12,
    });
  }, []);

  return <FullContainer ref={container} />;
}

export default Map;
