import React, { useState, useMemo, createContext, useContext, useEffect, useRef } from "react";
import {
  Search,
  Phone,
  ShoppingCart,
  Plus,
  Minus,
  X,
  MessageCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
  Tag
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ============================================================================
   FALCON — B2B Pneumatic Systems Storefront
   الشريف والبركة للأنظمة الهوائية
   ============================================================================ */

const WHATSAPP_NUMBER = "201099204040";
const CALL_NUMBER = "+201099204040";

const productsData = [
  {
    category: "وصلات سريعة - تايوان",
    items: [
      { id: "1206", name: "خرطوم سوسته 8 ملي", price: 16.000, stock: 85 },
      { id: "1205", name: "خرطوم عادي", price: 16.000, stock: 0 },
      { id: "1193", name: "خرطوم سوسته 8 ملي لوكس 1 حركه", price: 50.000, stock: 12 },
      { id: "1196", name: "سن 1/2 خارجي لوكس 1 حركه", price: 60.000, stock: 3 }
    ]
  },
  {
    category: "وصلات سريعة - إيطالي",
    items: [
      { id: "1203", name: "خرطوم سوسته 8 ملي", price: 45.000, stock: 42 },
      { id: "1204", name: "خرطوم سوسته 10 ملي", price: 50.000, stock: 19 },
      { id: "1200", name: "سن داخلي 1/4", price: 41.000, stock: 2 },
      { id: "1201", name: "سن 1/2 خارجي", price: 50.000, stock: 60 }
    ]
  },
  {
    category: "وصلات سريعة PVC",
    items: [
      { id: "1857", name: "وصله سريعه خرطوم سوسته خامه PVC", price: 17.500, stock: 150 },
      { id: "1859", name: "وصله سريعه سن 1/4 داخلي خامه PVC", price: 17.500, stock: 8 },
      { id: "2015", name: "لاكور سن خارجي خامه PVC", price: 4.300, stock: 300 }
    ]
  },
  {
    category: "وصلات ضغط خانق 1/4",
    items: [
      { id: "1149", name: "وصله ضغط خانق 1/4 X 4MM", price: 31.000, stock: 0 },
      { id: "1118", name: "وصله ضغط خانق 1/4 X 6 MM", price: 31.000, stock: 75 },
      { id: "1152", name: "وصله ضغط خانق 1/4 X 12MM", price: 36.000, stock: 18 }
    ]
  },
  {
    category: "كواتم الصوت",
    items: [
      { id: "1448", name: "كاتم صوت نحاس صمام خانق 1/8", price: 25.000, stock: 95 },
      { id: "1450", name: "كاتم صوت نحاس صمام خانق 3/8", price: 50.000, stock: 4 },
      { id: "1452", name: "كاتم صوت مخروطی 1/8", price: 6.800, stock: 120 },
      { id: "1457", name: "كاتم صوت مخروطی 1/2", price: 25.000, stock: 35 }
    ]
  }
];

const CATEGORIES = [
  { key: "all", label: "الكل" },
  ...productsData.map(c => ({ key: c.category, label: c.category }))
];

const DEMO_PRODUCTS = productsData.flatMap(c => 
  c.items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    category: c.category,
    image: null,
    stock: item.stock,
  }))
);

/* ----------------------------------------------------------------------- */
/* Cart context                                                             */
/* ----------------------------------------------------------------------- */

const CartContext = createContext(null);
const useCart = () => useContext(CartContext);

function CartProvider({ products, children }) {
  const [quantities, setQuantities] = useState({});
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const setQty = (id, qty) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      return next;
    });
  };

  const increment = (id) => setQty(id, (quantities[id] || 0) + 1);
  const decrement = (id) => setQty(id, (quantities[id] || 0) - 1);

  const lineItems = useMemo(() => {
    return Object.entries(quantities)
      .map(([id, qty]) => {
        const product = products.find((p) => String(p.id) === String(id));
        if (!product) return null;
        return { ...product, qty, lineTotal: product.price * qty };
      })
      .filter(Boolean);
  }, [quantities, products]);

  const totalItems = lineItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const buildWhatsAppMessage = () => {
    const lines = [];
    lines.push("📋 *طلب جديد من معرض Falcon الإلكتروني*");
    lines.push("");
    lines.push("الأصناف المطلوبة:");
    lines.push("—————————————");
    lineItems.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.name}`);
      lines.push(`   • الكود: ${item.id}`);
      lines.push(`   • الكمية: ${item.qty} قطعة`);
      lines.push(`   • السعر: ${item.lineTotal.toLocaleString("ar-EG", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ج.م`);
      lines.push("");
    });
    lines.push("—————————————");
    lines.push(`💰 *الإجمالي الكلي: ${totalPrice.toLocaleString("ar-EG", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ج.م*`);
    lines.push("");
    lines.push("برجاء تأكيد الطلب وموعد الاستلام. شكرًا 🦅");
    return lines.join("\n");
  };

  const checkoutUrl = () => {
    const text = encodeURIComponent(buildWhatsAppMessage());
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  };

  const value = {
    quantities,
    increment,
    decrement,
    setQty,
    lineItems,
    totalItems,
    totalPrice,
    isDrawerOpen,
    setDrawerOpen,
    checkoutUrl,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ----------------------------------------------------------------------- */
/* Animated Particles                                                       */
/* ----------------------------------------------------------------------- */

function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute opacity-5 sm:opacity-10"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* A simple gear/cog SVG shape */}
          <svg viewBox="0 0 24 24" fill="none" stroke="#F2A900" strokeWidth="1.5">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Features Banner                                                          */
/* ----------------------------------------------------------------------- */

function FeaturesBanner() {
  const features = [
    { icon: ShieldCheck, text: "ضمان الجودة الشاملة" },
    { icon: Truck, text: "توصيل سريع للمصانع" },
    { icon: Wrench, text: "دعم فني متخصص" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="border-y border-white/[0.02] bg-gradient-to-r from-[#121212] via-[#1A1A1A] to-[#121212] py-4 relative z-10">
      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="mx-auto flex max-w-5xl items-center justify-center gap-6 px-4 sm:justify-between sm:px-12"
      >
        {features.map((feature, idx) => (
          <motion.div key={idx} variants={item} className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3 group cursor-default">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2A900]/10 text-[#F2A900] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#F2A900]/20 group-hover:shadow-[0_0_15px_rgba(242,169,0,0.3)]">
              <feature.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold text-[#D3D3D3] transition-colors group-hover:text-white sm:text-xs">
              {feature.text}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Header / Hero                                                            */
/* ----------------------------------------------------------------------- */

function Header({ logoSrc, onScrollDown }) {
  const { scrollY } = useScroll();
  const yParallaxLogo = useTransform(scrollY, [0, 600], [0, 100]);
  const yParallaxText = useTransform(scrollY, [0, 600], [0, 50]);
  const opacityFade = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <header className="relative w-full h-screen min-h-[600px] flex flex-col justify-center items-center bg-[#121212] overflow-hidden">
      <FloatingParticles />
      
      {/* Ambient gold glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-[-10%] z-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, #F2A900 0%, transparent 70%)" }}
      />

      <motion.div style={{ opacity: opacityFade }} className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-10 text-center">
        
        {/* Parallax & Floating Logo */}
        <motion.div style={{ y: yParallaxLogo }} className="relative">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.img
              initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 150, damping: 18, delay: 0.1 }}
              src={logoSrc}
              alt="Falcon"
              className="h-36 w-auto drop-shadow-[0_12px_40px_rgba(242,169,0,0.25)] sm:h-48 object-contain hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </motion.div>
        </motion.div>

        {/* Tag below Logo */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#F2A900]/20 bg-[#F2A900]/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#F2A900] shadow-[0_0_20px_rgba(242,169,0,0.1)] sm:text-sm"
        >
          <Zap className="h-3.5 w-3.5 fill-[#F2A900]" />
          الشريف والبركة للأنظمة الهوائية
        </motion.p>

        {/* Parallax Content */}
        <motion.div style={{ y: yParallaxText }} className="flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 25, delay: 0.5 }}
            className="mt-5 max-w-2xl text-3xl font-black leading-[1.4] text-white sm:text-5xl sm:leading-[1.3]"
          >
            تجهيزات كاملة للأنظمة الهوائية،
            <br />
            <motion.span 
              initial={{ backgroundPosition: "200% center" }}
              animate={{ backgroundPosition: "0% center" }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.7 }}
              style={{ backgroundSize: "200% auto" }}
              className="bg-gradient-to-r from-[#F2A900] via-[#FFC84A] to-[#F2A900] bg-clip-text text-transparent"
            >
              بضغطة زر
            </motion.span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-5 max-w-md text-sm leading-relaxed text-[#D3D3D3] sm:text-base"
          >
            نقدم لك أقوى وأحدث الحلول في عالم الهواء المضغوط. اختر الكميات وأرسل طلبك ليتم معالجته فوراً بأعلى معايير الدقة.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer group"
        onClick={onScrollDown}
      >
        <span className="text-[11px] font-bold tracking-widest text-[#D3D3D3]/40 group-hover:text-[#F2A900] transition-colors duration-300">
          اسحب لتصفح المنتجات
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#F2A900]/60 group-hover:text-[#F2A900] transition-colors duration-300"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------------- */
/* Omnibar Smart Search + Category Pills                                   */
/* ----------------------------------------------------------------------- */

function SearchAndFilters({ query, setQuery, activeCategory, setActiveCategory }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      // In RTL, left decreases scroll position (scrolls to end)
      // and right increases scroll position (scrolls to start)
      const amt = direction === "left" ? -250 : 250;
      scrollRef.current.scrollBy({ left: amt, behavior: "smooth" });
    }
  };

  // Find matching categories based on query
  const matchingCategories = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CATEGORIES.filter(cat => cat.key !== "all" && cat.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#121212]/85 backdrop-blur-2xl shadow-2xl">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 relative">
        <div className="relative group">
          <Search
            className="pointer-events-none absolute right-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#D3D3D3]/50 transition-colors group-focus-within:text-[#F2A900]"
            strokeWidth={2}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، كود الصنف، أو القسم..."
            className="w-full rounded-2xl border border-white/10 bg-[#1A1A1A]/80 py-4 pr-12 pl-4 text-sm text-white placeholder:text-[#D3D3D3]/40 outline-none ring-0 transition-all duration-300 focus:border-[#F2A900]/60 focus:bg-[#1A1A1A] focus:shadow-[0_0_0_4px_rgba(242,169,0,0.1)]"
          />

          {/* Category Quick Navigation Tag Dropdown */}
          <AnimatePresence>
            {matchingCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-full z-40 rounded-xl border border-white/10 bg-[#1A1A1A] shadow-2xl overflow-hidden"
              >
                {matchingCategories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveCategory(cat.key);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-5 py-4 text-right text-sm text-[#D3D3D3] transition-colors hover:bg-white/5 hover:text-[#F2A900]"
                  >
                    <Tag className="h-4 w-4 text-[#F2A900]" />
                    <span>الذهاب إلى قسم: <strong className="text-white">{cat.label}</strong></span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Highlights Categories Block with background & arrow-navigation */}
        <div className="relative mt-5 flex items-center bg-[#1A1A1A] p-1.5 rounded-2xl border border-white/[0.04]">
          {/* Scroll Right Button (To Start of list in RTL) */}
          <button
            onClick={() => scroll("right")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#D3D3D3] hover:bg-[#F2A900]/10 hover:text-[#F2A900] active:scale-95 transition-all duration-200 outline-none z-10"
            aria-label="التمرير لليمين"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex-1 flex gap-2 overflow-x-auto py-1 px-3 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={cn(
                    "relative shrink-0 rounded-full px-5 py-2 text-xs font-bold transition-colors duration-300 sm:text-sm outline-none",
                    isActive ? "text-[#121212]" : "text-[#D3D3D3] hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 z-0 rounded-full bg-[#F2A900] shadow-[0_4px_15px_rgba(242,169,0,0.4)]"
                      transition={{ type: "spring", stiffness: 600, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scroll Left Button (To End of list in RTL) */}
          <button
            onClick={() => scroll("left")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#D3D3D3] hover:bg-[#F2A900]/10 hover:text-[#F2A900] active:scale-95 transition-all duration-200 outline-none z-10"
            aria-label="التمرير ليسار"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Product Card                                                             */
/* ----------------------------------------------------------------------- */

function ProductCard({ product }) {
  const { quantities, setQty, increment, decrement } = useCart();
  const qty = quantities[product.id] || 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className={cn(
      "group relative flex items-center justify-between p-3 rounded-xl border border-white/[0.04] bg-[#1A1A1A] transition-all duration-300 gap-4",
      isOutOfStock ? "opacity-60 border-dashed border-white/10" : "hover:border-[#F2A900]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
    )}>
      {/* Top gradient highlight on hover */}
      {!isOutOfStock && (
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#F2A900] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}

      {/* Right side: Small Image & Details */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Compact Image/Placeholder */}
        <div className="relative h-16 w-16 shrink-0 rounded-lg bg-[#222]/20 overflow-hidden border border-white/[0.05] flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <Package className={cn("h-5 w-5 transition-colors duration-500", isOutOfStock ? "text-[#3A3C40]" : "text-[#555] group-hover:text-[#F2A900]/60")} strokeWidth={1.5} />
          )}
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <h3 className={cn(
            "text-[13px] sm:text-sm font-bold truncate leading-snug transition-colors",
            isOutOfStock ? "text-[#D3D3D3]/50" : "text-white group-hover:text-[#F2A900]"
          )}>
            {product.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <span className="text-[10px] text-[#D3D3D3]/40 font-mono">كود: {product.id}</span>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                غير متوفر
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                متبقي {product.stock}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                متوفر
              </span>
            )}
          </div>
          {/* Price for mobile screens */}
          <div className="md:hidden mt-1 text-xs font-black text-[#F2A900]">
            {product.price.toLocaleString("ar-EG", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-[9px]">ج.م</span>
          </div>
        </div>
      </div>

      {/* Left side: Price & Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Price (Desktop) */}
        <span className="hidden md:block text-sm sm:text-base font-black text-[#F2A900] min-w-[70px] text-left">
          {product.price.toLocaleString("ar-EG", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
          <span className="mr-0.5 text-[10px] font-bold text-[#F2A900]/70">ج.م</span>
        </span>

        {/* Counter or Out of Stock Notification Button */}
        {isOutOfStock ? (
          <button
            onClick={() => alert(`سيتم إرسال إشعار لك فور توفر الصنف: ${product.name} (طلب ربط المخازن)`)}
            className="flex h-9 px-2.5 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 text-[#D3D3D3]/60 hover:text-red-400 text-[11px] font-bold transition-all duration-300 outline-none"
          >
            أعلمني بالتوفر
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121212] p-1 shadow-inner w-[90px]">
            <button
              onClick={() => decrement(product.id)}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-white/5 text-[#D3D3D3] transition-colors hover:bg-white/10 hover:text-white active:scale-95 outline-none"
            >
              <Minus className="h-3 w-3" strokeWidth={2.5} />
            </button>
            <span className="text-xs font-black text-white w-4 text-center select-none">
              {qty}
            </span>
            <button
              onClick={() => increment(product.id)}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-[#F2A900]/10 text-[#F2A900] transition-colors hover:bg-[#F2A900] hover:text-[#121212] active:scale-95 outline-none"
            >
              <Plus className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Product Grid                                                             */
/* ----------------------------------------------------------------------- */

function ProductGrid({ products, query, activeCategory }) {
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || String(p.id).toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, query, activeCategory]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  if (filtered.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-32 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A1A] shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
          <Search className="h-8 w-8 text-[#3A3C40]" strokeWidth={2} />
        </div>
        <p className="mt-6 text-base font-medium text-[#D3D3D3]/70">
          عذراً، لا توجد معدات مطابقة لبحثك في هذا القسم.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        key={activeCategory + query}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {filtered.map((product) => (
          <motion.div key={product.id} variants={item} layoutId={`product-${product.id}`}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* ----------------------------------------------------------------------- */
/* Brand WhatsApp SVG Icon                                                 */
/* ----------------------------------------------------------------------- */

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/* Separated Floating Action Buttons                                       */
/* ----------------------------------------------------------------------- */

function FloatingActions() {
  const { totalItems, setDrawerOpen } = useCart();
  const [isOrderMenuOpen, setOrderMenuOpen] = useState(false);

  return (
    <>
      {/* 1. Cart FAB (Bottom Left) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[#F2A900] text-[#121212] shadow-[0_10px_30px_rgba(242,169,0,0.4)] transition-all hover:scale-105 active:scale-95 outline-none"
        >
          <ShoppingCart className="h-6 w-6" strokeWidth={2.5} />
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: [1.3, 1] }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute -top-1 -right-1 flex h-7 min-w-[28px] items-center justify-center rounded-full border-[3px] border-[#121212] bg-white px-1.5 text-xs font-black text-[#121212] shadow-lg"
              >
                {totalItems}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* 2. Order/Contact FAB (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {isOrderMenuOpen && (
              <div className="absolute bottom-24 flex flex-col gap-3 items-center z-50">
                {/* WhatsApp Option */}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="relative flex items-center justify-center"
                >
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
                    onClick={() => setOrderMenuOpen(false)}
                  >
                    <WhatsAppIcon className="h-6 w-6" />
                  </a>
                  <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 rounded-xl bg-[#1A1A1A]/95 px-3 py-2 text-xs font-black text-white border border-white/10 shadow-xl backdrop-blur-md select-none whitespace-nowrap">
                    عبر واتساب
                  </span>
                </motion.div>

                {/* Call Option */}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.05 }}
                  className="relative flex items-center justify-center"
                >
                  <a
                    href={`tel:${CALL_NUMBER}`}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A1A] border border-[#F2A900]/40 text-[#F2A900] shadow-xl hover:scale-110 active:scale-95 transition-transform hover:bg-[#222222]"
                    onClick={() => setOrderMenuOpen(false)}
                  >
                    <Phone className="h-5 w-5" strokeWidth={2} />
                  </a>
                  <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 rounded-xl bg-[#1A1A1A]/95 px-3 py-2 text-xs font-black text-white border border-white/10 shadow-xl backdrop-blur-md select-none whitespace-nowrap">
                    مكالمة هاتفية
                  </span>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Main FAB: Circle with "اطلب الآن" */}
          <button
            onClick={() => setOrderMenuOpen(!isOrderMenuOpen)}
            className="group flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#1A1A1A] border border-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:bg-[#222222] hover:border-[#F2A900]/40 active:scale-95 outline-none relative p-2 text-center"
          >
            <motion.div
              animate={{ rotate: isOrderMenuOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center justify-center gap-0.5"
            >
              {isOrderMenuOpen ? (
                <X className="h-6 w-6 text-[#F2A900]" strokeWidth={2.5} />
              ) : (
                <>
                  <Phone className="h-4.5 w-4.5 text-[#F2A900]" strokeWidth={2.2} />
                  <span className="text-[10px] font-black text-white leading-tight">اطلب الآن</span>
                </>
              )}
            </motion.div>
            {!isOrderMenuOpen && (
              <span className="absolute inset-0 rounded-full border border-[#F2A900]/30 animate-ping opacity-25 pointer-events-none" />
            )}
          </button>
        </div>
      </div>
      
      {/* Invisible overlay to close order menu when clicking outside */}
      {isOrderMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#121212]/30 backdrop-blur-[2px]" onClick={() => setOrderMenuOpen(false)} />
      )}
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* Cart Drawer                                                              */
/* ----------------------------------------------------------------------- */

function CartDrawer() {
  const {
    isDrawerOpen,
    setDrawerOpen,
    lineItems,
    totalPrice,
    increment,
    decrement,
    checkoutUrl,
  } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#121212]/80 backdrop-blur-md"
            onClick={() => setDrawerOpen(false)}
          />

          {/* drawer panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative flex w-full max-w-md flex-col bg-[#1A1A1A] shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-[#121212]/50 px-6 py-5 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2A900]/10">
                  <ShoppingCart className="h-5 w-5 text-[#F2A900]" strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-black text-white">تفاصيل الطلب</h2>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#D3D3D3]/70 transition-all duration-200 hover:bg-white/10 hover:text-white hover:rotate-90 active:scale-90 outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#121212] shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
                  <Package className="h-10 w-10 text-[#3A3C40]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">السلة فارغة حالياً</p>
                  <p className="mt-2 text-sm text-[#D3D3D3]/70">لم تقم بإضافة أي معدات بعد.</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="mt-4 flex items-center gap-2 rounded-full border border-[#F2A900]/30 bg-[#F2A900]/10 px-6 py-2.5 text-sm font-bold text-[#F2A900] transition-all hover:bg-[#F2A900]/20 hover:scale-105 outline-none"
                >
                  تصفح المعدات
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                  <div className="flex flex-col gap-4">
                    <AnimatePresence initial={false}>
                      {lineItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: -20 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#121212] p-3 shadow-lg transition-colors hover:border-white/10"
                        >
                          <div className="min-w-0 flex-1 pl-2">
                            <p className="truncate text-[15px] font-bold text-white">{item.name}</p>
                            <p className="mt-0.5 text-xs text-[#D3D3D3]/70 font-medium">كود: {item.id}</p>
                            <p className="mt-1.5 text-sm font-black text-[#F2A900]">
                              {item.lineTotal.toLocaleString("ar-EG", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-[10px]">ج.م</span>
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#1A1A1A] p-1 shadow-inner">
                            <button
                              onClick={() => decrement(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#D3D3D3]/70 transition-colors hover:bg-white/10 hover:text-white active:scale-90 outline-none"
                            >
                              <Minus className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                            <motion.span 
                              key={item.qty}
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className="min-w-[2ch] text-center text-sm font-bold text-white tabular-nums"
                            >
                              {item.qty}
                            </motion.span>
                            <button
                              onClick={() => increment(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#D3D3D3]/70 transition-colors hover:bg-white/10 hover:text-white active:scale-90 outline-none"
                            >
                              <Plus className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="border-t border-white/5 bg-[#121212]/80 px-6 py-6 backdrop-blur-md">
                  <div className="mb-5 flex items-end justify-between">
                    <span className="text-base font-medium text-[#D3D3D3]/70">الإجمالي الكلي للطلب</span>
                    <motion.span 
                      key={totalPrice}
                      initial={{ scale: 1.1, color: "#FFF" }}
                      animate={{ scale: 1, color: "#F2A900" }}
                      className="text-2xl font-black drop-shadow-[0_0_10px_rgba(242,169,0,0.2)]"
                    >
                      {totalPrice.toLocaleString("ar-EG", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-sm">ج.م</span>
                    </motion.span>
                  </div>

                  <a
                    href={checkoutUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#1DA851] py-4 text-base font-black text-[#121212] shadow-[0_8px_30px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(37,211,102,0.5)] active:scale-95"
                  >
                    <MessageCircle className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" strokeWidth={2.2} />
                    تأكيد الطلب عبر واتساب
                  </a>
                  <p className="mt-4 text-center text-xs font-medium text-[#808080]">
                    سيتم مراجعة الطلب وتأكيد الأسعار
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------------------- */
/* Root                                                                      */
/* ----------------------------------------------------------------------- */

export default function FalconStore({ products = DEMO_PRODUCTS, logoSrc = "/logo-cropped.png" }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const productsRef = useRef(null);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <CartProvider products={products}>
      <div dir="rtl" className="min-h-screen bg-[#121212] font-['Tajawal',_'Cairo',_sans-serif] pb-32">
        <Header logoSrc={logoSrc} onScrollDown={scrollToProducts} />
        <div ref={productsRef} className="scroll-mt-24">
          <FeaturesBanner />
          <SearchAndFilters
            query={query}
            setQuery={setQuery}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
          <ProductGrid products={products} query={query} activeCategory={activeCategory} />
        </div>
        <FloatingActions />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
