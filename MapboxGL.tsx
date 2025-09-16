import * as React from 'react';
import { Text, View, ViewProps } from 'react-native';
import Constants from 'expo-constants';


let GLOBAL_MAPBOX_TOKEN: string | null = null;


interface MapboxGLType {
  MapView: React.ComponentType<any>;
  Camera: React.ComponentType<any>;
  MarkerView: React.ComponentType<any>;
  PointAnnotation: React.ComponentType<any>;
  ShapeSource: React.ComponentType<any>;
  SymbolLayer: React.ComponentType<any>;
  Images: React.ComponentType<any>;
  setAccessToken: (token: string) => void;
}


/* fallback component for Expo Go */
const Fallback: React.FC<ViewProps> = (p) => (
  <View style={[{ minHeight:200,justifyContent:'center',alignItems:'center',backgroundColor:'#f0f0f0' }, p.style]}>
    <Text>Map Loading…</Text>
  </View>
);


let MapboxGL: MapboxGLType;


if (Constants.appOwnership === 'expo') {
  /* ─── Expo Go uses plain stubs ─── */
  MapboxGL = {
    MapView: Fallback,
    Camera: () => null,
    MarkerView: () => null,
    PointAnnotation: () => null,
    ShapeSource: () => null,
    SymbolLayer: () => null,
    Images: () => null,
    setAccessToken: () => {},
  };
} else {
  try {
    /* ───── pull BOTH default and named exports ───── */
    const MapboxDefault = require('@rnmapbox/maps').default;
    const {
      MapView,
      Camera,
      MarkerView,
      PointAnnotation,
      ShapeSource,
      SymbolLayer,
      Images,
      setAccessToken: nativeSetToken,
    } = require('@rnmapbox/maps');            // named exports
    /* ─────────────────────────────────────────────── */


    const env =
      process.env.MAPBOX_ACCESS_TOKEN ||
      process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
      process.env.MAPBOX_DOWNLOAD_TOKEN ||
      GLOBAL_MAPBOX_TOKEN;


    // ✅ FIXED: Accept both secret (sk.) and public (pk.) tokens
    const token = env && (env.startsWith('sk.') || env.startsWith('pk.')) ? env : null;
    
    // ✅ ADDED: Better logging for debugging
    console.log('🗺️ Mapbox Token Debug:', {
      hasToken: !!token,
      tokenType: token ? token.substring(0, 3) : 'NONE',
      buildVariant: process.env.APP_VARIANT || 'unknown'
    });
    
    if (!token) {
      throw new Error('Valid Mapbox token (sk.* or pk.*) required');
    }


    nativeSetToken(token);
    GLOBAL_MAPBOX_TOKEN = token;
    
    console.log('✅ Mapbox token set successfully');


    MapboxGL = {
      MapView,
      Camera,
      MarkerView,
      PointAnnotation,
      ShapeSource,
      SymbolLayer,
      Images,
      setAccessToken(t: string) {
        GLOBAL_MAPBOX_TOKEN = t;
        nativeSetToken(t);
        console.log('🔄 Mapbox token updated at runtime');
      },
    };
  } catch (err) {
    console.error('❌ Mapbox native load failed – falling back to stubs', err);
    MapboxGL = {
      MapView: Fallback,
      Camera: () => null,
      MarkerView: () => null,
      PointAnnotation: () => null,
      ShapeSource: () => null,
      SymbolLayer: () => null,
      Images: () => null,
      setAccessToken: () => {},
    };
  }
}


export default MapboxGL;
