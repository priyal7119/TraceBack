import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  PackageSearch, 
  Sparkles, 
  ShieldCheck, 
  PlusCircle, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Bell,
  Clock,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getSafeImage, FALLBACK_ITEM_IMAGE } from '../../utils/safeData';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { items, myReports: contextMyReports = [], matches, claims, notifications } = useData();

  // User-specific data strictly scoped to authenticated user
  const myReports = (Array.isArray(contextMyReports) && contextMyReports.length > 0)
    ? contextMyReports.filter(i => i.userId === user?.id || i.reportedBy?.id === user?.id)
    : (Array.isArray(items) ? items.filter(i => i.userId === user?.id || i.reportedBy?.id === user?.id) : []);

  const myLostCount = myReports.filter(i => i.type === 'lost').length;
  const myFoundCount = myReports.filter(i => i.type === 'found').length;

  // Matches strictly involving the authenticated user
  const userMatches = (Array.isArray(matches) ? matches : []).filter(m =>
    m && (m.lostUserId === user?.id || m.foundUserId === user?.id ||
          m.lostItem?.userId === user?.id || m.foundItem?.userId === user?.id)
  );
  const myMatches = userMatches.slice(0, 3);
  const myClaimsCount = (Array.isArray(claims) ? claims : []).filter(c => c.claimantId === user?.id).length;
  const unreadNotifs = (Array.isArray(notifications) ? notifications : []).filter(n => !n.read).slice(0, 3);

  // Top high match for this authenticated user
  const topMatch = userMatches.find(m => m.overallScore >= 90);

  return (
    <div className="w-full space-y-8 overflow-x-hidden">
      
      {/* Top Welcome Banner */}
      <div className="w-full bg-sand-200/60 rounded-3xl p-6 sm:p-8 border border-sand-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-50 text-xs font-semibold text-olive border border-sand-300">
            <Building2 className="w-3.5 h-3.5 text-terracotta" />
            <span>Welcome, {user?.name?.split(' ')[0] || 'Member'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
            <span className="text-charcoal-muted uppercase text-[10px]">HAMC Community</span>
          </div>
          <h1 className="text-3xl font-bold text-olive">
            Your Campus Property Hub
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-2xl">
            Monitor active searches, review AWS Rekognition similarity alerts, and coordinate safe custody retrievals at Hashu Advani Memorial Complex, Chembur.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link
            to="/user/report-lost"
            className="flex-1 md:flex-initial btn-terracotta px-5 py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Report Lost
          </Link>
          <Link
            to="/user/report-found"
            className="flex-1 md:flex-initial btn-olive px-5 py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <PackageSearch className="w-4 h-4" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        <Link to="/user/reports?type=lost" className="card-warm p-5 bg-cream-50 hover:border-terracotta transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">My Lost Items</span>
            <div className="w-8 h-8 rounded-lg bg-terracotta-subtle flex items-center justify-center text-terracotta">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-olive">{myLostCount}</p>
          <span className="text-[11px] text-charcoal-muted mt-1 block">Active searches in system</span>
        </Link>

        <Link to="/user/reports?type=found" className="card-warm p-5 bg-cream-50 hover:border-olive transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">Found Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-olive">
              <PackageSearch className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-olive">{myFoundCount}</p>
          <span className="text-[11px] text-charcoal-muted mt-1 block">Awaiting rightful owner</span>
        </Link>

        <Link to="/user/matches" className="card-warm p-5 bg-cream-50 hover:border-terracotta transition border-terracotta/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">AI Matches</span>
            <div className="w-8 h-8 rounded-lg bg-terracotta text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-terracotta">{myMatches.length}</p>
          <span className="text-[11px] text-terracotta font-semibold mt-1 block">Action required on matches</span>
        </Link>

        <Link to="/user/reports" className="card-warm p-5 bg-cream-50 hover:border-olive transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">My Claims</span>
            <div className="w-8 h-8 rounded-lg bg-sand-200 flex items-center justify-center text-olive">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-olive">{myClaimsCount}</p>
          <span className="text-[11px] text-charcoal-muted mt-1 block">In custody review</span>
        </Link>
      </div>

      {/* Top AI Match Spotlight Banner */}
      {topMatch && (
        <div className="w-full bg-gradient-to-r from-sand-200 via-cream-50 to-sand-100 rounded-3xl p-6 border-2 border-terracotta/40 shadow-warm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-terracotta animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-terracotta flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Urgent: High Confidence Match Detected!
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full w-fit">
              {topMatch.overallScore}% Match Affinity {topMatch.visualSimilarity ? `(${topMatch.visualSimilarity}% Visual)` : '(Metadata Match)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex -space-x-3 overflow-hidden flex-shrink-0">
                <img
                  src={getSafeImage(topMatch.lostItem)}
                  alt={topMatch.lostItem?.title || 'Lost item'}
                  onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0"
                />
                <img
                  src={getSafeImage(topMatch.foundItem)}
                  alt={topMatch.foundItem?.title || 'Found item'}
                  onError={(e) => { e.target.src = FALLBACK_ITEM_IMAGE; }}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-terracotta shadow-sm flex-shrink-0"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-olive text-base">
                  Match for your "{topMatch.lostItem?.title || 'Lost Item'}"
                </h3>
                <p className="text-xs text-charcoal-light">
                  A found "{topMatch.foundItem?.title || 'Item'}" at {topMatch.foundItem?.storageLocation || topMatch.foundItem?.location || 'Campus Custody'} matches campus location and report details.
                </p>
                <p className="text-[11px] text-charcoal-muted italic">
                  {topMatch.aiComparison?.rekognitionInsights || 'Match evaluated across campus location, timeframe, and category.'}
                </p>
              </div>
            </div>

            <div className="md:col-span-4 flex sm:justify-end">
              <Link
                to={`/user/matches/${topMatch.id}`}
                className="btn-terracotta px-5 py-2.5 text-xs font-semibold shadow-sm w-full sm:w-auto text-center"
              >
                Inspect Match & Verify Claim →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Split Section: Recent Reports & Activity/Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        
        {/* Left Column: My Reports */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-olive">
              My Active Reports
            </h2>
            <Link to="/user/reports" className="text-xs font-semibold text-terracotta hover:underline">
              View All ({myReports.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {myReports.length === 0 ? (
              <div className="card-warm p-6 text-center text-charcoal-muted text-xs bg-cream-50">
                You haven't submitted any lost or found reports yet at HAMC.
              </div>
            ) : (
              myReports.map((report) => (
                <div key={report.id} className="card-warm p-4 bg-cream-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={getSafeImage(report)}
                      alt={report.title || 'Campus item'}
                      className="w-14 h-14 rounded-xl object-cover border border-sand-300 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${report.type === 'lost' ? 'bg-terracotta-subtle text-terracotta' : 'bg-sage-100 text-olive'}`}>
                          {report.type}
                        </span>
                        <StatusBadge status={report.status} />
                      </div>
                      <h4 className="font-semibold text-olive text-sm truncate">{report.title}</h4>
                      <p className="text-xs text-charcoal-muted truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-olive" />
                        {report.location}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={report.type === 'found' ? `/items/${report.id}` : '/user/reports'}
                    className="p-2 rounded-lg text-charcoal hover:bg-sand-200 transition flex-shrink-0"
                    title="View Report"
                  >
                    <ChevronRight className="w-5 h-5 text-olive" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Notifications Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-olive">
              Recent Campus Alerts
            </h2>
            <Link to="/user/notifications" className="text-xs font-semibold text-terracotta hover:underline">
              View Notifications →
            </Link>
          </div>

          <div className="space-y-3">
            {unreadNotifs.map((n) => (
              <Link
                key={n.id}
                to={n.link}
                className="card-warm p-4 bg-cream-50 block hover:border-sand-400 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-olive flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-terracotta" />
                    {n.title}
                  </span>
                  <span className="text-[10px] text-charcoal-muted">{n.createdAt}</span>
                </div>
                <p className="text-xs text-charcoal-light line-clamp-2">
                  {n.message}
                </p>
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
