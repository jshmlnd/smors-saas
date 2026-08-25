import mongoose from 'mongoose'
import AdminUser from '../models/AdminUser.js'
import Product from '../models/Product.js'
import { env } from '../config/env.js'
import { slugify } from '../utils/ids.js'

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`
const P = {
  teeWhite: img('photo-1521572163474-6864f9cf17ab'),
  teeRack: img('photo-1523381210434-271e8be1f52b'),
  teeMock: img('photo-1602810318383-e386cc2a3ccf'),
  teeStack: img('photo-1620799140408-edc6dcb6d633'),
  shirtHanger: img('photo-1562157873-818bc0726f68'),
  shirtFolded: img('photo-1596755094514-f87e34085b2c'),
  jeansPair: img('photo-1542272604-787c3835535d'),
  jeansBed: img('photo-1541099649105-f69ad21f3246'),
  pantsFold: img('photo-1624378439575-d8705ad7ae80'),
  shoeRed: img('photo-1542291026-7eec264c27ff'),
  shoePair: img('photo-1595950653106-6c9ebd614d3a'),
  shoeWhite: img('photo-1552346154-21d32810aba3'),
  shoeFeet: img('photo-1600185365483-26d7a4cc7519'),
  shoeWall: img('photo-1491553895911-0055eca6402d'),
  hoodWear: img('photo-1556821840-3a63f95609a7'),
  jacketLeather: img('photo-1551028719-00167b16eac5'),
  jacketPerson: img('photo-1591047139829-d91aecb6caea'),
  jacketDenim: img('photo-1556905055-8f358a7a47b2'),
  store: img('photo-1441986300917-64674bd600d8'),
  rackClothes: img('photo-1489987707025-afc232f7ea0f')
}

const TOP_SIZES = ['S', 'M', 'L', 'XL']
const WAIST = ['30', '32', '34', '36']
const SHOE = ['8', '8.5', '9', '9.5', '10', '11']

const PRODUCTS = [
  {
    name: 'Vintage Racing Graphic Tee',
    brand: 'Vintage',
    category: 'tees',
    condition: 'thrifted',
    price: 280,
    compareAtPrice: null,
    sizes: ['M', 'L', 'XL'],
    tags: ['graphic', 'racing', 'y2k', 'vintage'],
    images: [P.teeMock, P.teeWhite],
    stock: 1,
    featured: true,
    description: 'Single-stitch racing graphic from the early 2000s. Faded just right — boxy fit, zero holes.'
  },
  {
    name: 'Y2K Skate Brand Tee',
    brand: 'Unbranded',
    category: 'tees',
    condition: 'pre-loved',
    price: 320,
    sizes: ['S', 'M'],
    tags: ['y2k', 'skate', 'graphic'],
    images: [P.teeStack, P.teeMock],
    stock: 1,
    description: 'Chunky print, oversized street fit. A time capsule from the peak skate-core era.'
  },
  {
    name: 'Carhartt Work Shirt',
    brand: 'Carhartt',
    category: 'shirts',
    condition: 'like-new',
    price: 750,
    compareAtPrice: 1800,
    sizes: ['M', 'L'],
    tags: ['workwear', 'flannel', 'duck canvas'],
    images: [P.shirtHanger, P.shirtFolded],
    stock: 1,
    featured: true,
    description: 'Heavy duck canvas Carhartt in near-mint shape. Breaks in like a dream, lasts forever.'
  },
  {
    name: 'Navy Oxford Button-Down',
    brand: 'Uniqlo',
    category: 'shirts',
    condition: 'thrifted',
    price: 380,
    sizes: TOP_SIZES,
    tags: ['oxford', 'button down', 'smart casual'],
    images: [P.shirtFolded, P.rackClothes],
    stock: 2,
    description: 'Clean navy oxford that dresses up or down. Wrinkle-resistant weave, no stains.'
  },
  {
    name: 'Cargo Shorts (Khaki)',
    brand: 'Dickies',
    category: 'shorts',
    condition: 'thrifted',
    price: 350,
    sizes: WAIST,
    tags: ['cargo', 'khaki', 'utility'],
    images: [P.pantsFold],
    stock: 1,
    description: 'Utility cargos with deep pockets and sturdy twill. Summer hustle uniform.'
  },
  {
    name: 'Distressed Denim Shorts',
    brand: 'Levi\'s',
    category: 'shorts',
    condition: 'pre-loved',
    price: 420,
    sizes: WAIST,
    tags: ['denim', 'jorts', 'distressed'],
    images: [P.jeansPair],
    stock: 1,
    description: 'Cut-off jorts with honest wear. Raw hems, perfect fade, all character.'
  },
  {
    name: 'Levi\'s 501 Straight Jeans',
    brand: 'Levi\'s',
    category: 'pants',
    condition: 'pre-loved',
    price: 950,
    compareAtPrice: 3200,
    sizes: ['30', '32', '34'],
    tags: ['501', 'denim', 'straight leg', 'selvedge'],
    images: [P.jeansPair, P.jeansBed],
    stock: 1,
    featured: true,
    description: 'The icon. True straight 501s with a golden honeycomb fade. Measured flat, listed honestly.'
  },
  {
    name: 'Dickies 874 Work Pants',
    brand: 'Dickies',
    category: 'pants',
    condition: 'thrifted',
    price: 680,
    sizes: ['32', '34', '36'],
    tags: ['874', 'workwear', 'charcoal'],
    images: [P.pantsFold],
    stock: 1,
    description: 'Charcoal 874s, the skater workhorse. Creases set, waistband solid.'
  },
  {
    name: 'Nike Air Force 1 \'07',
    brand: 'Nike',
    category: 'shoes',
    condition: 'like-new',
    price: 2800,
    compareAtPrice: 6395,
    sizes: SHOE,
    tags: ['af1', 'air force', 'sneakers', 'white'],
    images: [P.shoeWhite, P.shoeFeet],
    stock: 1,
    featured: true,
    description: 'Triple whites worn twice. Soles clean, no yellowing — professionally sanitized.'
  },
  {
    name: 'Converse Chuck 70 Hi',
    brand: 'Converse',
    category: 'shoes',
    condition: 'pre-loved',
    price: 1600,
    sizes: SHOE,
    tags: ['chuck taylor', 'converse', 'hi tops'],
    images: [P.shoePair],
    stock: 1,
    description: 'Chuck 70s with broken-in canvas and intact stitching. Laces swapped fresh.'
  },
  {
    name: 'Vans Old Skool Checkerboard',
    brand: 'Vans',
    category: 'shoes',
    condition: 'thrifted',
    price: 1200,
    sizes: ['8', '9', '10'],
    tags: ['old skool', 'checkerboard', 'vans'],
    images: [P.shoeWall],
    stock: 1,
    description: 'Checkerboards with stories to tell. Solid soles, minor scuffs shown in photos.'
  },
  {
    name: 'Oversized Washed Black Hoodie',
    brand: 'H&M',
    category: 'hoodies',
    condition: 'like-new',
    price: 850,
    sizes: TOP_SIZES,
    tags: ['oversized', 'washed black', 'streetwear'],
    images: [P.hoodWear],
    stock: 2,
    description: 'Heavyweight fleece with a faded wash. Drop shoulders, boxy cut — layer-ready.'
  },
  {
    name: 'Champion Reverse Weave Hoodie',
    brand: 'Champion',
    category: 'hoodies',
    condition: 'pre-loved',
    price: 1450,
    compareAtPrice: 4000,
    sizes: ['L', 'XL'],
    tags: ['reverse weave', 'champion', '90s'],
    images: [P.hoodWear, P.rackClothes],
    stock: 1,
    featured: true,
    description: '90s reverse weave that shrugs off shrinkage. Thick, boxy, built different.'
  },
  {
    name: 'Stüssy Basic Logo Hoodie',
    brand: 'Stüssy',
    category: 'hoodies',
    condition: 'pre-loved',
    price: 1300,
    sizes: ['M', 'L'],
    tags: ['stussy', 'logo', 'streetwear'],
    images: [P.hoodWear],
    stock: 1,
    description: 'Classic stock-logo Stüssy. Authenticity checked, print fully intact.'
  },
  {
    name: 'The North Face Nuptse 1996 Jacket',
    brand: 'The North Face',
    category: 'jackets',
    condition: 'like-new',
    price: 3800,
    compareAtPrice: 12500,
    sizes: ['M', 'L'],
    tags: ['nuptse', 'puffer', '700 fill', 'tnf'],
    images: [P.jacketPerson],
    stock: 1,
    featured: true,
    description: 'Iconic 700-fill puffer in black. Zipper runs smooth, baffles full, no leaks.'
  },
  {
    name: 'Vintage Leather Bomber',
    brand: 'Vintage',
    category: 'jackets',
    condition: 'thrifted',
    price: 1900,
    sizes: ['M', 'L'],
    tags: ['leather', 'bomber', 'vintage'],
    images: [P.jacketLeather],
    stock: 1,
    description: 'Genuine leather bomber conditioned by our resto team. Supple, lined, warm.'
  },
  {
    name: 'Adidas Firebird Track Jacket',
    brand: 'Adidas',
    category: 'jackets',
    condition: 'like-new',
    price: 1500,
    sizes: TOP_SIZES,
    tags: ['firebird', 'track jacket', 'adidas'],
    images: [P.jacketDenim],
    stock: 1,
    description: 'Firebird tricot in pristine shape. Three stripes straight, trefoil clean.'
  },
  {
    name: 'Polo Ralph Lauren Rugby Shirt',
    brand: 'Polo Ralph Lauren',
    category: 'shirts',
    condition: 'pre-loved',
    price: 820,
    sizes: ['M', 'L', 'XL'],
    tags: ['polo', 'rugby', 'ralph lauren'],
    images: [P.shirtHanger],
    stock: 1,
    description: 'Heavy cotton rugby with embroidered pony. Collar crisp, colors locked in.'
  }
]

async function main() {
  const ok = await mongoose
    .connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => true)
    .catch(() => false)

  if (!ok) {
    console.error('[SMORS SEED] Cannot reach MongoDB at', env.MONGO_URI)
    process.exit(1)
  }

  await AdminUser.deleteMany({})
  await AdminUser.create({
    email: env.ADMIN_EMAIL,
    passwordHash: AdminUser.hashPassword(env.ADMIN_PASSWORD)
  })
  console.log(`[SMORS SEED] Admin ready → ${env.ADMIN_EMAIL}`)

  const existing = await Product.countDocuments()
  if (existing === 0 || process.argv.includes('--fresh')) {
    if (existing > 0) await Product.deleteMany({})
    await Product.insertMany(PRODUCTS.map((p) => ({ ...p, slug: slugify(p.name) })))
    console.log(`[SMORS SEED] Seeded ${PRODUCTS.length} products`)
  } else {
    console.log(`[SMORS SEED] Products already exist (${existing}) — skipped. Use --fresh to reset.`)
  }

  await mongoose.disconnect()
  console.log('[SMORS SEED] Done')
}

main()
