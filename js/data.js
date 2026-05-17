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
    { id: 'w1', brand: "Glenfiddich",         remaining: 750, logo: "https://logo.clearbit.com/glenfiddich.com" },
    { id: 'w2', brand: "Lagavulin",            remaining: 750, logo: "https://logo.clearbit.com/lagavulin.com" },
    { id: 'w3', brand: "Chivas Regal",         remaining: 750, logo: "https://logo.clearbit.com/chivas.com" },
    { id: 'w4', brand: "Johnnie Walker Black", remaining: 750, logo: "https://logo.clearbit.com/johnniewalker.com" },
    { id: 'w5', brand: "Yamazaki",             remaining: 750, logo: "https://logo.clearbit.com/suntory.com" },
  ],
  Vodka: [
    { id: 'v1', brand: "Grey Goose", remaining: 750, logo: "https://logo.clearbit.com/greygoose.com" },
    { id: 'v2', brand: "Absolut",    remaining: 750, logo: "https://logo.clearbit.com/absolut.com" },
  ],
  Gin: [
    { id: 'g1', brand: "Bombay Sapphire", remaining: 750, logo: "https://logo.clearbit.com/bombaysapphire.com" },
    { id: 'g2', brand: "Hendrick's",      remaining: 750, logo: "https://logo.clearbit.com/hendricksgin.com" },
  ],
  Wine: [
    { id: 'wi1', brand: "Cabernet Sauvignon", remaining: 750, logo: "" },
    { id: 'wi2', brand: "Merlot",             remaining: 750, logo: "" },
    { id: 'wi3', brand: "Pinot Noir",         remaining: 750, logo: "" },
  ],
  Tequila: [
    { id: 't1', brand: "Don Julio",  remaining: 750, logo: "https://logo.clearbit.com/donjulio.com" },
    { id: 't2', brand: "Cazadores", remaining: 750, logo: "https://logo.clearbit.com/cazadores.com" },
  ],
};

const PEG_ML = 30;
const BOTTLE_ML = 750;
const LOW_STOCK_THRESHOLD = 100;
