const CATEGORIES = {
  Whisky: {
    emoji: '🥃',
    color: '#d4a017',
    darkBg: '#1c1200',
    cardBg: '#201500',
    border: '#a07810',
    fillGlow: '#d4a01755',
  },
  Vodka: {
    emoji: '🍸',
    color: '#64b5f6',
    darkBg: '#001a2c',
    cardBg: '#002035',
    border: '#1565c0',
    fillGlow: '#64b5f655',
  },
  Gin: {
    emoji: '🌿',
    color: '#66bb6a',
    darkBg: '#001a0e',
    cardBg: '#002014',
    border: '#2e7d32',
    fillGlow: '#66bb6a55',
  },
  Wine: {
    emoji: '🍷',
    color: '#ef5350',
    darkBg: '#1a0000',
    cardBg: '#220000',
    border: '#b71c1c',
    fillGlow: '#ef535055',
  },
  Tequila: {
    emoji: '🌵',
    color: '#ffca28',
    darkBg: '#1a1400',
    cardBg: '#201a00',
    border: '#f57f17',
    fillGlow: '#ffca2855',
  },
};

const DEFAULT_INVENTORY = {
  Whisky: [
    { id: 'w1', brand: "Glenfiddich",         remaining: 750, logo: "images/glenfiddich.svg" },
    { id: 'w2', brand: "Lagavulin",            remaining: 750, logo: "images/lagavulin.svg" },
    { id: 'w3', brand: "Chivas Regal",         remaining: 750, logo: "images/chivas.svg" },
    { id: 'w4', brand: "Johnnie Walker Black", remaining: 750, logo: "images/johnniewalker.svg" },
    { id: 'w5', brand: "Yamazaki",             remaining: 750, logo: "images/yamazaki.svg" },
  ],
  Vodka: [
    { id: 'v1', brand: "Grey Goose", remaining: 750, logo: "images/greygoose.svg" },
    { id: 'v2', brand: "Absolut",    remaining: 750, logo: "images/absolut.svg" },
  ],
  Gin: [
    { id: 'g1', brand: "Bombay Sapphire", remaining: 750, logo: "images/bombay.svg" },
    { id: 'g2', brand: "Hendrick's",      remaining: 750, logo: "images/hendricks.jpg" },
  ],
  Wine: [
    { id: 'wi1', brand: "Cabernet Sauvignon", remaining: 750, logo: "images/cabernet.svg" },
    { id: 'wi2', brand: "Merlot",             remaining: 750, logo: "images/merlot.svg" },
    { id: 'wi3', brand: "Pinot Noir",         remaining: 750, logo: "images/pinotnoir.svg" },
  ],
  Tequila: [
    { id: 't1', brand: "Don Julio",  remaining: 750, logo: "images/donjulio.svg" },
    { id: 't2', brand: "Cazadores", remaining: 750, logo: "images/cazadores.svg" },
  ],
};

const PEG_ML = 30;
const BOTTLE_ML = 750;
const LOW_STOCK_THRESHOLD = 100;
