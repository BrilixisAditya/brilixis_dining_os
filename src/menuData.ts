export interface MenuItem {
  id: string;
  name: string;
  category: 'starters' | 'appetizers' | 'main course' | 'beverages' | 'desserts';
  price: number;
  isVeg: boolean;
  isSignature?: boolean;
  description: string;
  ingredients: string[];
  imageUrl: string;
  tags: string[];
  isOutOfStock?: boolean;
  gstRate?: number; // 5, 12, 18, 28
  hsnCode?: string;
  isTaxInclusive?: boolean;
}

export const CATEGORIES = [
  { id: 'starters', label: 'Starters', icon: 'Sparkles' },
  { id: 'appetizers', label: 'Appetizers', icon: 'Utensils' },
  { id: 'main course', label: 'Main Course', icon: 'Flame' },
  { id: 'beverages', label: 'Beverages', icon: 'CupSoda' },
  { id: 'desserts', label: 'Desserts', icon: 'Cherry' }
] as const;

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'ind-01',
    name: 'Truffle Malai Broccoli',
    category: 'starters',
    price: 425,
    isVeg: true,
    description: 'Fresh organic broccoli florets marinated in cardamom-spiced yogurt cream, charcoal grilled and finished with premium white truffle oil and pure silver leaf flakes.',
    ingredients: ['Broccoli', 'Cardamom', 'Cream Yogurt', 'White Truffle Oil', 'Silver Leaf'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    tags: ['Truffle Enriched', 'Gluten Free']
  },
  {
    id: 'ind-02',
    name: 'Gold Leaf Saffron Paneer Tikka',
    category: 'starters',
    price: 495,
    isVeg: true,
    isSignature: true,
    description: 'Slabs of organic artisanal cottage cheese marinated in Kashmiri saffron, house-ground yellow mustard, and Greek yogurt, clay-oven seared and dusted with edible 24K gold dust.',
    ingredients: ['Cottage Cheese (Paneer)', 'Kashmiri Saffron', 'Greek Yogurt', 'Yellow Mustard', 'Gold Dust Edible'],
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&auto=format&fit=crop',
    tags: ['Chef Signature', '24K Gold Dust']
  },
  {
    id: 'ind-03',
    name: 'Kashmiri Beetroot Seekh Kebab',
    category: 'starters',
    price: 395,
    isVeg: true,
    description: 'Skewers of oven-roasted organic crimson beetroots, sweet potato mash, royal cumin seeds, toasted pine nuts, and a fresh wild mint center.',
    ingredients: ['Crimson Beetroot', 'Sweet Potato', 'Royal Cumin', 'Pine Nuts', 'Wild Mint'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    tags: ['Light & Vibrant', 'Nut Rich']
  },
  {
    id: 'ind-04',
    name: 'Charcoal Smoked Chicken Tikka',
    category: 'starters',
    price: 550,
    isVeg: false,
    description: 'Boneless organic chicken chunks steeped in cold-pressed mustard oil, Kashmiri red chilies, and hand-churned yogurt, flame-torched inside traditional clay oven with live charcoal.',
    ingredients: ['Organic Chicken', 'Mustard Oil', 'Kashmiri Red Chili', 'Kasturi Methi', 'Ginger Garlic Paste'],
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop',
    tags: ['Tandoori Flame', 'Spicy Glow']
  },
  {
    id: 'ind-05',
    name: 'Jackfruit Galouti Medallions',
    category: 'starters',
    price: 450,
    isVeg: true,
    description: 'Slow-smoked young baby jackfruit patties blended with dry rose petals and stone-ground heritage spices, melt-in-mouth texture cooked on copper tawa.',
    ingredients: ['Young Jackfruit', 'Dried Rose Petals', 'Ghee', 'Smoked Almond Paste', 'Kewra Water'],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    tags: ['Luxury Vegan Option', 'Royal Awadh']
  },
  {
    id: 'ind-06',
    name: 'Avocado Papdi Chaat Royale',
    category: 'appetizers',
    price: 380,
    isVeg: true,
    description: 'Crisp organic whole wheat flour discs layered with scoop-pressed Hass avocado cubes, chilled sweet pomegranate compote, peppermint extract cream, and roasted coriander powder.',
    ingredients: ['Organic Wheat Crisps', 'Hass Avocado', 'Fresh Pomegranate', 'Peppermint Cream', 'Heritage Tamarind Glaze'],
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=600&auto=format&fit=crop',
    tags: ['Artisanal Streetfood', 'Cooling Essence']
  },
  {
    id: 'ind-07',
    name: 'Saffron Lamb Shahi Galouti',
    category: 'appetizers',
    price: 575,
    isVeg: false,
    description: 'Legendary melt-in-the-mouth ground lamb shoulder rounds flavored with Kashmiri saffron filaments, aromatic Vetiver water, and finished with shimmering edible silver leaf.',
    ingredients: ['Lamb Shoulder Ground', 'Kashmiri Saffron Filaments', 'Vetiver Water', 'Raw Papaya paste', 'Shahi Garam Masala'],
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop',
    tags: ['Velvety Texture', 'Silver Leaf Decorated']
  },
  {
    id: 'ind-08',
    name: 'Gunpowder Soft Shell Tempura',
    category: 'appetizers',
    price: 620,
    isVeg: false,
    description: 'Golden fried crispy soft-shell crabs dusted with organic roasted southern gunpowder lentil spice mix, served with curry leaf-infused lemon-lime foam.',
    ingredients: ['Soft-Shell Crab', 'Roasted Chana Dal', 'Curry Leaves', 'Lemon foam', 'Coconut Oil'],
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop',
    tags: ['Southern Spiced', 'Extra Crispy']
  },
  {
    id: 'ind-09',
    name: 'Lotus Root Keema Canapés',
    category: 'appetizers',
    price: 410,
    isVeg: true,
    description: 'Crispiest fried thin lotus root coins loaded with slow-cooked spicy vegan plant-based soy keema and crowned with a dollop of sweet hung yogurt glaze.',
    ingredients: ['Lotus Root Coins', 'Plant Soy Keema', 'Fresh Hung Yogurt', 'Ginger Shreds', 'Green Chilies'],
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600&auto=format&fit=crop',
    tags: ['Modern Vegetarian', 'High Crunch']
  },
  {
    id: 'ind-10',
    name: 'Royal Butter Chicken Shahi Noir',
    category: 'main course',
    price: 625,
    isVeg: false,
    description: 'Hush Signature Main: Boneless clay-oven grilled chicken cubes simmered in a 24-hour slow-simmered vine tomato butter sauce, enriched with roasted cashew paste, organic cream, and micro-fenugreek greens.',
    ingredients: ['Grilled Chicken', 'Vine Tomato Puree', 'Hand-churned Sweet Butter', 'Organic Cream', 'Roasted Cashews', 'Kasuri Methi'],
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800&auto=format&fit=crop',
    tags: ['Unmatched Heritage', 'Rich & Creamy']
  },
  {
    id: 'ind-11',
    name: 'Kashmiri Gucchi Saffron Pulao',
    category: 'main course',
    price: 750,
    isVeg: true,
    description: 'Dum-pot slow-cooked aromatic aged Basmati rice layered with giant wild Himalayan morel mushrooms (Gucchi) stuffed with roasted almond mash and saffron butter glaze.',
    ingredients: ['Basmati Rice Long Grain', 'Himalayan Gucchi Morels', 'Roasted Almonds', 'Kashmiri Saffron Filaments', 'Pure Cow Ghee'],
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
    tags: ['Wild Morels', 'Aged Basmati']
  },
  {
    id: 'ind-12',
    name: 'Slow-Cooked Dal Hush Overnight',
    category: 'main course',
    price: 480,
    isVeg: true,
    description: 'Creamy black lentils slow stewed over night on live charcoal embers with organic tomatoes, ginger shreds, and finished with churned white table butter and fresh cream.',
    ingredients: ['Aged Black Urad Dal', 'Red Kidney Beans', 'Plum Tomatoes', 'White Table Butter', 'Fresh Milk Cream'],
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop',
    tags: ['24h Slow Brew', 'Velvet Gravy']
  },
  {
    id: 'ind-13',
    name: 'Nizami Shahi Saffron Paneer',
    category: 'main course',
    price: 550,
    isVeg: true,
    description: 'Gold-seared cottage cheese cubes cooked inside a highly aromatic, smooth-as-silk ivory gravy of ground poppy seeds, sweet melon kernels, cardamom flakes, and fresh rose milk.',
    ingredients: ['Cottage Cheese', 'Ivory Poppy Seeds', 'Cardamom Pods', 'Melon Seed Cream', 'Heritage Rose Essence'],
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
    tags: ['Aromatic White Gravy', 'Gentle Sweet Spice']
  },
  {
    id: 'ind-14',
    name: 'Awadhi Lamb Dum Biryani',
    category: 'main course',
    price: 695,
    isVeg: false,
    description: 'An elegant presentation of heritage long-grain Basmati rice hand-layered with marinated tender spring lamb chunks, saffron milk, fresh mint leaves, cooked under flour puff-dough sealing.',
    ingredients: ['Spring Lamb Chunks', 'Basmati Rice', 'Saffron Milk infusion', 'Fresh Mint', 'Brown Crispy Onion', 'Rosewater'],
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=810&auto=format&fit=crop',
    tags: ['Flour Sealed Dum', 'Melt-in-mouth Meat']
  },
  {
    id: 'ind-15',
    name: 'Seared Wild Sea Bass Moilee',
    category: 'main course',
    price: 795,
    isVeg: false,
    description: 'Pan-caramelized wild Chilean sea bass steak sitting gently inside an organic coconut milk stew with crushed finger-ginger, split green chilies, and fresh tarka curry leaves.',
    ingredients: ['Wild Sea Bass', 'Pure Coconut Milk', 'Finger Ginger Juice', 'Tempered Mustard Seeds', 'Fresh Curry Leaves'],
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop',
    tags: ['Coastal Tempered', 'Silky Coconut Extract']
  },
  {
    id: 'ind-16',
    name: 'Rosemary Mint Lassi Whisper',
    category: 'beverages',
    price: 250,
    isVeg: true,
    description: 'Pristine clay-pot cold churned yogurt beverage sweetened with Himalayan white honey, infused with essential organic rosemary extract and fresh mint oils.',
    ingredients: ['Clay-pot Yogurt', 'Himalayan Organic Honey', 'Wild Mint Leaves', 'Essential Rosemary Oil', 'Pistachio Flakes'],
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop',
    tags: ['Cold Whisked', 'Honeydew Sweet']
  },
  {
    id: 'ind-17',
    name: 'Saffron Badam Thandai Royale',
    category: 'beverages',
    price: 295,
    isVeg: true,
    description: 'Chilled cold-pressed premium almond milk stone-blended with organic melon seeds, black peppercorn rounds, Kashmiri saffron fibers, fennel, and crushed green cardamoms.',
    ingredients: ['Almond Milk Cold Pressed', 'Kashmiri Saffron Filaments', 'Fennel Grits', 'Cardamom Seeds', 'Pistachio Rubs'],
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop',
    tags: ['Slow Stone Ground', 'Kashmiri Saffron']
  },
  {
    id: 'ind-18',
    name: 'Tangy Kokum Ginger Elixir',
    category: 'beverages',
    price: 220,
    isVeg: true,
    description: 'Highly refreshing sparkling natural spring water flavored with hand-extracted Kokum berries, raw ginger root juice, roasted cumin seeds, and pink rock salt spray.',
    ingredients: ['Hand-extracted Kokum', 'Ginger Root Juice', 'Sparkling Spring Water', 'Pink Himalayan Rock Salt', 'Roasted Cumin'],
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=590&auto=format&fit=crop',
    tags: ['Sparkling Citrus', 'Digestive Benefit']
  },
  {
    id: 'ind-19',
    name: 'Masala Chai Nitro Float',
    category: 'beverages',
    price: 195,
    isVeg: true,
    description: 'Elite Assam dust black tea brewed for hours with organic mace flower, green cardamoms, sliced ginger, sweetened with organic jaggery, topped with dairy cold sweet dream foam.',
    ingredients: ['Assam Black Tea Dust', 'Mace Flower Crushed', 'Green Cardamom', 'Organic Jaggery', 'Cold Milk Sweet Foam'],
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=580&auto=format&fit=crop',
    tags: ['Smoky Brew', 'Indian Spiced Jaggery']
  },
  {
    id: 'ind-20',
    name: 'Rose Petal Pistachio Kulfi Nest',
    category: 'desserts',
    price: 340,
    isVeg: true,
    description: 'Traditional Indian ultra-dense milk ice cream slow-reduced with petals of Damascus roses and green organic pistachios, served over a beautiful spun golden fried vermicelli bird nest.',
    ingredients: ['Thickened Reduced Milk', 'Damascus Rose Jam', 'Roasted Green Pistachios', 'Crispy Golden Vermicelli', 'Cardamom Essence'],
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=570&auto=format&fit=crop',
    tags: ['Indian Frozen Classic', 'Rose Infusion']
  },
  {
    id: 'ind-21',
    name: 'Baked Saffron Brioche Shahi Tukda',
    category: 'desserts',
    price: 380,
    isVeg: true,
    description: 'French buttery brioche slice crisped in organic cow ghee, soaked in warm saffron honey cream, and draped under dense cardamom rabri pudding, almond slivers and silver leaf flakes.',
    ingredients: ['Buttery Brioche Bread Slice', 'Cow Ghee (Clarified Butter)', 'Cardamom Milk Rabri', 'Pure Silver Leaf', 'Toasted Almond Slivers'],
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=560&auto=format&fit=crop',
    tags: ['Royal Mughal Baked', 'Saffron Rabri Draped']
  }
];
