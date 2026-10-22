import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Shield,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Phone,
  Mail,
  AlertCircle,
  X,
  Check,
  Power,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { AppUser, UserStatus } from '@/types';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

export default function UsersManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    users,
    roles,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | UserStatus>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AppUser | null>(null);

  // Form Fields State
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRoleId, setFormRoleId] = useState(roles[0]?.id || 'role-admin');
  const [formPassword, setFormPassword] = useState('123');
  const [formPin, setFormPin] = useState('1234');
  const [formStatus, setFormStatus] = useState<UserStatus>('active');
  const [formAvatar, setFormAvatar] = useState('');

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNameAr = user.nameAr.toLowerCase().includes(q);
        const matchesNameEn = user.name.toLowerCase().includes(q);
        const matchesUsername = user.username.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesPhone = user.phone.includes(q);
        if (!matchesNameAr && !matchesNameEn && !matchesUsername && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      // Role filter
      if (selectedRoleFilter !== 'all' && user.roleId !== selectedRoleFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && user.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  // Open modal for new user
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormRoleId(roles[1]?.id || roles[0]?.id || 'role-cashier');
    setFormPassword('123');
    setFormPin('1234');
    setFormStatus('active');
    setFormAvatar('');
    setIsFormModalOpen(true);
  };

  // Open modal for editing user
  const handleOpenEditModal = (user: AppUser) => {
    setEditingUser(user);
    setFormNameAr(user.nameAr);
    setFormNameEn(user.name);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRoleId(user.roleId);
    setFormPassword(user.password || '123');
    setFormPin(user.pin || '1234');
    setFormStatus(user.status);
    setFormAvatar(user.avatar || '');
    setIsFormModalOpen(true);
  };

  // Save (Create / Update) User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNameAr.trim() || !formUsername.trim()) {
      showToast('يرجى ملء الاسم واسم المستخدم بشكل صحيح', 'warning');
      return;
    }

    // Check duplicate username if adding new
    if (!editingUser) {
      const exists = users.some((u) => u.username.toLowerCase() === formUsername.trim().toLowerCase());
      if (exists) {
        showToast('اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم مستخدم آخر', 'warning');
        return;
      }
    }

    if (editingUser) {
      const updated: AppUser = {
        ...editingUser,
        name: formNameEn.trim() || formNameAr.trim(),
        nameAr: formNameAr.trim(),
        username: formUsername.trim().toLowerCase(),
        email: formEmail.trim() || `${formUsername.trim().toLowerCase()}@matamy.com`,
        phone: formPhone.trim(),
        roleId: formRoleId,
        status: formStatus,
        password: formPassword.trim() || '123',
        pin: formPin.trim() || '1234',
        avatar: formAvatar.trim() || editingUser.avatar,
        updatedAt: new Date().toISOString(),
      };
      await updateUser(updated);
    } else {
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        name: formNameEn.trim() || formNameAr.trim(),
        nameAr: formNameAr.trim(),
        username: formUsername.trim().toLowerCase(),
        email: formEmail.trim() || `${formUsername.trim().toLowerCase()}@matamy.com`,
        phone: formPhone.trim(),
        roleId: formRoleId,
        status: formStatus,
        password: formPassword.trim() || '123',
        pin: formPin.trim() || '1234',
        avatar: formAvatar.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      await addUser(newUser);
    }

    setIsFormModalOpen(false);
  };

  // Toggle user activation / suspension
  const handleToggleStatus = async (user: AppUser) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    await toggleUserStatus(user.id, nextStatus);
  };

  // Quick change user role directly
  const handleQuickChangeRole = async (user: AppUser, newRoleId: string) => {
    if (user.roleId === newRoleId) return;
    const updated = { ...user, roleId: newRoleId, updatedAt: new Date().toISOString() };
    await updateUser(updated);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    await deleteUser(deleteConfirmUser.id);
    setDeleteConfirmUser(null);
  };

  // Statistics
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="المستخدمين والصلاحيات"
        subtitle="إدارة حسابات مستخدمي المنظومة، تعيين الأدوار الوظيفية، وتفعيل أو إيقاف الوصول"
      >
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </PageHeader>

      {/* Tabs Navigation (Separating Roles and Users with separate routes) */}
      <div className="flex items-center gap-2 border-b border-navy-700/60 pb-3">
        <button
          type="button"
          onClick={() => navigate('/users/roles')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            location.pathname === '/users/roles'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 ring-1 ring-brand-400/30'
              : 'text-navy-300 hover:text-white hover:bg-navy-800/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>الأدوار والصلاحيات ({roles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/users')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            location.pathname === '/users'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 ring-1 ring-brand-400/30'
              : 'text-navy-300 hover:text-white hover:bg-navy-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>المستخدمين والحسابات ({users.length})</span>
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="إجمالي مستخدمي النظام"
          value={String(users.length)}
          sublabel="حسابات مسجلة بالفرع"
          color="brand"
        />
        <StatCard
          icon={UserCheck}
          label="الحسابات النشطة"
          value={String(activeUsersCount)}
          sublabel="متاح لهم تسجيل الدخول"
          color="success"
        />
        <StatCard
          icon={UserX}
          label="الحسابات الموقوفة"
          value={String(suspendedUsersCount)}
          sublabel="معطلة وممنوعة من الدخول"
          color={suspendedUsersCount > 0 ? 'warning' : 'blue'}
        />
        <StatCard
          icon={Shield}
          label="الأدوار التشغيلية المتاحة"
          value={String(roles.length)}
          sublabel="مصفوفات صلاحيات معرفة"
          color="purple"
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-navy-700/60">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-navy-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالاسم، اسم المستخدم، الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pr-10 text-xs w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-navy-400 bg-navy-900/60 px-3 py-1.5 rounded-xl border border-navy-700/60">
            <Filter className="w-3.5 h-3.5" />
            <span>الدور:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none pr-1 cursor-pointer"
            >
              <option value="all" className="bg-navy-900 text-white">كل الأدوار</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id} className="bg-navy-900 text-white">
                  {r.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-navy-900/60 p-1 rounded-xl border border-navy-700/60 text-xs">
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                selectedStatusFilter === 'all'
                  ? 'bg-brand-500 text-white font-bold'
                  : 'text-navy-300 hover:text-white'
              }`}
            >
              الكل ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                selectedStatusFilter === 'active'
                  ? 'bg-success-500 text-white font-bold'
                  : 'text-navy-300 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success-400" />
              <span>النشط ({activeUsersCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('suspended')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
                selectedStatusFilter === 'suspended'
                  ? 'bg-warning-500 text-navy-950 font-bold'
                  : 'text-navy-300 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-warning-400" />
              <span>الموقوف ({suspendedUsersCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="glass-card border border-navy-700/60 shadow-xl overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-navy-700/80 bg-navy-900/60 text-navy-300 text-xs font-semibold">
                <th className="py-4 px-5">المستخدم</th>
                <th className="py-4 px-5">الدور الوظيفي والصلاحية</th>
                <th className="py-4 px-5">بيانات الاتصال</th>
                <th className="py-4 px-5">الحالة</th>
                <th className="py-4 px-5">آخر دخول</th>
                <th className="py-4 px-5 text-center">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-navy-400">
                    <UserX className="w-8 h-8 mx-auto mb-2 opacity-40 text-navy-400" />
                    <p className="text-sm font-semibold">لا يوجد مستخدمين مطابقين لمعايير البحث</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleObj = roles.find((r) => r.id === user.roleId);
                  const isCurrent = currentUser?.id === user.id;
                  const isActive = user.status === 'active';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-navy-800/40 transition-colors ${
                        !isActive ? 'opacity-70 bg-navy-950/30' : ''
                      }`}
                    >
                      {/* User Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden shrink-0 ring-1 ring-white/10">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.nameAr} className="w-full h-full object-cover" />
                              ) : (
                                <span>{user.nameAr.charAt(0)}</span>
                              )}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-navy-900 ${
                                isActive ? 'bg-success-500' : 'bg-danger-500'
                              }`}
                              title={isActive ? 'نشط' : 'موقوف'}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-bold text-sm">{user.nameAr}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">
                                  أنت
                                </span>
                              )}
                            </div>
                            <span className="text-navy-400 font-mono text-[11px]">@{user.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <select
                            value={user.roleId}
                            onChange={(e) => handleQuickChangeRole(user, e.target.value)}
                            className="bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-300 focus:outline-none focus:border-brand-500 cursor-pointer"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nameAr}
                              </option>
                            ))}
                          </select>
                          <p className="text-[10px] text-navy-400">
                            {roleObj?.permissions.length || 0} صلاحية معتمدة
                          </p>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          {user.phone ? (
                            <div className="flex items-center gap-1.5 text-navy-300 font-mono" dir="ltr">
                              <Phone className="w-3 h-3 text-navy-400 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-navy-500 text-[11px]">لا يوجد هاتف</span>
                          )}
                          <div className="flex items-center gap-1.5 text-navy-400 text-[11px] truncate max-w-[180px]" dir="ltr">
                            <Mail className="w-3 h-3 text-navy-500 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? 'bg-success-500/15 text-success-400 border border-success-500/30'
                              : 'bg-danger-500/15 text-danger-400 border border-danger-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-success-400 animate-pulse' : 'bg-danger-400'
                            }`}
                          />
                          {isActive ? 'نشط ومفعل' : 'موقوف مؤقتاً'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-5">
                        <span className="text-navy-300 text-xs font-mono">{user.lastLogin || 'لم يسجل بعد'}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Toggle Status Button (Activate / Suspend) */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-warning-500/10 hover:bg-warning-500/20 text-warning-400 border border-warning-500/20'
                                : 'bg-success-500/10 hover:bg-success-500/20 text-success-400 border border-success-500/20'
                            }`}
                            title={isActive ? 'إيقاف المستخدم مؤقتاً' : 'إعادة تفعيل الحساب'}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{isActive ? 'إيقاف الحساب' : 'تفعيل'}</span>
                          </button>

                          {/* Edit User Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="w-8 h-8 rounded-xl bg-navy-800 hover:bg-brand-500/20 text-navy-300 hover:text-brand-400 border border-navy-700/60 flex items-center justify-center transition-all cursor-pointer"
                            title="تعديل بيانات المستخدم والدور"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User Button */}
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => setDeleteConfirmUser(user)}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-navy-900 text-navy-600 border-navy-800 cursor-not-allowed opacity-40'
                                : 'bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border-danger-500/20 cursor-pointer'
                            }`}
                            title={isCurrent ? 'لا يمكنك حذف حسابك الحالي' : 'حذف المستخدم نهائياً'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* Create / Edit User Modal */}
      {/* ==================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-lg border border-navy-700 shadow-2xl overflow-hidden rounded-3xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-navy-700/60 flex items-center justify-between bg-navy-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">
                    {editingUser ? `تعديل بيانات: ${editingUser.nameAr}` : 'إضافة مستخدم جديد للنظام'}
                  </h3>
                  <p className="text-navy-400 text-xs">أدخل البيانات الأساسية وحدد الدور الوظيفي المعتمد</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    الاسم بالكامل (عربي) <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد عبد الله"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    اسم المستخدم (Username) <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ahmed.pos"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="input-field text-sm font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    placeholder="01012345678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="input-field text-sm font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    placeholder="user@matamy.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="input-field text-sm font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Role Picker (Connected to dynamic database roles) */}
              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1">
                  الدور الوظيفي والصلاحيات <span className="text-danger-400">*</span>
                </label>
                <select
                  value={formRoleId}
                  onChange={(e) => setFormRoleId(e.target.value)}
                  className="input-field text-sm font-semibold text-brand-300"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} className="bg-navy-900 text-white">
                      {r.nameAr} - ({r.permissions.length} صلاحية)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-navy-400 mt-1">
                  {roles.find((r) => r.id === formRoleId)?.descriptionAr}
                </p>
              </div>

              {/* Password & Status */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="input-field text-sm font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-200 mb-1">
                    رمز PIN السريع للكاشير (4 أرقام)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    className="input-field text-sm font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Status Picker */}
              <div>
                <label className="block text-xs font-semibold text-navy-200 mb-1.5">
                  حالة الحساب
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('active')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      formStatus === 'active'
                        ? 'bg-success-500/20 text-success-400 border-success-500/40 shadow-sm'
                        : 'bg-navy-900/60 border-navy-700/60 text-navy-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-success-400" />
                    <span>نشط ومفعل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('suspended')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      formStatus === 'suspended'
                        ? 'bg-danger-500/20 text-danger-400 border-danger-500/40 shadow-sm'
                        : 'bg-navy-900/60 border-navy-700/60 text-navy-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-danger-400" />
                    <span>موقوف وممنوع</span>
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="btn-ghost px-5 py-2.5 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'حفظ التعديلات' : 'إنشاء المستخدم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* Delete Confirmation Modal */}
      {/* ==================================================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 border border-danger-500/30 shadow-2xl rounded-2xl animate-scale-in text-right">
            <div className="w-12 h-12 rounded-2xl bg-danger-500/15 text-danger-400 flex items-center justify-center mb-4 ring-1 ring-danger-500/30 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-white font-bold text-lg text-center mb-1">
              تأكيد حذف حساب "{deleteConfirmUser.nameAr}"؟
            </h3>
            <p className="text-navy-300 text-xs text-center leading-relaxed mb-6">
              سيتم حذف المستخدم @{deleteConfirmUser.username} نهائياً من قاعدة البيانات وإلغاء صلاحية تسجيل الدخول الخاصة به.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 btn-ghost py-2.5 text-xs font-bold cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 btn-danger py-2.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-danger-500/30"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الحساب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
