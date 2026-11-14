import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  SlidersHorizontal,
  X,
  Building2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { getSafeImage, FALLBACK_ITEM_IMAGE } from '../../utils/safeData';

export const BrowseFoundItems = () => {
  const { items } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters from URL or local state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Categories list
  const categories = [
    'All',
    'Electronics',
    'Bags & Wallets',
    'Jewelry & Watches',
    'Keys & Cards',
    'Clothing',
    'Documents',
    'Other'
  ];

  // Specific HAMC locations from items
  const locations = useMemo(() => {
    const locSet = new Set(
      items
        .filter(i => i.type === 'found' && i.location)
        .map(i => i.location)
    );
    if (locSet.size > 0) {
      return ['All', ...Array.from(locSet)];
    }
    return [
      'All',
      'HAMC Engineering Lab Block, 4th Floor Lab 402',
      'HAMC Central Library, 2nd Floor Reading Hall',
      'Ground Floor Canteen, Table Bay 6',
      'HAMC Quadrangle & Central Amphitheatre steps',
      'HAMC Central Auditorium, Row G Seat 14',
      'HAMC Sports Turf / Ground perimeter',
      'HAMC Pharmacy Block, Organic Chemistry Lab #1'
    ];
  }, [items]);

  // Filtered & Sorted items (Only found items)
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        if (item.type !== 'found') return false;

        // Search text
        if (searchTerm) {
          const matchTitle = item.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchDesc = item.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchLoc = item.location.toLowerCase().includes(searchTerm.toLowerCase());
          const matchTags = item.aiTags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
          if (!matchTitle && !matchDesc && !matchLoc && !matchTags) return false;
        }

        // Category
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Status
        if (selectedStatus !== 'All' && item.status !== selectedStatus) {
          return false;
        }

        // Location
        if (selectedLocation !== 'All' && item.location !== selectedLocation) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.date) - new Date(a.date);
        }
        if (sortBy === 'confidence') {
          return (b.rekognitionConfidence || 0) - (a.rekognitionConfidence || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [items, searchTerm, selectedCategory, selectedStatus, selectedLocation, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedLocation('All');
    setSortBy('recent');
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8 overflow-x-hidden">
      
      {/* Page Header - Full width */}
      <div className="w-full bg-sand-200/50 rounded-3xl p-6 sm:p-10 border border-sand-300">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-50 text-xs font-semibold text-olive border border-sand-300">
            <Building2 className="w-3.5 h-3.5 text-terracotta" />
            <span>HAMC Campus Custody Registry • Chembur</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-olive">
            Browse Found Items at HAMC
          </h1>
          <p className="text-sm sm:text-base text-charcoal-light leading-relaxed">
            Search items turned in to the Main Gate Security Cabin, Central Library, and campus facility offices. If you recognize your property, inspect the details to file an ownership claim.
          </p>
        </div>

        {/* Search & Quick Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by item name, brand, color, or HAMC location..."
              className="w-full bg-cream-50 pl-11 pr-4 py-3 rounded-xl border border-sand-300 text-sm text-charcoal placeholder-charcoal-muted focus:outline-none focus:border-terracotta transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-charcoal-muted hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="sm:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-sand-200 border border-sand-300 text-sm font-semibold text-charcoal"
            >
              <SlidersHorizontal className="w-4 h-4 text-terracotta" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters Layout - Full width */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
        
        {/* Left Filter Sidebar */}
        <div className={`space-y-6 lg:block ${mobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="card-warm p-5 space-y-6 bg-cream-50">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <span className="font-semibold text-olive text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-terracotta" />
                Filter Catalog
              </span>
              {(searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedLocation !== 'All') && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-terracotta hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                Category
              </label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-olive text-white font-semibold'
                        : 'text-charcoal hover:bg-sand-200'
                    }`}
                  >
                    <span>{cat}</span>
                    {cat === 'All' ? (
                      <span className="text-[10px] opacity-75">
                        {items.filter(i => i.type === 'found').length}
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-75">
                        {items.filter(i => i.type === 'found' && i.category === cat).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* HAMC Campus Spot Filter */}
            <div className="space-y-2 pt-2 border-t border-sand-200">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                Campus Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-sand-100 border border-sand-300 rounded-lg p-2.5 text-xs text-charcoal font-medium focus:outline-none"
              >
                <option value="All">All HAMC Spots</option>
                {locations.filter(l => l !== 'All').map(l => (
                  <option key={l} value={l}>{l.replace('HAMC ', '')}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2 pt-2 border-t border-sand-200">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                Custody Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-sand-100 border border-sand-300 rounded-lg p-2.5 text-xs text-charcoal font-medium focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active (Unclaimed)</option>
                <option value="matched">Matched by Rekognition</option>
                <option value="under_review">Claim Under Review</option>
                <option value="claimed">Claimed</option>
                <option value="resolved">Resolved / Returned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sand-300 gap-4">
            <div className="text-xs sm:text-sm text-charcoal-light">
              Showing <span className="font-bold text-olive">{filteredItems.length}</span> found items across HAMC Chembur
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-cream-50 border border-sand-300 rounded-lg px-2.5 py-1.5 text-xs text-olive font-medium focus:outline-none"
                >
                  <option value="recent">Most Recent Date</option>
                  <option value="confidence">Highest AI Confidence</option>
                  <option value="title">Item Name (A-Z)</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="flex items-center border border-sand-300 rounded-lg bg-cream-50 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-sand-200 text-olive' : 'text-charcoal-muted hover:text-charcoal'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-sand-200 text-olive' : 'text-charcoal-muted hover:text-charcoal'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results List / Grid */}
          {filteredItems.length === 0 ? (
            <EmptyState
              title="No items found"
              description="Try relaxing your search terms or selecting a different campus category."
              actionLabel="Reset All Filters"
              onAction={resetFilters}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="card-warm overflow-hidden flex flex-col group bg-cream-50">
                  <div className="relative aspect-square overflow-hidden bg-sand-200">
                    <img
                      src={getSafeImage(item)}
                      alt={item.title || 'Campus item'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = FALLBACK_ITEM_IMAGE;
                      }}
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
                      <span className="text-[10px] font-bold text-charcoal-muted uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h3 className="font-semibold text-olive text-base line-clamp-1 group-hover:text-terracotta transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-charcoal-light line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-sand-200 text-xs text-charcoal-muted">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-olive flex-shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span>{item.date}</span>
                        <Link
                          to={`/items/${item.id}`}
                          className="font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
                        >
                          Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="card-warm p-4 bg-cream-50 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <img
                    src={getSafeImage(item)}
                    alt={item.title || 'Campus item'}
                    className="w-full sm:w-36 h-36 rounded-xl object-cover border border-sand-300 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = FALLBACK_ITEM_IMAGE;
                    }}
                  />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={item.status} />
                      <span className="text-xs font-semibold text-charcoal-muted uppercase">{item.category}</span>
                      <span className="text-xs text-olive font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-terracotta" />
                        {item.rekognitionConfidence}% Rekognition Confidence
                      </span>
                    </div>

                    <h3 className="font-semibold text-olive text-lg leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-charcoal-light line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-muted pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-olive" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-olive" />
                        {item.date} at {item.time}
                      </span>
                    </div>
                  </div>

                  <div className="sm:self-center flex sm:flex-col gap-2 w-full sm:w-auto">
                    <Link
                      to={`/items/${item.id}`}
                      className="btn-terracotta text-xs px-4 py-2 text-center w-full"
                    >
                      View & Claim
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
