import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, Feather } from '@expo/vector-icons';

const STATUS_BAR_INSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 54;

export default function MapScreen({ lang = 'ar', onBack }) {
  const isAr = lang === 'ar';
  const webViewRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fullscreen Satellite-only HTML with click-to-zoom
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; background: #FFFFFF; }
          .leaflet-control-zoom, .leaflet-control-attribution { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize map centered at Rosetta, Egypt with a pure white canvas
          var map = L.map('map', {
            center: [31.42, 30.41],
            zoom: 13.5,
            minZoom: 9,
            maxZoom: 18,
            zoomControl: false
          });

          // Pure Satellite Layer (Esri World Imagery) - Permanent & Unchangeable
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18
          }).addTo(map);

          // Click on any spot to smoothly center and zoom into it
          map.on('click', function(e) {
            var currentZoom = map.getZoom();
            var targetZoom = Math.min(currentZoom + 2, 18);
            map.flyTo(e.latlng, targetZoom, {
              animate: true,
              duration: 0.75
            });
          });

          // Control Bridges
          window.zoomIn = function() { map.zoomIn(); };
          window.zoomOut = function() { map.zoomOut(); };
          window.resetCenter = function() {
            map.flyTo([31.42, 30.41], 13.5, { animate: true, duration: 1 });
          };
        </script>
      </body>
    </html>
  `;

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript('window.zoomIn(); true;');
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript('window.zoomOut(); true;');
  };

  const handleResetCenter = () => {
    webViewRef.current?.injectJavaScript('window.resetCenter(); true;');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* 1. FULL-SCREEN MAP CANVAS */}
      <View style={styles.mapWrap}>
        {Platform.OS === 'web' ? (
          <iframe
            title="Rosetta Satellite Map"
            srcDoc={mapHtml}
            style={{ width: '100%', height: '100%', border: 'none', background: '#FFFFFF' }}
          />
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={styles.webView}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={() => setMapLoaded(true)}
          />
        )}

        {/* Pure White Loading Overlay While Map Tiles Render */}
        {!mapLoaded && Platform.OS !== 'web' && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0052CC" />
            <Text style={styles.loadingText}>
              {isAr ? 'جاري تحميل القمر الصناعي...' : 'Loading Satellite Map...'}
            </Text>
          </View>
        )}

        {/* 2. FLOATING BACK BUTTON ABOVE THE MAP */}
        <TouchableOpacity
          style={[
            styles.floatingBackBtn,
            isAr ? { right: 16 } : { left: 16 },
          ]}
          activeOpacity={0.85}
          onPress={onBack}
        >
          <Feather name={isAr ? 'arrow-right' : 'arrow-left'} size={20} color="#0052CC" />
        </TouchableOpacity>

        {/* 3. SATELLITE LIVE PILL (TOP CENTER) */}
        <View style={styles.statusPill}>
          <View style={styles.liveDot} />
          <Text style={styles.statusPillText}>
            {isAr ? 'قمر صناعي مباشر • رشيد' : 'Live Satellite ✦ Rasheed City'}
          </Text>
        </View>

        {/* 4. GOOGLE MAPS STYLE ZOOM & COMPASS CONTROLS (RIGHT) */}
        <View style={styles.controlsColumn}>
          {/* Compass / Reset View */}
          <TouchableOpacity
            style={styles.mapBtn}
            activeOpacity={0.8}
            onPress={handleResetCenter}
          >
            <Ionicons name="compass-outline" size={22} color="#0052CC" />
          </TouchableOpacity>

          {/* Zoom In */}
          <TouchableOpacity
            style={[styles.mapBtn, styles.zoomTop]}
            activeOpacity={0.8}
            onPress={handleZoomIn}
          >
            <Feather name="plus" size={19} color="#0B2B64" />
          </TouchableOpacity>

          {/* Zoom Out */}
          <TouchableOpacity
            style={[styles.mapBtn, styles.zoomBottom]}
            activeOpacity={0.8}
            onPress={handleZoomOut}
          >
            <Feather name="minus" size={19} color="#0B2B64" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background
  },
  mapWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white map container
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background while tiles load
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF', // Clean white rendering backdrop
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 2,
  },
  loadingText: {
    color: '#0B2B64',
    fontSize: 13,
    fontWeight: '700',
  },

  /* FLOATING BACK BUTTON */
  floatingBackBtn: {
    position: 'absolute',
    top: STATUS_BAR_INSET,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4E2F4',
    zIndex: 99,
  },

  /* TOP CENTER STATUS PILL */
  statusPill: {
    position: 'absolute',
    top: STATUS_BAR_INSET + 6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4E2F4',
    gap: 7,
    zIndex: 90,
  },
  liveDot: {
    width: 7.5,
    height: 7.5,
    borderRadius: 4,
    backgroundColor: '#00A859',
  },
  statusPillText: {
    color: '#0B2B64',
    fontSize: 11.5,
    fontWeight: '800',
  },

  /* MAP CONTROLS */
  controlsColumn: {
    position: 'absolute',
    right: 16,
    bottom: 40,
    gap: 8,
    zIndex: 90,
  },
  mapBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1.5,
    borderColor: '#D4E2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomTop: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    marginBottom: -4,
  },
  zoomBottom: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
});