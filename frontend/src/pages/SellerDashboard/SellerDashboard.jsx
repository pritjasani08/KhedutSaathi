import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageSearch, ShoppingBag, PlusCircle, IndianRupee, UploadCloud, Box, LayoutGrid, Tractor, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase/client';
import { useAuth } from '../../context/AuthContext';
import SkeletonCard from '../../components/shared/SkeletonCard';

const UNIT_MAP = {
  'Seeds': ['Kg', 'Gram', 'Packet'],
  'Fertilizers': ['Kg', 'Bag (50kg)', 'Liter', 'mL'],
  'Pesticides': ['Liter', 'mL', 'Kg', 'Gram'],
  'Equipment': ['Piece', 'Set'],
  'Irrigation': ['Meter', 'Piece', 'Set'],
  'Organic Product': ['Kg', 'Liter', 'Piece']
};

export default function SellerDashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'products';
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    category: 'Seeds', 
    unit: 'Kg',
    price: '', 
    stock: '', 
    description: '', 
    images: [], 
    previews: [] 
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seller_products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('seller_orders')
        .select(`
          *,
          seller_products ( name, unit ),
          users!seller_orders_farmer_id_fkey ( first_name, last_name, mobile, email )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        const mappedOrders = data.map(o => ({
          id: o.id,
          date: new Date(o.created_at).toLocaleDateString(),
          farmer: o.users ? `${o.users.first_name} ${o.users.last_name}` : 'Unknown Farmer',
          contact: o.users?.mobile || o.users?.email || 'Will be shared once accepted',
          product: o.seller_products?.name || 'Unknown Product',
          quantity: o.quantity,
          total: o.total_amount,
          status: o.status
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error(err);
    }
    setOrdersLoading(false);
  };

  // Fetch products and orders from Supabase
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab]);;

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('seller_orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    const availableUnits = UNIT_MAP[category] || ['Piece'];
    setNewProduct({
      ...newProduct,
      category,
      unit: availableUnits[0] // Reset to first valid unit
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // Max 5
    if (files.length > 0) {
      setNewProduct({
        ...newProduct,
        images: files,
        previews: files.map(file => URL.createObjectURL(file))
      });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to add products.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      let final_image_urls = ['https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=400'];

      // Upload image to Supabase
      if (newProduct.images && newProduct.images.length > 0) {
        final_image_urls = [];
        for (const file of newProduct.images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('seller_product_images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('seller_product_images')
            .getPublicUrl(filePath);
          
          final_image_urls.push(publicUrl);
        }
      }

      // Insert product into database
      const { data: insertedProduct, error: insertError } = await supabase
        .from('seller_products')
        .insert([{
          seller_id: user.id,
          name: newProduct.name,
          category: newProduct.category,
          unit: newProduct.unit,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock, 10),
          description: newProduct.description,
          image_url: final_image_urls[0], // fallback for old column
          image_urls: final_image_urls
        }])
        .select();

      if (insertError) throw insertError;

      if (insertedProduct && insertedProduct[0]) {
        setProducts([insertedProduct[0], ...products]);
      }

      navigate('/seller-dashboard/products');
      setNewProduct({ name: '', category: 'Seeds', unit: 'Kg', price: '', stock: '', description: '', images: [], previews: [] });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-slate-950 dark:to-slate-950 text-body font-sans pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-display font-bold text-heading mb-3 flex items-center justify-center sm:justify-start gap-3 tracking-tight transition-colors duration-300">
            <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-2xl border border-primary/20">
              <Tractor className="w-8 h-8 text-primary" />
            </div>
            Seller Dashboard
          </h1>
          <p className="text-body max-w-2xl text-lg opacity-80 transition-colors duration-300">Manage your agricultural products, add new inventory, and track incoming orders from farmers.</p>
        </div>

      {/* Main Content Area */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          {/* My Products Tab */}
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-8 bg-surface p-6 rounded-2xl border border-subtle shadow-sm transition-colors duration-300">
                <div>
                  <h2 className="text-2xl font-display font-bold text-heading flex items-center gap-2 mb-1 transition-colors duration-300">
                    <LayoutGrid className="w-6 h-6 text-primary" /> Active Inventory
                  </h2>
                  <p className="text-sm text-body opacity-80 transition-colors duration-300">View and manage the stock quantities of your products.</p>
                </div>
                <div className="bg-surface-muted border border-subtle px-4 py-2 rounded-xl text-center transition-colors duration-300">
                  <span className="block text-xl font-bold text-primary">{products.length}</span>
                  <span className="text-[10px] uppercase tracking-widest text-body font-bold opacity-70">Total Items</span>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <SkeletonCard key={i} index={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map(product => (
                    <div key={product.id} className="bg-surface rounded-2xl border border-subtle overflow-hidden flex flex-col group hover:shadow-md hover:border-primary/50 transition-all duration-300">
                      <div className="h-48 bg-surface-muted relative transition-colors duration-300">
                        <img src={product.image_urls?.[0] || product.image_url} alt={product.name} className="w-full h-full object-cover transition-opacity" />
                        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm border border-subtle px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm transition-colors duration-300">
                          {product.category}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-heading text-lg mb-2 line-clamp-1 transition-colors duration-300">{product.name}</h3>
                        <p className="text-sm text-body opacity-80 line-clamp-2 mb-4 flex-1 transition-colors duration-300">{product.description}</p>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-subtle transition-colors duration-300">
                          <span className="text-heading font-bold flex items-center text-lg transition-colors duration-300">
                            <IndianRupee className="w-4 h-4 mr-0.5 text-primary" />{product.price}
                            <span className="text-xs text-body opacity-60 ml-1 font-normal">/ {product.unit}</span>
                          </span>
                          <div className="flex items-center gap-1.5 bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-lg border border-primary/20 transition-colors duration-300">
                            <Box className="w-4 h-4 text-primary" /> 
                            <span className="text-sm font-bold text-primary">Qty: {product.stock}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center bg-surface rounded-3xl border border-dashed border-subtle transition-colors duration-300">
                      <div className="w-20 h-20 bg-surface-muted rounded-full flex items-center justify-center mb-6 shadow-sm border border-subtle transition-colors duration-300">
                        <PackageSearch className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-heading mb-2 transition-colors duration-300">Your inventory is empty</h3>
                      <p className="text-body opacity-80 mb-6 text-center max-w-sm transition-colors duration-300">You haven't listed any products for sale yet. Add your first product to start selling to farmers.</p>
                      <button 
                        onClick={() => navigate('/seller-dashboard/add')}
                        className="btn-primary flex items-center gap-2"
                      >
                        <PlusCircle className="w-5 h-5" /> List a Product
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Add Product Tab */}
          {activeTab === 'add' && (
            <motion.div key="add-product" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8 bg-surface p-6 rounded-2xl border border-subtle shadow-sm max-w-3xl mx-auto transition-colors duration-300">
                <h2 className="text-2xl font-display font-bold text-heading flex items-center gap-2 mb-1 transition-colors duration-300">
                  <PlusCircle className="w-6 h-6 text-primary" /> List New Product
                </h2>
                <p className="text-sm text-body opacity-80 transition-colors duration-300">Fill out the details below to add a new product to the marketplace.</p>
              </div>

              <form onSubmit={handleAddProduct} className="max-w-3xl mx-auto bg-surface p-8 rounded-3xl border border-subtle shadow-sm space-y-6 transition-colors duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-heading mb-2 transition-colors duration-300">Product Name</label>
                    <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="input-field" placeholder="e.g. Organic Urea" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-heading mb-2 transition-colors duration-300">Category</label>
                    <select value={newProduct.category} onChange={handleCategoryChange} className="input-field">
                      <option>Seeds</option>
                      <option>Fertilizers</option>
                      <option>Pesticides</option>
                      <option>Equipment</option>
                      <option>Irrigation</option>
                      <option>Organic Product</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-heading mb-2 transition-colors duration-300">Unit of Measurement</label>
                    <select value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="input-field">
                      {(UNIT_MAP[newProduct.category] || ['Piece']).map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-heading mb-2 transition-colors duration-300">Price (₹) <span className="text-primary font-normal ml-1">per {newProduct.unit}</span></label>
                    <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="input-field" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-heading mb-2 transition-colors duration-300">Stock Quantity <span className="text-primary font-normal ml-1">in {newProduct.unit}</span></label>
                    <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="input-field" placeholder="e.g. 50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-heading mb-2 transition-colors duration-300">Product Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-subtle rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-muted hover:border-primary transition-all group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      multiple
                      onChange={handleImageChange}
                    />
                    {newProduct.previews.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto w-full pb-2 justify-center items-center">
                        {newProduct.previews.map((preview, i) => (
                          <div key={i} className="relative w-32 flex-shrink-0 aspect-video rounded-xl overflow-hidden shadow-sm">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <p className="text-heading font-bold text-lg mb-1 transition-colors duration-300">Click to upload images</p>
                        <p className="text-sm text-body opacity-70 transition-colors duration-300">Select up to 5 images (Max 5MB each)</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-heading mb-2 transition-colors duration-300">Description</label>
                  <textarea rows="4" required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="input-field resize-none" placeholder="Describe the product details..." />
                </div>

                <div className="pt-6 border-t border-subtle transition-colors duration-300">
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full text-lg py-4 flex items-center justify-center disabled:opacity-70">
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>
                    ) : (
                      'Publish Product to Marketplace'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-8 bg-surface p-6 rounded-2xl border border-subtle shadow-sm flex justify-between items-center transition-colors duration-300">
                <div>
                  <h2 className="text-2xl font-display font-bold text-heading flex items-center gap-2 mb-1 transition-colors duration-300">
                    <ShoppingBag className="w-6 h-6 text-primary" /> Incoming Orders
                  </h2>
                  <p className="text-sm text-body opacity-80 transition-colors duration-300">Track and manage purchases made by farmers.</p>
                </div>
                <div className="bg-surface-muted border border-subtle px-4 py-2 rounded-xl text-center transition-colors duration-300">
                  <span className="block text-xl font-bold text-primary">{orders.length}</span>
                  <span className="text-[10px] uppercase tracking-widest text-body font-bold opacity-70">New Orders</span>
                </div>
              </div>

              <div className="bg-surface rounded-3xl border border-subtle overflow-hidden shadow-sm transition-colors duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-muted text-xs uppercase tracking-widest text-muted font-bold border-b border-subtle transition-colors duration-300">
                        <th className="p-5">Order ID</th>
                        <th className="p-5">Date</th>
                        <th className="p-5">Customer</th>
                        <th className="p-5">Product Details</th>
                        <th className="p-5">Total Amount</th>
                        <th className="p-5">Status & Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle transition-colors duration-300">
                      {ordersLoading ? (
                        <tr><td colSpan="6" className="p-10 text-center text-slate-500">Loading orders...</td></tr>
                      ) : orders.map((order) => (
                        <tr key={order.id} className="hover:bg-surface-muted/50 transition-colors duration-300">
                          <td className="p-5 font-bold text-heading text-xs transition-colors duration-300">{order.id.slice(0,8)}...</td>
                          <td className="p-5 text-sm text-body opacity-80 transition-colors duration-300">{order.date}</td>
                          <td className="p-5 text-sm font-bold text-heading transition-colors duration-300">
                            {order.farmer}
                            {['Processing', 'Completed', 'Shipped', 'Delivered'].includes(order.status) && (
                              <div className="text-xs text-primary mt-1 font-normal break-all">
                                📞 {order.contact}
                              </div>
                            )}
                          </td>
                          <td className="p-5 text-sm text-body transition-colors duration-300">
                            {order.product} <br/>
                            <span className="text-primary font-bold mt-1 inline-flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Qty: {order.quantity}</span>
                          </td>
                          <td className="p-5 font-bold text-heading transition-colors duration-300">
                            <span className="flex items-center"><IndianRupee className="w-3.5 h-3.5 mr-0.5 text-primary" />{order.total}</span>
                          </td>
                          <td className="p-5">
                            {order.status === 'Pending' ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Processing')}
                                  className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 border border-green-500/20 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                order.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              }`}>
                                {order.status === 'Processing' ? 'Accepted' : order.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!ordersLoading && orders.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-muted transition-colors duration-300">
                      <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
                      <h3 className="text-lg font-bold text-heading mb-1 transition-colors duration-300">No orders received yet</h3>
                      <p className="text-sm">When farmers purchase your products, they will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
