// api/create-checkout-session.js
//
// Fonction serverless (Vercel) qui crée une session de paiement Stripe.
// C'est ICI, et uniquement ici, que la clé secrète Stripe est utilisée —
// jamais dans le code du site visible par les visiteurs.

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Catalogue "source de vérité" côté serveur.
// IMPORTANT : on ne fait JAMAIS confiance aux prix envoyés par le navigateur.
// Le client envoie seulement des ID + quantités, le serveur recalcule les prix
// à partir de cette liste. Ça évite qu'un visiteur malintentionné modifie
// le prix dans le code du site pour payer moins cher.
const PRODUCTS = {
  1:  { name: 'iPhone 12 · 64 Go',                price: 329  },
  2:  { name: 'iPhone 13 · 128 Go',               price: 419  },
  3:  { name: 'iPhone 14 · 128 Go',               price: 519  },
  4:  { name: 'iPhone 15 · 256 Go',               price: 799  },
  15: { name: 'iPhone 13 · 256 Go',               price: 479  },
  16: { name: 'iPhone 13 · 512 Go',               price: 599  },
  17: { name: 'iPhone 13 Pro Max · 128 Go',       price: 509  },
  18: { name: 'iPhone 13 Pro Max · 256 Go',       price: 569  },
  19: { name: 'iPhone 15 Pro · 128 Go',            price: 749  },
  20: { name: 'iPhone 15 Pro · 256 Go',            price: 839  },
  21: { name: 'iPhone 15 Pro · 512 Go',            price: 989  },
  22: { name: 'iPhone 15 Pro · 1 To',              price: 1149 },
  23: { name: 'iPhone 15 Pro Max · 256 Go',        price: 859  },
  24: { name: 'iPhone 15 Pro Max · 512 Go',        price: 999  },
  25: { name: 'iPhone 15 Pro Max · 1 To',          price: 1179 },
  26: { name: 'iPhone 16 · 128 Go',                price: 569  },
  27: { name: 'iPhone 16 · 256 Go',                price: 649  },
  28: { name: 'iPhone 16 · 512 Go',                price: 799  },
  29: { name: 'iPhone 16 Pro Max · 256 Go',        price: 929  },
  30: { name: 'iPhone 16 Pro Max · 512 Go',        price: 1069 },
  31: { name: 'iPhone 16 Pro Max · 1 To',          price: 1219 },
  32: { name: 'iPhone 17 · 256 Go',                price: 669  },
  34: { name: 'iPhone 12 · 128 Go',                price: 369  },
  35: { name: 'iPhone 12 · 256 Go',                price: 429  },
  36: { name: 'iPhone 14 · 256 Go',                price: 579  },
  37: { name: 'iPhone 14 · 512 Go',                price: 699  },
  33: { name: 'iPhone 17 · 512 Go',                price: 849  },
  38: { name: 'iPhone 17 Pro · 256 Go',             price: 869  },
  39: { name: 'iPhone 17 Pro · 512 Go',             price: 1019 },
  40: { name: 'iPhone 17 Pro · 1 To',               price: 1179 },
  41: { name: 'iPhone 17 Pro Max · 256 Go',         price: 999  },
  42: { name: 'iPhone 17 Pro Max · 512 Go',         price: 1149 },
  43: { name: 'iPhone 17 Pro Max · 1 To',           price: 1299 },
  44: { name: 'iPhone 17 Pro Max · 2 To',           price: 1599 },
  45: { name: 'iPhone 15 · 128 Go',                price: 699  },
  46: { name: 'iPhone 15 · 512 Go',                price: 929  },
  47: { name: 'iPhone 12 Pro · 128 Go',            price: 469  },
  48: { name: 'iPhone 12 Pro · 256 Go',            price: 529  },
  49: { name: 'iPhone 12 Pro · 512 Go',            price: 629  },
  50: { name: 'iPhone 12 Pro Max · 128 Go',        price: 489  },
  51: { name: 'iPhone 12 Pro Max · 256 Go',        price: 549  },
  52: { name: 'iPhone 12 Pro Max · 512 Go',        price: 649  },
  53: { name: 'iPhone 14 Pro · 128 Go',            price: 629  },
  54: { name: 'iPhone 14 Pro · 256 Go',            price: 719  },
  55: { name: 'iPhone 14 Pro · 512 Go',            price: 869  },
  56: { name: 'iPhone 14 Pro · 1 To',              price: 1029 },
  57: { name: 'iPhone 14 Pro Max · 128 Go',        price: 809  },
  58: { name: 'iPhone 14 Pro Max · 256 Go',        price: 899  },
  59: { name: 'iPhone 14 Pro Max · 512 Go',        price: 1049 },
  60: { name: 'iPhone 14 Pro Max · 1 To',          price: 1209 },
  61: { name: 'Galaxy A56 · 128 Go',               price: 299  },
  62: { name: 'Galaxy A56 · 256 Go',               price: 329  },
  63: { name: 'Galaxy S25+ · 256 Go',              price: 699  },
  64: { name: 'Galaxy S25 Ultra · 256 Go',         price: 759  },
  65: { name: 'Galaxy S25 Ultra · 512 Go',         price: 839  },
  66: { name: 'Galaxy S25 Ultra · 1 To',           price: 979  },
  67: { name: 'Galaxy S26 · 256 Go',               price: 599  },
  68: { name: 'Galaxy S26 · 512 Go',               price: 679  },
  69: { name: 'Galaxy S25+ · 512 Go',              price: 769  },
  70: { name: 'Galaxy Z Flip 6 · 256 Go',          price: 629  },
  71: { name: 'Galaxy Z Flip 6 · 512 Go',          price: 709  },
  72: { name: 'Galaxy Z Fold 7 · 256 Go',          price: 1249 },
  73: { name: 'Galaxy Z Fold 7 · 512 Go',          price: 1329 },
  74: { name: 'Galaxy Z Fold 7 · 1 To',            price: 1459 },
  75: { name: 'MacBook Neo · 256 Go',              price: 479  },
  76: { name: 'MacBook Neo · 512 Go',              price: 559  },
  77: { name: 'MacBook Pro M5 · 1 To',             price: 1429 },
  78: { name: 'MacBook Air 13" (2026) · 512 Go',   price: 909  },
  79: { name: 'AirPods Pro 2',                     price: 49   },
  80: { name: 'AirPods Max',                       price: 249  },
  81: { name: 'Apple Watch Ultra 2',                price: 519  },
  82: { name: 'Apple Watch Ultra 3',                price: 589  },
  83: { name: 'iPad 11 (2025, A16) · 128 Go · WiFi',        price: 309  },
  85: { name: 'iPad 11 (2025, A16) · 256 Go · WiFi',        price: 389  },
  86: { name: 'iPad 11 (2025, A16) · 512 Go · WiFi',        price: 519  },
  84: { name: 'iPad Air 7 (2025, M3) · 11" · 128 Go · WiFi', price: 489  },
  87: { name: 'iPad Air 7 (2025, M3) · 11" · 256 Go · WiFi', price: 569  },
  88: { name: 'iPad Air 7 (2025, M3) · 11" · 512 Go · WiFi', price: 709  },
  89: { name: 'iPad Air 7 (2025, M3) · 11" · 1 To · WiFi',   price: 849  },
  90: { name: 'iPad Air 7 (2025, M3) · 13" · 128 Go · WiFi', price: 609  },
  91: { name: 'iPad Air 7 (2025, M3) · 13" · 256 Go · WiFi', price: 689  },
  92: { name: 'iPad Air 7 (2025, M3) · 13" · 512 Go · WiFi', price: 829  },
  93: { name: 'iPad Air 7 (2025, M3) · 13" · 1 To · WiFi',   price: 969  },
  94: { name: 'iPad Pro (2025, M5) · 11" · 256 Go · WiFi',   price: 669  },
  95: { name: 'iPad Pro (2025, M5) · 11" · 512 Go · WiFi',   price: 749  },
  96: { name: 'iPad Pro (2025, M5) · 13" · 256 Go · WiFi',   price: 789  },
  97: { name: 'iPad Pro (2025, M5) · 13" · 512 Go · WiFi',   price: 869  },
};

module.exports = async (req, res) => {
  // CORS basique (utile si le front est servi depuis un domaine différent de l'API)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { items } = req.body; // items = [{ id: 4, qty: 1 }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide' });
    }

    const line_items = items.map(({ id, qty }) => {
      const product = PRODUCTS[id];
      if (!product) throw new Error('Produit inconnu : ' + id);
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
        throw new Error('Quantité invalide pour le produit ' + id);
      }
      return {
        price_data: {
          currency: 'eur',
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100), // Stripe attend des centimes
        },
        quantity: qty,
      };
    });

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      shipping_address_collection: {
        allowed_countries: ['AC','AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CV','CW','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MK','ML','MM','MN','MO','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SZ','TA','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','US','UY','UZ','VA','VC','VE','VG','VN','VU','WF','WS','XK','YE','YT','ZA','ZM','ZW','ZZ'],
      },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/index.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
};
