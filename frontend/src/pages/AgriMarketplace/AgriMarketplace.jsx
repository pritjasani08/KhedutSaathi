import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Star, MapPin, Phone,
  ShoppingCart, Sprout, FlaskConical, Bug, X, ChevronDown
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const categories = [
  { key: 'seeds', label: 'Seeds', icon: Sprout, emoji: '🌱' },
  { key: 'fertilizers', label: 'Fertilizers', icon: FlaskConical, emoji: '🧪' },
  { key: 'pesticides', label: 'Pesticides', icon: Bug, emoji: '🐛' },
];

const mockProducts = [
  { id: 1, name: 'Hybrid Wheat Seeds (HD-2967)', category: 'seeds', price: 450, seller: 'AgriKing Seeds', distance: '5 km', rating: 4.8, reviews: 128, image: '🌾' },
  { id: 2, name: 'NPK 12-32-16 Fertilizer', category: 'fertilizers', price: 1200, seller: 'Gujarat Agri Supply', distance: '8 km', rating: 4.6, reviews: 95, image: '🧪' },
  { id: 3, name: 'Neem Oil Pesticide (1L)', category: 'pesticides', price: 320, seller: 'Green Shield Agro', distance: '3 km', rating: 4.9, reviews: 210, image: '🍃' },
  { id: 4, name: 'Cotton Seeds (BT-II)', category: 'seeds', price: 850, seller: 'Mahyco Seeds', distance: '12 km', rating: 4.7, reviews: 156, image: '🌿' },
  { id: 5, name: 'DAP Fertilizer (50kg)', category: 'fertilizers', price: 1350, seller: 'IFFCO Dealer', distance: '6 km', rating: 4.5, reviews: 88, image: '⚗️' },
  { id: 6, name: 'Imidacloprid 17.8% SL', category: 'pesticides', price: 560, seller: 'Bayer CropScience', distance: '10 km', rating: 4.4, reviews: 72, image: '🔬' },
  { id: 7, name: 'Groundnut Seeds (GG-20)', category: 'seeds', price: 380, seller: 'Junagadh Agri Co.', distance: '15 km', rating: 4.6, reviews: 64, image: '🥜' },
  { id: 8, name: 'Urea Fertilizer (45kg)', category: 'fertilizers', price: 266, seller: 'NFCL Distributor', distance: '4 km', rating: 4.3, reviews: 142, image: '💎' },
  { id: 9, name: 'Chlorpyrifos 20% EC', category: 'pesticides', price: 420, seller: 'UPL Agri Center', distance: '7 km', rating: 4.2, reviews: 56, image: '🧴' },
];

export default function AgriMarketplace() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2000]);

  const filteredProducts = mockProducts
    .filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/60 text-amber-600 text-sm font-semibold mb-4">
            <ShoppingCart className="w-4 h-4" /> Agricultural E-Commerce
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {t('agriMarketplace.title')}
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t('agriMarketplace.subtitle')}
          </motion.p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-3 mb-8 flex-wrap"
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              selectedCategory === 'all' ? 'bg-primary text-white shadow-green' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-card'
            }`}
          >
            🛒 {t('agriMarketplace.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat.key ? 'bg-primary text-white shadow-green' : 'bg-white text-slate-600 hover:bg-slate-50 shadow-card'
              }`}
            >
              {cat.emoji} {t(`agriMarketplace.${cat.key}`)}
            </button>
          ))}
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 mb-8 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('agriMarketplace.search')}
              className="input-field !pl-12"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-field !w-auto"
            >
              <option value="rating">{t('agriMarketplace.rating')}</option>
              <option value="priceLow">{t('agriMarketplace.priceLowHigh')}</option>
              <option value="priceHigh">{t('agriMarketplace.priceHighLow')}</option>
              <option value="newest">{t('agriMarketplace.newest')}</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                showFilters ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('agriMarketplace.filters')}
            </button>
          </div>
        </motion.div>

        {/* Filter Sidebar (collapsible) */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-slate-800">{t('agriMarketplace.filters')}</h3>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">{t('agriMarketplace.priceRange')}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    className="input-field text-sm !py-2"
                    placeholder="Min"
                  />
                  <span className="text-slate-400">—</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="input-field text-sm !py-2"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">{t('agriMarketplace.category')}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="select-field"
                >
                  <option value="all">{t('agriMarketplace.allCategories')}</option>
                  {categories.map((c) => <option key={c.key} value={c.key}>{t(`agriMarketplace.${c.key}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">{t('agriMarketplace.sortBy')}</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select-field">
                  <option value="rating">{t('agriMarketplace.rating')}</option>
                  <option value="priceLow">{t('agriMarketplace.priceLowHigh')}</option>
                  <option value="priceHigh">{t('agriMarketplace.priceHighLow')}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-slate-400 text-lg">{t('agriMarketplace.noProducts')}</p>
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                variants={fadeUp}
                custom={i}
                className="glass-card overflow-hidden card-hover group"
              >
                {/* Product Image */}
                <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
                  {product.image}
                </div>

                <div className="p-5">
                  {/* Category Badge */}
                  <span className={`badge text-xs mb-3 ${
                    product.category === 'seeds' ? 'badge-success' :
                    product.category === 'fertilizers' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {t(`agriMarketplace.${product.category}`)}
                  </span>

                  <h3 className="font-display font-bold text-slate-800 mb-2 line-clamp-2">{product.name}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
                    <span className="text-xs text-slate-400">({product.reviews})</span>
                  </div>

                  {/* Price */}
                  <p className="font-display text-2xl font-bold gradient-text mb-3">₹{product.price.toLocaleString()}</p>

                  {/* Seller & Distance */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1 truncate">
                      <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                      {product.seller}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                      {product.distance}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1 text-sm !py-2.5 flex items-center justify-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {t('agriMarketplace.contactSeller')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
