export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export const MAP_TILE_LAYERS = {
  streets: {
    name: "Streets",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    darkUrl:
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: `${MAP_TILE_ATTRIBUTION}, &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    maxZoom: 20,
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    darkUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    darkUrl: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: `${MAP_TILE_ATTRIBUTION}, &copy; <a href="https://opentopomap.org">OpenTopoMap</a>`,
    maxZoom: 17,
  },
} as const
