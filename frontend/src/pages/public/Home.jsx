import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  Cpu, 
  Lock,
  ChevronRight,
  TrendingUp,
  Building2,
  Users,
  GraduationCap
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getSafeImage } from '../../utils/safeData';

export const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { items, stats } = useData();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/browse?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCategory)}`);
  };

  const recentFoundItems = items
    .filter(i => i.type === 'found')
    .slice(0, 4);

  const categories = ['All', 'Electronics', 'Bags & Wallets', 'Jewelry & Watches', 'Keys & Cards', 'Clothing', 'Documents', 'Other'];

  return (
    <div className="w-full space-y-12 sm:space-y-20 pb-16 overflow-x-hidden">
      
      {/* Hero Section - Full width container */}
      <section className="relative w-full pt-8 pb-16 lg:py-24 bg-gradient-to-b from-cream-50 via-cream-100 to-sand-100 border-b border-sand-300">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center">
            
            {/* Left Column: Heading, Copy & Search */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-200/90 border border-sand-300 text-xs font-semibold text-olive">
                <Building2 className="w-4 h-4 text-terracotta" />
                <span>Hashu Advani Memorial Complex (HAMC), Chembur</span>
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
                <span className="text-charcoal-muted font-normal">VES Community</span>
              </div>

              {/* Required Exact Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-olive leading-[1.12]">
                Lost something at HAMC?
              </h1>

              {/* Required Exact Supporting Text */}
              <p className="text-base sm:text-lg text-charcoal-light max-w-2xl leading-relaxed">
                TraceBack helps the Hashu Advani Memorial Complex community report lost items, discover found belongings and reconnect with what matters.
              </p>

              {/* Fast Campus Search Bar */}
              <form onSubmit={handleSearchSubmit} className="bg-cream-50 p-2 sm:p-2.5 rounded-2xl shadow-warm-lg border border-sand-300 flex flex-col sm:flex-row gap-2 max-w-2xl">
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-sand-200">
                  <Search className="w-5 h-5 text-charcoal-muted flex-shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search: calculator, ID card, earbuds, keys, lab coat..."
                    className="w-full bg-transparent text-sm text-charcoal placeholder-charcoal-muted focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs font-medium text-olive bg-sand-100 border border-sand-200 rounded-xl px-3 py-3 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="btn-terracotta px-5 py-3 text-sm font-semibold whitespace-nowrap shadow-sm"
                  >
                    Search Catalog
                  </button>
                </div>
              </form>

              {/* Action CTAs - Protected report links */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/user/report-lost"
                  className="btn-terracotta px-6 py-3 text-sm font-semibold shadow-sm flex items-center gap-2"
                >
                  Report Lost Item
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/user/report-found"
                  className="btn-olive px-6 py-3 text-sm font-semibold shadow-sm"
                >
                  Report Found Item
                </Link>
                <Link
                  to="/browse"
                  className="btn-secondary px-5 py-3 text-sm font-semibold"
                >
                  Browse Campus Registry
                </Link>
              </div>

              {/* Community & Verification Trust Indicators */}
              <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-charcoal-muted border-t border-sand-200/80">
                <div className="flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-4 h-4 text-olive" />
                  <span>Students, Faculty & Staff</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Main Gate & Library Custody Verified</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-4 h-4 text-terracotta" />
                  <span>Amazon Rekognition Vision Matching</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div className="absolute -inset-2 bg-gradient-to-tr from-sage-200 to-terracotta/20 rounded-3xl filter blur-xl opacity-70"></div>
                
                {/* Floating Campus Match Card Preview */}
                <div className="relative bg-cream-50 rounded-2xl border border-sand-300 shadow-warm-xl p-6 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-sand-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-olive flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-terracotta" />
                      Live AI Match Spotlight
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      97% Match Score
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Lost side */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-terracotta uppercase">Reported Lost</span>
                      <div className="aspect-square rounded-xl overflow-hidden border border-sand-300 relative group">
                        <img
                          src="https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=400&q=80"
                          alt="Casio Calculator Lost"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 left-1 bg-charcoal/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                          Lost: 4th Floor Lab
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-charcoal truncate">Casio fx-991CW Calculator</p>
                    </div>

                    {/* Found side */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-olive uppercase">Found in Custody</span>
                      <div className="aspect-square rounded-xl overflow-hidden border border-sand-300 relative group">
                        <img
                          src="https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=400&q=80"
                          alt="Casio Calculator Found"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 left-1 bg-olive/90 text-white text-[9px] px-1.5 py-0.5 rounded">
                          Custody: Main Gate Desk
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-charcoal truncate">HAMC Security Cabin</p>
                    </div>
                  </div>

                  <div className="p-3 bg-sand-100 rounded-xl space-y-1.5 text-xs text-charcoal-light">
                    <div className="flex justify-between font-medium">
                      <span>Rekognition Model Affinity:</span>
                      <span className="text-olive font-bold">98% Geometric Cosine Match</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Proximity Radius:</span>
                      <span className="text-olive font-bold">HAMC Lab Complex (0.05 km)</span>
                    </div>
                  </div>

                  <Link
                    to="/user/matches/mtc_101"
                    className="w-full btn-terracotta py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Inspect Match & Claim Item
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Counter Band - Full width */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full bg-sand-200/60 rounded-3xl p-6 sm:p-10 border border-sand-300 shadow-warm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-olive">{(stats?.totalReports || 0).toLocaleString()}+</p>
              <p className="text-xs sm:text-sm font-medium text-charcoal-light mt-1">Campus Items Logged</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-terracotta">{(stats?.resolvedCount || stats?.resolvedReports || 0).toLocaleString()}+</p>
              <p className="text-xs sm:text-sm font-medium text-charcoal-light mt-1">Reunited with Owners</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-olive">{stats?.rekognitionAccuracy || 98.4}%</p>
              <p className="text-xs sm:text-sm font-medium text-charcoal-light mt-1">Rekognition Accuracy</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-terracotta">{stats?.avgReuniteTimeDays || 1.2} Days</p>
              <p className="text-xs sm:text-sm font-medium text-charcoal-light mt-1">Average Turnaround</p>
            </div>
          </div>
        </div>
      </section>

      {/* How TraceBack Works at HAMC - Full width */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
            Campus Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-olive">
            How TraceBack Operates at HAMC
          </h2>
          <p className="text-sm sm:text-base text-charcoal-light">
            Connecting students, faculty, and facility staff across Hashu Advani Memorial Complex with automated Amazon Rekognition visual matching.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {/* Step 1 */}
          <div className="card-warm p-6 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-sand-200 flex items-center justify-center text-olive font-bold text-lg">
              01
            </div>
            <h3 className="text-lg font-semibold text-olive">Submit Report</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Log lost or found belongings with photo upload and specific HAMC location (Library, Canteen, Labs, Quadrangle).
            </p>
            <div className="flex items-center gap-1.5 text-xs text-terracotta font-semibold">
              <Camera className="w-3.5 h-3.5" />
              <span>S3 Encrypted Upload</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card-warm p-6 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-sage-200 flex items-center justify-center text-olive font-bold text-lg">
              02
            </div>
            <h3 className="text-lg font-semibold text-olive">AI Visual Analysis</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Amazon Rekognition identifies object contours, labels, brand markings, and dominant colors instantly.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-olive font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Deep Feature Vectors</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card-warm p-6 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-sand-200 flex items-center justify-center text-olive font-bold text-lg">
              03
            </div>
            <h3 className="text-lg font-semibold text-olive">Campus Match Score</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              The engine matches time, location proximity within HAMC Chembur, and visual vectors to calculate confidence.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-terracotta font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Instant Match Alerts</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="card-warm p-6 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-sage-200 flex items-center justify-center text-olive font-bold text-lg">
              04
            </div>
            <h3 className="text-lg font-semibold text-olive">Verified Handover</h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              Claimants submit undisclosed proof. Custodians at Main Gate or Library verify student ID and hand over property.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-olive font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Custody Verified Handoff</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recently Found Items - Full width */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">
              Campus Custody Inventory
            </span>
            <h2 className="text-3xl font-bold text-olive mt-1">
              Recently Reported Found Items at HAMC
            </h2>
            <p className="text-sm text-charcoal-light mt-1">
              Belongings catalogued in campus custody awaiting verification by their owners.
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:underline"
          >
            <span>View All Found Items ({items.filter(i => i.type === 'found').length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {recentFoundItems.map((item) => (
            <div key={item.id} className="card-warm overflow-hidden flex flex-col group">
              <div className="relative aspect-video sm:aspect-square overflow-hidden bg-sand-200">
                <img
                  src={getSafeImage(item)}
                  alt={item.title || 'Campus item'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <StatusBadge status={item.status} />
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-charcoal/75 backdrop-blur-sm text-cream-100 text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-terracotta" />
                  {item.rekognitionConfidence}% AI
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-semibold text-charcoal-muted uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h3 className="font-semibold text-olive text-base line-clamp-1 group-hover:text-terracotta transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-charcoal-light line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-sand-200 space-y-1.5 text-xs text-charcoal-muted">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-olive flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span>{item.date}</span>
                    <Link
                      to={`/items/${item.id}`}
                      className="font-semibold text-terracotta hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Facility Banner - Full width */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full bg-olive text-cream-100 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-warm-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta bg-cream-50/10 px-3 py-1 rounded-full border border-cream-50/20">
              HAMC Campus Protocol
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-cream-50 leading-tight">
              Physical Custody at HAMC Chembur
            </h2>
            <p className="text-sm sm:text-base text-cream-200/90 leading-relaxed">
              Found belongings turned in at the Hashu Advani Memorial Complex are securely registered and held at the Main Gate Security Cabin, Central Library, or Admin Custodial Lockers until identity and proof of ownership are verified.
            </p>
            <div className="pt-3 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="btn-terracotta px-6 py-3 text-sm font-semibold"
              >
                Learn About Campus Custody
              </Link>
              <Link
                to="/browse"
                className="px-6 py-3 rounded-lg border border-sand-300/40 text-cream-100 hover:bg-cream-100/10 text-sm font-semibold transition"
              >
                Explore Found Registry
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
