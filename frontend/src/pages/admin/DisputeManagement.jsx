import React, { useState } from 'react';
import { 
  Scale, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  FileText, 
  User, 
  ShieldCheck,
  Calendar,
  Clock
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

export const DisputeManagement = () => {
  const { disputes, updateDisputeStatus } = useData();

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [arbitrateModalOpen, setArbitrateModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [chosenClaimant, setChosenClaimant] = useState('');

  const filteredDisputes = disputes.filter(d => {
    if (selectedStatus !== 'All' && d.status !== selectedStatus) return false;
    return true;
  });

  const openArbitrate = (dispute) => {
    setSelectedDispute(dispute);
    setChosenClaimant(dispute.claimants[0]?.name || '');
    setDecisionNotes(dispute.arbitrationDecision || '');
    setArbitrateModalOpen(true);
  };

  const handleArbitrateSubmit = (e) => {
    e.preventDefault();
    if (selectedDispute) {
      updateDisputeStatus(
        selectedDispute.id,
        'resolved',
        `Arbitrated by Custody Administrator. Awarded to: ${chosenClaimant}. Decision rationale: ${decisionNotes}`
      );
      setArbitrateModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Custody Arbitration Tribunal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            Dispute Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light">
            Arbitrate conflicting claims where multiple parties contest ownership of high-value recovered belongings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-sand-200 px-3 py-1.5 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal">
            Active Disputes: <strong className="text-amber-800">{disputes.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-warm p-4 bg-cream-50 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-olive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Contested Custodial Cases</span>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none"
        >
          <option value="All">All Dispute Statuses</option>
          <option value="open">Open (Needs Investigation)</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved Arbitrations</option>
        </select>
      </div>

      {/* Disputes List */}
      {filteredDisputes.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No disputes in this status"
          description="All multi-party ownership claims are currently in harmony."
        />
      ) : (
        <div className="space-y-6">
          {filteredDisputes.map((dispute) => (
            <div key={dispute.id} className="card-warm p-6 bg-cream-50 space-y-5 border-sand-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-olive">
                      {dispute.itemTitle}
                    </span>
                    <StatusBadge status={dispute.status} />
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      {dispute.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted">
                    Dispute ID: {dispute.id} • Assigned Custodian: {dispute.assignedAdmin}
                  </p>
                </div>

                <button
                  onClick={() => openArbitrate(dispute)}
                  className="btn-terracotta px-4 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Scale className="w-4 h-4" />
                  Arbitrate Decision
                </button>
              </div>

              {/* Dispute Reason */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Contestation Reason:
                </span>
                <p className="pl-5 leading-relaxed">{dispute.reason}</p>
              </div>

              {/* Competing Claimants Evidence Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dispute.claimants?.map((c, idx) => (
                  <div key={idx} className="p-4 bg-sand-100/70 rounded-xl border border-sand-300 space-y-2">
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-sand-200">
                      <span className="font-bold text-olive flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-terracotta" />
                        Claimant #{idx + 1}: {c.name}
                      </span>
                      <span className="text-charcoal-muted text-[11px]">{c.claimDate}</span>
                    </div>
                    <p className="text-xs text-charcoal-muted">{c.email}</p>
                    <div className="p-2.5 bg-cream-50 rounded-lg border border-sand-200 text-xs text-charcoal-light">
                      <strong className="text-olive block text-[11px] mb-0.5">Submitted Proof:</strong>
                      {c.evidence}
                    </div>
                  </div>
                ))}
              </div>

              {/* Past Decision Note if resolved */}
              {dispute.arbitrationDecision && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Formal Arbitration Ruling:
                  </span>
                  <p className="pl-5 leading-relaxed">{dispute.arbitrationDecision}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Arbitration Modal */}
      {selectedDispute && (
        <Modal
          isOpen={arbitrateModalOpen}
          onClose={() => setArbitrateModalOpen(false)}
          title={`Arbitration Ruling: ${selectedDispute.itemTitle}`}
        >
          <form onSubmit={handleArbitrateSubmit} className="space-y-4">
            <p className="text-xs text-charcoal-light leading-relaxed">
              Reviewing conflicting evidence between <strong>{selectedDispute.claimants?.map(c => c.name).join(' and ')}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Select Legitimate Owner Based on Evidence
              </label>
              <select
                value={chosenClaimant}
                onChange={(e) => setChosenClaimant(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 rounded-xl p-2.5 text-xs text-charcoal font-medium focus:outline-none focus:border-terracotta"
              >
                {selectedDispute.claimants?.map(c => (
                  <option key={c.name} value={c.name}>{c.name} ({c.email})</option>
                ))}
                <option value="Inconclusive / Custody Withheld">Inconclusive — Withhold item in vault</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Arbitration Rationale & Custody Verification Log
              </label>
              <textarea
                required
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="State the verifiable reason (e.g. Claimant Julian provided valid Tokyo invoice with serial number matching physical watch caseback)."
                className="w-full bg-sand-50 border border-sand-300 rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
              <button
                type="button"
                onClick={() => setArbitrateModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal hover:bg-sand-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-terracotta px-5 py-2 text-xs font-semibold"
              >
                Save & Enforce Ruling
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
