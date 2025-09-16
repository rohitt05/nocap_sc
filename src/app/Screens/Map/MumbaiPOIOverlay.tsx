import React, { useMemo } from 'react';
import MapboxGL from '../../../../MapboxGL';
import locations from './locations.json';

// 1️⃣  add one local PNG you ship with the app
const poiIcon = require('../../../../assets/hattori.webp');   // 44 × 44 PNG

const MumbaiPOIOverlay: React.FC = () => {
    /* build GeoJSON once */
    const geoJSON = useMemo(() => {
        const features: any[] = [];
        Object.entries(locations as Record<string, any[]>).forEach(([cat, arr]) =>
            arr.forEach((p, i) =>
                features.push({
                    type: 'Feature',
                    id: `${cat}-${i}`,
                    geometry: { type: 'Point', coordinates: [p.coordinates.lng, p.coordinates.lat] },
                }),
            ),
        );
        return { type: 'FeatureCollection', features };
    }, []);

    return (
        <>
            {/* 2️⃣  register the icon exactly once */}
            <MapboxGL.Images images={{ poi: poiIcon }} />

            {/* 3️⃣  draw all points with that icon */}
            <MapboxGL.ShapeSource id="mumbai-poi-src" shape={geoJSON}>
               /* style block — replace the old one */
                <MapboxGL.SymbolLayer
                    id="mumbai-poi-layer"
                    style={{
                        iconImage: 'poi',        // icon is registered above via <Images>
                        iconSize: 0.55,          // 0.55 × original image
                        iconOffset: [0, -6],     // lift the pin 6 px so its tip touches the spot
                        iconAllowOverlap: true,  // don’t let Mapbox hide icons that collide
                        iconOpacity: 0.9,        // a touch of transparency
                    }}
                />

            </MapboxGL.ShapeSource>
        </>
    );
};

export default MumbaiPOIOverlay;
