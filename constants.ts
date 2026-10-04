
import { Resort, SnowcardTiers } from './types';

export const INITIAL_RESORTS: Resort[] = [
  { id: '1', name: 'Skiwelt Wilder Kaiser', dailyPrice: 76.00, lat: 47.51, lng: 12.23 },
  { id: '2', name: 'Christlum Achenkirch', dailyPrice: 68.00, lat: 47.53, lng: 11.71 },
  { id: '3', name: 'Wildschönau', dailyPrice: 68.50, lat: 47.45, lng: 12.04 },
  { id: '4', name: 'Steinplatte', dailyPrice: 63.00, lat: 47.60, lng: 12.58 },
  { id: '5', name: 'St. Johann', dailyPrice: 62.00, lat: 47.52, lng: 12.42 },
  { id: '6', name: 'Spieljoch Fügen', dailyPrice: 79.00, lat: 47.34, lng: 11.85 },
  { id: '7', name: 'Lermoos Grubigstein', dailyPrice: 68.00, lat: 47.39, lng: 10.88 },
  { id: '8', name: 'Ehrwald Almbahn', dailyPrice: 68.00, lat: 47.39, lng: 10.95 },
  { id: '9', name: 'Hochfügen Zillertal', dailyPrice: 79.00, lat: 47.29, lng: 11.78 },
  { id: '10', name: 'Seefeld Rosshütte', dailyPrice: 59.50, lat: 47.33, lng: 11.20 },
  { id: '11', name: 'Zillertal Arena Gerlos', dailyPrice: 79.00, lat: 47.22, lng: 12.03 },
  { id: '12', name: 'Berwang', dailyPrice: 68.00, lat: 47.40, lng: 10.74 },
  { id: '13', name: 'Fieberbrunn', dailyPrice: 79.00, lat: 47.47, lng: 12.55 },
  { id: '14', name: 'Kitzbühel', dailyPrice: 79.50, lat: 47.44, lng: 12.39 },
  { id: '15', name: 'Mayrhofen', dailyPrice: 79.00, lat: 47.16, lng: 11.86 },
  { id: '16', name: 'Schlick 2000', dailyPrice: 58.50, lat: 47.16, lng: 11.31 },
  { id: '17', name: 'Axamer Lizum', dailyPrice: 63.00, lat: 47.18, lng: 11.29 },
  { id: '18', name: 'Hintertuxer Gletscher', dailyPrice: 79.00, lat: 47.06, lng: 11.67 },
  { id: '19', name: 'Kühtai', dailyPrice: 62.00, lat: 47.21, lng: 11.02 },
  { id: '20', name: 'Stubaier Gletscher', dailyPrice: 72.50, lat: 46.98, lng: 11.11 },
  { id: '21', name: 'Zell am Ziller', dailyPrice: 79.00, lat: 47.23, lng: 11.88 },
  { id: '22', name: 'Sölden', dailyPrice: 83.00, lat: 46.96, lng: 11.00 },
  { id: '23', name: 'Obergurgl-Hochgurgl', dailyPrice: 79.00, lat: 46.87, lng: 11.02 }
];

export const DEFAULT_SNOWCARD_TIERS: SnowcardTiers = {
  normal: 1050,
  vorverkauf: 966,
  ermassigt: 840
};
