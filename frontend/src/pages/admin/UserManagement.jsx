import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Ban, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

export const UserManagement = () => {
  const { users, updateUserStatus, updateUserRole } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Role edit modal
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('User');

  // Suspend dialog
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState(null);

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    if (searchTerm) {
      const text = (u.name + u.email + (u.phone || '')).toLowerCase();
      if (!text.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const openRoleEdit = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditRoleModalOpen(true);
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      updateUserRole(selectedUser.id, newRole);
      setEditRoleModalOpen(false);
    }
  };

  const openSuspend = (user) => {
    setUserToSuspend(user);
    setSuspendDialogOpen(true);
  };

  const confirmSuspendToggle = () => {
    if (userToSuspend) {
      const nextStatus = userToSuspend.status === 'Active' ? 'Suspended' : 'Active';
      updateUserStatus(userToSuspend.id, nextStatus);
      setUserToSuspend(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-olive uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5 text-terracotta" />
            <span>Community Directory & Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-olive">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-light">
            Manage HAMC campus community accounts (students, teaching faculty, non-teaching staff), assign custodial staff privileges, and enforce account trust.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-sand-200 px-3 py-1.5 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal">
            Total Accounts: <strong className="text-olive">{users.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-warm p-4 bg-cream-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email address..."
            className="w-full bg-sand-100 pl-9 pr-3 py-2 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="All">All Roles</option>
            <option value="User">Standard User</option>
            <option value="Moderator / Staff">Staff / Moderator</option>
            <option value="Administrator">Administrator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-2 text-xs text-charcoal font-medium focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match search"
          description="Try broadening your search query or role filter."
        />
      ) : (
        <div className="card-warm overflow-hidden bg-cream-50 border-sand-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-200/80 text-olive uppercase tracking-wider text-[10px] font-bold border-b border-sand-300">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Activity Stats</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/80">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-sand-100/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-sand-300"
                        />
                        <div>
                          <p className="font-semibold text-olive truncate">{u.name}</p>
                          <span className="text-[10px] text-charcoal-muted truncate">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${
                        u.role === 'Administrator'
                          ? 'bg-terracotta-subtle text-terracotta border border-terracotta/30'
                          : u.role.includes('Staff')
                          ? 'bg-olive text-cream-100'
                          : 'bg-sand-200 text-charcoal'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.status === 'Active'
                          ? 'text-emerald-800 bg-emerald-50'
                          : 'text-rose-800 bg-rose-50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-charcoal-light">
                      <span>{u.reportsCount || 0} Reports</span> • <span>{u.claimsCount || 0} Claims</span>
                    </td>

                    <td className="py-3 px-4 text-charcoal font-medium">
                      {u.joinedDate}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openRoleEdit(u)}
                          className="p-1.5 rounded-lg border border-sand-300 text-charcoal hover:bg-sand-200 transition"
                          title="Change Role"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-olive" />
                        </button>
                        <button
                          onClick={() => openSuspend(u)}
                          className={`p-1.5 rounded-lg border transition ${
                            u.status === 'Active'
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={u.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                        >
                          <Ban className="w-3.5 h-3.5" />
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

      {/* Role Edit Modal */}
      {selectedUser && (
        <Modal
          isOpen={editRoleModalOpen}
          onClose={() => setEditRoleModalOpen(false)}
          title={`Edit Role Permissions: ${selectedUser.name}`}
        >
          <form onSubmit={handleRoleSubmit} className="space-y-4">
            <p className="text-xs text-charcoal-light leading-relaxed">
              Updating administrative privileges for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Select System Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-sand-50 border border-sand-300 rounded-xl p-2.5 text-xs text-charcoal font-semibold focus:outline-none focus:border-terracotta"
              >
                <option value="User">Standard User (Report & Claim)</option>
                <option value="Moderator / Staff">Moderator / Transit Custodian</option>
                <option value="Administrator">Full Administrator (Tribunal & Users)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
              <button
                type="button"
                onClick={() => setEditRoleModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-sand-300 text-xs font-semibold text-charcoal hover:bg-sand-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-terracotta px-5 py-2 text-xs font-semibold"
              >
                Save Role
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        isOpen={suspendDialogOpen}
        onClose={() => setSuspendDialogOpen(false)}
        onConfirm={confirmSuspendToggle}
        title={userToSuspend?.status === 'Active' ? 'Suspend User Account' : 'Reactivate User Account'}
        message={
          userToSuspend?.status === 'Active'
            ? `Are you sure you want to suspend "${userToSuspend?.name}"? They will lose access to submitting reports and filing claims.`
            : `Reactivate account for "${userToSuspend?.name}"?`
        }
        confirmText={userToSuspend?.status === 'Active' ? 'Confirm Suspend' : 'Confirm Reactivate'}
        danger={userToSuspend?.status === 'Active'}
      />

    </div>
  );
};
