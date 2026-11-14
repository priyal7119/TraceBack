import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  FileQuestion, 
  PackageCheck, 
  Sparkles, 
  Scale, 
  ClipboardCheck, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Cpu,
  Database,
  Cloud
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminOverview = () => {
  const { items, matches, claims, disputes, stats } = useData();

  const lostCount = items.filter(i => i.type === 'lost').length;
  const foundCount = items.filter(i => i.type === 'found').length;
  const pendingClaims = claims.filter(c => c.status === 'pending' || c.status === 'under_review');
  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'investigating');

  const recentSubmissions = items.slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-sand-200/60 rounded-3xl p-6 sm:p-8 border border-sand-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive text-cream-100 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-terracotta" />
            <span>TraceBack Custody & Operations Hub</span>
          </div>
          <h1 className="text-3xl font-bold text-olive">
            Administrative Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light max-w-xl">
            Real-time monitoring across HAMC Chembur campus facilities, Amazon Rekognition machine learning inferences, and contested custody arbitrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/claims"
            className="btn-terracotta px-4 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-4 h-4" />
            Review Claims ({pendingClaims.length})
          </Link>
          <Link
            to="/admin/disputes"
            className="btn-olive px-4 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4" />
            Disputes ({openDisputes.length})
          </Link>
        </div>
      </div>

      {/* Main Stats KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link to="/admin/lost-reports" className="card-warm p-5 bg-cream-50 hover:border-terracotta transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">Lost Reports</span>
            <div className="w-8 h-8 rounded-lg bg-terracotta-subtle flex items-center justify-center text-terracotta">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-olive">{lostCount}</p>
          <span className="text-[11px] text-charcoal-muted mt-1 block">Active missing inquiries</span>
        </Link>

        <Link to="/admin/found-reports" className="card-warm p-5 bg-cream-50 hover:border-olive transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">Found In Custody</span>
            <div className="w-8 h-8 rounded-lg bg-sage-200 flex items-center justify-center text-olive">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-olive">{foundCount}</p>
          <span className="text-[11px] text-charcoal-muted mt-1 block">Stored across vaults</span>
        </Link>

        <Link to="/admin/claims" className="card-warm p-5 bg-cream-50 hover:border-terracotta transition border-terracotta/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta">Pending Claims</span>
            <div className="w-8 h-8 rounded-lg bg-terracotta text-white flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-terracotta">{pendingClaims.length}</p>
          <span className="text-[11px] text-terracotta font-semibold mt-1 block">Action required for release</span>
        </Link>

        <Link to="/admin/disputes" className="card-warm p-5 bg-cream-50 hover:border-olive transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">Open Disputes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-olive">{openDisputes.length}</p>
          <span className="text-[11px] text-charcoal-muted mt-1 block">Contested ownership cases</span>
        </Link>
      </div>

      {/* Cloud & Rekognition Pipeline Health */}
      <div className="card-warm p-6 bg-cream-50 space-y-4">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-terracotta" />
            <h3 className="text-lg font-bold text-olive">
              AWS Infrastructure & Machine Learning Status
            </h3>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            All Services Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-sand-100 rounded-xl space-y-1 text-xs">
            <span className="text-charcoal-muted font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              Amazon Rekognition Precision
            </span>
            <p className="text-2xl font-bold text-olive">{stats.rekognitionAccuracy}%</p>
            <p className="text-[11px] text-charcoal-light">Avg. visual vector confidence across {stats.totalReports} scans</p>
          </div>

          <div className="p-4 bg-sand-100 rounded-xl space-y-1 text-xs">
            <span className="text-charcoal-muted font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-olive" />
              DynamoDB Single-Table Latency
            </span>
            <p className="text-2xl font-bold text-olive">4.2 ms</p>
            <p className="text-[11px] text-charcoal-light">Sub-second query response on partition keys</p>
          </div>

          <div className="p-4 bg-sand-100 rounded-xl space-y-1 text-xs">
            <span className="text-charcoal-muted font-medium flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-terracotta" />
              Amazon S3 Media Bucket
            </span>
            <p className="text-2xl font-bold text-olive">AES-256</p>
            <p className="text-[11px] text-charcoal-light">Presigned temporary uploads encrypted at rest</p>
          </div>
        </div>
      </div>

      {/* Split Section: Moderation Queue & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Pending Claims & Disputes Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-olive">
              Immediate Moderation Queue
            </h3>
            <span className="text-xs font-semibold text-terracotta">{pendingClaims.length + openDisputes.length} tasks</span>
          </div>

          <div className="space-y-3">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="card-warm p-4 bg-cream-50 border-l-4 border-l-terracotta space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta">
                    Ownership Claim #{claim.id}
                  </span>
                  <StatusBadge status={claim.status} />
                </div>
                <h4 className="font-semibold text-olive text-sm truncate">{claim.itemTitle}</h4>
                <p className="text-xs text-charcoal-light line-clamp-2">
                  Claimant: <strong className="text-olive">{claim.claimantName}</strong> ({claim.claimantEmail})
                </p>
                <div className="pt-2 flex justify-end">
                  <Link
                    to="/admin/claims"
                    className="text-xs font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
                  >
                    Examine Evidence →
                  </Link>
                </div>
              </div>
            ))}

            {openDisputes.map((dispute) => (
              <div key={dispute.id} className="card-warm p-4 bg-cream-50 border-l-4 border-l-amber-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Disputed Item #{dispute.id}
                  </span>
                  <StatusBadge status={dispute.status} />
                </div>
                <h4 className="font-semibold text-olive text-sm truncate">{dispute.itemTitle}</h4>
                <p className="text-xs text-charcoal-light line-clamp-2">{dispute.reason}</p>
                <div className="pt-2 flex justify-end">
                  <Link
                    to="/admin/disputes"
                    className="text-xs font-semibold text-amber-800 hover:underline inline-flex items-center gap-1"
                  >
                    Open Arbitration Room →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Submissions Audit */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-olive">
              Recent Case Submissions
            </h3>
            <Link to="/admin/found-reports" className="text-xs font-semibold text-terracotta hover:underline">
              View All Reports →
            </Link>
          </div>

          <div className="space-y-3">
            {recentSubmissions.map((item) => (
              <div key={item.id} className="card-warm p-4 bg-cream-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover border border-sand-300 flex-shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.type === 'lost' ? 'bg-terracotta-subtle text-terracotta' : 'bg-sage-100 text-olive'}`}>
                        {item.type}
                      </span>
                      <StatusBadge status={item.status} />
                      <span className="text-[11px] text-charcoal-muted">{item.category}</span>
                    </div>
                    <h4 className="font-semibold text-olive text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-charcoal-muted truncate">
                      {item.location} • {item.date}
                    </p>
                  </div>
                </div>

                <Link
                  to={item.type === 'lost' ? '/admin/lost-reports' : '/admin/found-reports'}
                  className="p-2 rounded-lg text-charcoal hover:bg-sand-200 transition"
                  title="Inspect"
                >
                  <ArrowRight className="w-4 h-4 text-olive" />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
