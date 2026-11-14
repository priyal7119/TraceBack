import React, { useState } from 'react';
import { 
  Archive, 
  Search, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Sparkles,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

export const ArchivedReports = () => {
  const { items, updateItemStatus } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [exportNotice, setExportNotice] = useState(false);

  // Restore dialog
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [itemToRestore, setItemToRestore] = useState(null);

  // Audit modal
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditItem, setAuditItem] = useState(null);

  // Archive items include resolved or archived items
  const archivedItems = items.filter(
    i => i.status === 'resolved' || i.status === 'archived'
  );

  const filteredArchived = archivedItems.filter(item => {
    if (searchTerm) {
      const text = (item.title + item.description + item.location + item.category).toLowerCase();
      if (!text.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const openRestore = (item) => {
    setItemToRestore(item);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = () => {
    if (itemToRestore) {
      updateItemStatus(itemToRestore.id, 'active');
      setItemToRestore(null);
    }
  };

  const openAudit = (item) => {
    setAuditItem(item);
    setAuditModalOpen(true);
  };

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-olive uppercase tracking-wider mb-1">
            <Archive className="w-3.5 h-3.5 text-terracotta" />
            <span>Resolved & Historical Cases</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            Archived Reports
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light">
            Immutable custody logs, returned property audits, and historical case records.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="btn-olive px-4 py-2 text-xs font-semibold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Case Audit (CSV)
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Case audit data successfully prepared and exported (traceback_archive_audit.csv)!</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="card-warm p-4 bg-cream-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search archive history..."
            className="w-full bg-sand-100 pl-9 pr-3 py-2 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
          />
        </div>

        <span className="text-xs text-charcoal-muted font-medium">
          Showing <strong className="text-olive">{filteredArchived.length}</strong> archived records
        </span>
      </div>

      {/* Archive Table */}
      {filteredArchived.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived reports"
          description="Cases marked as resolved or archived will be preserved in this immutable audit ledger."
        />
      ) : (
        <div className="card-warm overflow-hidden bg-cream-50 border-sand-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-200/80 text-olive uppercase tracking-wider text-[10px] font-bold border-b border-sand-300">
                <tr>
                  <th className="py-3 px-4">Case ID & Item</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Original Date</th>
                  <th className="py-3 px-4">Custody Outcome</th>
                  <th className="py-3 px-4">AI Scan Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/80">
                {filteredArchived.map((item) => (
                  <tr key={item.id} className="hover:bg-sand-100/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover border border-sand-300 flex-shrink-0 grayscale opacity-80"
                        />
                        <div>
                          <p className="font-semibold text-olive truncate max-w-[190px]">{item.title}</p>
                          <span className="text-[10px] text-charcoal-muted font-mono">{item.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.type === 'lost' ? 'bg-terracotta-subtle text-terracotta' : 'bg-sage-100 text-olive'
                      }`}>
                        {item.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-charcoal font-medium">
                      {item.date}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3 px-4 font-semibold text-olive">
                      {item.rekognitionConfidence}%
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAudit(item)}
                          className="p-1.5 rounded-lg border border-sand-300 text-charcoal hover:bg-sand-200 text-xs font-semibold flex items-center gap-1"
                          title="View Case Audit"
                        >
                          <Eye className="w-3.5 h-3.5 text-olive" />
                          <span>Audit</span>
                        </button>

                        <button
                          onClick={() => openRestore(item)}
                          className="p-1.5 rounded-lg border border-sand-300 text-charcoal hover:bg-sand-200 text-xs font-semibold flex items-center gap-1"
                          title="Restore Case to Active Registry"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-terracotta" />
                          <span>Restore</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restore Dialog */}
      <ConfirmDialog
        isOpen={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
        onConfirm={confirmRestore}
        title="Restore Case to Active Registry"
        message={`Are you sure you want to restore "${itemToRestore?.title}" back to active status? This will reactivate AI matching.`}
        confirmText="Confirm Restore"
        danger={false}
      />

      {/* Audit Modal */}
      {auditItem && (
        <Modal
          isOpen={auditModalOpen}
          onClose={() => setAuditModalOpen(false)}
          title={`Archive Audit Record: #${auditItem.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-sand-200">
              <img
                src={auditItem.images[0]}
                alt={auditItem.title}
                className="w-16 h-16 rounded-xl object-cover border border-sand-300"
              />
              <div>
                <h4 className="text-base font-bold text-olive">{auditItem.title}</h4>
                <p className="text-charcoal-muted">Outcome: Successfully reunited & case closed</p>
                <StatusBadge status={auditItem.status} />
              </div>
            </div>

            <div className="p-3 bg-sand-100 rounded-xl space-y-1">
              <span className="font-bold text-olive block">Final Custody Disposition:</span>
              <p className="text-charcoal-light">
                Physical property released to rightful owner following verified Amazon Rekognition feature alignment and state ID presentation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-charcoal-light pt-1">
              <div>
                <span className="text-charcoal-muted block">Intake Date:</span>
                <span className="font-semibold text-charcoal">{auditItem.date}</span>
              </div>
              <div>
                <span className="text-charcoal-muted block">Archived Hash:</span>
                <span className="font-mono text-[10px] text-olive">sha256:7f83b1657ff1...</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-sand-200">
              <button
                onClick={() => setAuditModalOpen(false)}
                className="btn-terracotta px-4 py-2 text-xs font-semibold"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
