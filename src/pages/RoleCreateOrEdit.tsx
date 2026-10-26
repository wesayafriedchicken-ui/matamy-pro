import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Role, PermissionModule } from '@/types';
import {
  SYSTEM_PERMISSIONS,
  PERMISSION_MODULE_LABELS,
  ALL_PERMISSION_CODES,
} from '@/data/rolesPermissionsData';
import {
  ShieldCheck,
  Shield,
  Users,
  Check,
  ArrowRight,
  Copy,
  ExternalLink,
  Search,
  Trash2,
  Save,
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Bike,
  UtensilsCrossed,
  Package,
  Store,
  Wallet,
  Lock,
  Globe,
  Info,
} from 'lucide-react';

const MODULE_ICONS: Record<PermissionModule, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  orders: ClipboardList,
  kds: ChefHat,
  dispatch: Bike,
  menu: UtensilsCrossed,
  inventory: Package,
  digital_store: Store,
  financials: Wallet,
  shifts: Users,
  users_roles: ShieldCheck,
};

const COLOR_OPTIONS: { id: NonNullable<Role['color']>; labelAr: string; bg: string; border: string; text: string }[] = [
  { id: 'brand', labelAr: 'برتقالي (الافتراضي)', bg: 'bg-brand-500', border: 'border-brand-500', text: 'text-brand-400' },
  { id: 'blue', labelAr: 'أزرق (مبيعات وكاشير)', bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400' },
  { id: 'purple', labelAr: 'بنفسجي (إدارة وإشراف)', bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400' },
  { id: 'success', labelAr: 'أخضر (توصيل ولوجستيات)', bg: 'bg-success-500', border: 'border-success-500', text: 'text-success-400' },
  { id: 'warning', labelAr: 'كهرماني (مطبخ وتشغيل)', bg: 'bg-warning-500', border: 'border-warning-500', text: 'text-warning-400' },
  { id: 'danger', labelAr: 'أحمر (رقابة خاصة)', bg: 'bg-danger-500', border: 'border-danger-500', text: 'text-danger-400' },
];

export default function RoleCreateOrEdit() {
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId?: string }>();
  const { roles, users, addRole, updateRole, deleteRole, showToast } = useApp();

  const isNew = !roleId || roleId === 'new';
  const existingRole = useMemo(() => {
    if (isNew) return null;
    return roles.find((r) => r.id === roleId) || null;
  }, [isNew, roleId, roles]);

  // Form states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [color, setColor] = useState<Role['color']>('brand');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModuleFilter, setActiveModuleFilter] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize or populate form
  useEffect(() => {
    if (!isNew && existingRole) {
      setNameAr(existingRole.nameAr);
      setNameEn(existingRole.name);
      setSlug(existingRole.id);
      setDescriptionAr(existingRole.descriptionAr || '');
      setColor(existingRole.color || 'brand');
      setSelectedPermissions([...existingRole.permissions]);
    } else if (isNew) {
      setNameAr('');
      setNameEn('');
      setSlug('');
      setDescriptionAr('');
      setColor('brand');
      setSelectedPermissions([]);
    }
  }, [isNew, existingRole]);

  // Auto-generate slug from English name if not manually edited
  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (isNew) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (generated) setSlug(`role-${generated}`);
    }
  };

  // Dedicated URL preview for this role
  const rolePath = `/users/roles/${slug.trim() || (existingRole ? existingRole.id : 'new-role')}`;

  const copyRoleUrl = () => {
    const fullUrl = `${window.location.origin}${rolePath}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedLink(true);
    showToast('تم نسخ مسار هذا الدور إلى الحافظة', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Assigned users for this role
  const assignedUsers = useMemo(() => {
    if (isNew || !existingRole) return [];
    return users.filter((u) => u.roleId === existingRole.id);
  }, [isNew, existingRole, users]);

  // Toggle single permission
  const handleTogglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Toggle all permissions for a module
  const handleToggleModule = (module: PermissionModule) => {
    const moduleCodes = SYSTEM_PERMISSIONS.filter((p) => p.module === module).map((p) => p.code);
    const allSelected = moduleCodes.every((c) => selectedPermissions.includes(c));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((c) => !moduleCodes.includes(c)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...moduleCodes])));
    }
  };

  // Select all permissions
  const handleSelectAll = () => {
    if (selectedPermissions.length === ALL_PERMISSION_CODES.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...ALL_PERMISSION_CODES]);
    }
  };

  // Filtered permissions by search and module
  const filteredPermissions = useMemo(() => {
    let list = SYSTEM_PERMISSIONS;
    if (activeModuleFilter !== 'all') {
      list = list.filter((p) => p.module === activeModuleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.routePath && p.routePath.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeModuleFilter, searchQuery]);

  // Group filtered permissions by module
  const groupedPermissions = useMemo(() => {
    const groups: Partial<Record<PermissionModule, typeof SYSTEM_PERMISSIONS>> = {};
    for (const perm of filteredPermissions) {
      if (!groups[perm.module]) groups[perm.module] = [];
      groups[perm.module]!.push(perm);
    }
    return groups;
  }, [filteredPermissions]);

  // Submit handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameAr.trim()) {
      showToast('يرجى إدخال اسم الدور الوظيفي بالعربية', 'warning');
      return;
    }

    if (isNew) {
      const finalSlug = slug.trim() || `role-${Date.now().toString(36)}`;
      const cleanSlug = finalSlug.startsWith('role-') ? finalSlug : `role-${finalSlug}`;

      if (roles.some((r) => r.id === cleanSlug)) {
        showToast('كود المسار المخصص مستخدم بالفعل لدور آخر، يرجى اختيار كود آخر', 'warning');
        return;
      }

      const newRole: Role = {
        id: cleanSlug,
        name: nameEn.trim() || nameAr.trim(),
        nameAr: nameAr.trim(),
        description: descriptionAr.trim(),
        descriptionAr: descriptionAr.trim(),
        color: color || 'brand',
        permissions: selectedPermissions,
        isSystem: false,
        createdAt: new Date().toISOString(),
      };

      const success = await addRole(newRole);
      if (success) {
        showToast(`تم إنشاء الدور "${newRole.nameAr}" بالمسار ${rolePath} بنجاح`, 'success');
        navigate(`/users/roles/${newRole.id}`);
      }
    } else if (existingRole) {
      const updatedRole: Role = {
        ...existingRole,
        name: nameEn.trim() || nameAr.trim(),
        nameAr: nameAr.trim(),
        description: descriptionAr.trim(),
        descriptionAr: descriptionAr.trim(),
        color: color || 'brand',
        permissions: selectedPermissions,
        updatedAt: new Date().toISOString(),
      };

      const success = await updateRole(updatedRole);
      if (success) {
        showToast(`تم حفظ وتحديث صلاحيات الدور "${updatedRole.nameAr}" بنجاح`, 'success');
        navigate('/users/roles');
      }
    }
  };

  // Delete handler
  const handleDeleteRole = async () => {
    if (!existingRole) return;
    if (existingRole.isSystem) {
      showToast('لا يمكن حذف أدوار النظام الأساسية للحفاظ على استقرار الصلاحيات', 'warning');
      return;
    }
    if (assignedUsers.length > 0) {
      showToast(`لا يمكن حذف هذا الدور لأنه مسند حالياً لـ ${assignedUsers.length} مستخدم`, 'warning');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف الدور "${existingRole.nameAr}" نهائياً من النظام؟`)) {
      const success = await deleteRole(existingRole.id);
      if (success) {
        navigate('/users/roles');
      }
    }
  };

  return (
    <form onSubmit={handleSave} className="animate-fade-in space-y-6 max-w-7xl mx-auto pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-navy-400">
          <Link to="/users" className="hover:text-white transition-colors">
            المستخدمين
          </Link>
          <span>/</span>
          <Link to="/users/roles" className="hover:text-white transition-colors">
            الأدوار والصلاحيات
          </Link>
          <span>/</span>
          <span className="text-white font-medium">
            {isNew ? 'إنشاء دور وظيفي جديد' : existingRole?.nameAr || 'تفاصيل الدور'}
          </span>
        </div>

        <Link
          to="/users/roles"
          className="btn-ghost flex items-center gap-2 text-xs text-navy-300 hover:text-white px-3.5 py-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          العودة لقائمة الأدوار
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="glass-card p-6 border-navy-700/60">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
              color === 'brand' ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' :
              color === 'blue' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              color === 'purple' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
              color === 'success' ? 'bg-success-500/20 text-success-400 border-success-500/30' :
              color === 'warning' ? 'bg-warning-500/20 text-warning-400 border-warning-500/30' :
              'bg-danger-500/20 text-danger-400 border-danger-500/30'
            }`}>
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-white font-bold text-2xl">
                  {isNew ? 'إنشاء دور وظيفي ومسار جديد' : `تعديل صلاحيات: ${nameAr || existingRole?.nameAr}`}
                </h2>
                {existingRole?.isSystem && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-700/80 text-navy-200 border border-navy-600/50">
                    <Lock className="w-3 h-3 text-brand-400" />
                    دور نظام أساسي
                  </span>
                )}
              </div>
              <p className="text-navy-400 text-sm mt-1">
                تحديد المسار المخصص والميزات ومصفوفة الإجراءات المسموح بتنفيذها في كل صفحة
              </p>
            </div>
          </div>

          {/* Role Dedicated Path Badge with Copy */}
          <div className="flex items-center gap-2 bg-navy-900/60 border border-navy-700/60 px-4 py-2.5 rounded-2xl">
            <Globe className="w-4 h-4 text-brand-400 shrink-0" />
            <div className="text-right">
              <span className="text-navy-400 text-[11px] block">المسار المباشر لهذا الدور:</span>
              <span className="text-white text-xs font-mono font-bold direction-ltr">{rolePath}</span>
            </div>
            <button
              type="button"
              onClick={copyRoleUrl}
              className="p-1.5 rounded-lg hover:bg-navy-800 text-navy-300 hover:text-white transition-colors mr-2"
              title="نسخ رابط المسار"
            >
              {copiedLink ? <Check className="w-4 h-4 text-success-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-navy-700/50">
          <div>
            <label className="text-navy-200 text-sm font-medium mb-1.5 block">
              اسم الدور باللغة العربية <span className="text-danger-400">*</span>
            </label>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: كاشير متقدم / مشرف مطبخ"
              className="input-field font-medium"
              required
            />
          </div>

          <div>
            <label className="text-navy-200 text-sm font-medium mb-1.5 block">
              المسمى بالإنجليزي (اختياري)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => handleNameEnChange(e.target.value)}
              placeholder="مثال: Kitchen Supervisor"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-navy-200 text-sm font-medium mb-1.5 block">
              كود المسار المخصص (Slug / ID)
            </label>
            <div className="relative">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                disabled={!isNew}
                placeholder="role-cashier-lead"
                className="input-field font-mono text-xs pl-20 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-500 text-xs font-mono">
                /roles/
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-navy-200 text-sm font-medium mb-1.5 block">
              وصف مسؤوليات وصلاحيات هذا الدور
            </label>
            <input
              type="text"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="وصف مختصر لطبيعة العمل والصلاحيات المسندة لهذا الدور في المطعم"
              className="input-field"
            />
          </div>

          <div>
            <label className="text-navy-200 text-sm font-medium mb-1.5 block">
              لون وشارة التمييز
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${c.bg} ${
                    color === c.id
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-navy-900 scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.labelAr}
                >
                  {color === c.id && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Users Section (If existing role) */}
      {!isNew && (
        <div className="glass-card p-5 border-navy-700/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-brand-400" />
              <h3 className="text-white font-bold text-base">المستخدمون المعينون على هذا الدور</h3>
              <span className="bg-brand-500/15 text-brand-400 text-xs font-mono px-2 py-0.5 rounded-full font-bold">
                {assignedUsers.length}
              </span>
            </div>
            <Link
              to="/users"
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
            >
              إدارة المستخدمين
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {assignedUsers.length === 0 ? (
            <p className="text-navy-400 text-xs italic bg-navy-900/40 p-4 rounded-xl border border-navy-700/30">
              لا يوجد مستخدمون مسندون إلى هذا الدور حالياً. يمكنك تعيين المستخدمين من خلال شاشة إدارة المستخدمين.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {assignedUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-navy-900/50 rounded-xl p-3 border border-navy-700/40 flex items-center gap-3"
                >
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={u.nameAr}
                    className="w-9 h-9 rounded-xl object-cover border border-navy-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-xs truncate">{u.nameAr}</p>
                    <p className="text-navy-400 text-[11px] truncate">@{u.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Permissions Matrix Header */}
      <div className="glass-card p-5 border-navy-700/60">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                مصفوفة الأقسام والمسارات والإجراءات
              </h3>
              <p className="text-navy-400 text-xs">
                محدد ({selectedPermissions.length} من إجمالي {ALL_PERMISSION_CODES.length} إجراء متاح في النظام)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleSelectAll}
              className="btn-ghost text-xs px-3.5 py-2 text-navy-200 hover:text-white"
            >
              {selectedPermissions.length === ALL_PERMISSION_CODES.length
                ? 'إلغاء تحديد الكل'
                : 'تحديد كل الصلاحيات والمسارات'}
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-navy-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الإجراءات أو كود المسار (مثال: /orders أو كاشير أو جرد)..."
              className="input-field pr-10 text-xs"
            />
          </div>

          {/* Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setActiveModuleFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeModuleFilter === 'all'
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-navy-800/80 text-navy-300 hover:text-white'
              }`}
            >
              الكل ({SYSTEM_PERMISSIONS.length})
            </button>
            {(Object.keys(PERMISSION_MODULE_LABELS) as PermissionModule[]).map((mod) => {
              const count = SYSTEM_PERMISSIONS.filter((p) => p.module === mod).length;
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setActiveModuleFilter(mod)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    activeModuleFilter === mod
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'bg-navy-800/80 text-navy-300 hover:text-white'
                  }`}
                >
                  {PERMISSION_MODULE_LABELS[mod].labelAr} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Granular Module & Route Cards */}
      <div className="space-y-6">
        {(Object.keys(groupedPermissions) as PermissionModule[]).map((mod) => {
          const modPerms = groupedPermissions[mod] || [];
          if (modPerms.length === 0) return null;

          const meta = PERMISSION_MODULE_LABELS[mod];
          const ModIcon = MODULE_ICONS[mod] || Shield;
          const selectedInModule = modPerms.filter((p) => selectedPermissions.includes(p.code)).length;
          const isAllModuleSelected = selectedInModule === modPerms.length && modPerms.length > 0;

          return (
            <div key={mod} className="glass-card overflow-hidden border-navy-700/60 shadow-xl">
              {/* Module Header Bar */}
              <div className="px-5 py-4 bg-navy-900/70 border-b border-navy-700/50 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center text-brand-400">
                    <ModIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-bold text-base">{meta.labelAr}</h4>
                      <span className="text-navy-400 text-xs hidden sm:inline">— {meta.labelEn}</span>
                      <span className="bg-navy-800 text-brand-400 text-xs font-mono px-2 py-0.5 rounded-md border border-navy-700/70">
                        المسار: {meta.routePath}
                      </span>
                    </div>
                    <p className="text-navy-400 text-xs mt-0.5">{meta.descriptionAr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-navy-300 font-mono">
                    ({selectedInModule} من {modPerms.length} محددة)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleModule(mod)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isAllModuleSelected
                        ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                        : 'bg-navy-800 text-navy-300 border-navy-700 hover:text-white'
                    }`}
                  >
                    {isAllModuleSelected ? 'إلغاء تحديد القسم' : 'تحديد كل إجراءات القسم'}
                  </button>
                </div>
              </div>

              {/* Action Permission Cards Grid */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {modPerms.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.code);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.code)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
                        isChecked
                          ? 'bg-brand-500/10 border-brand-500/40 shadow-sm shadow-brand-500/10 ring-1 ring-brand-500/30'
                          : 'bg-navy-900/40 border-navy-700/40 hover:bg-navy-800/40 hover:border-navy-600/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-semibold text-sm block leading-snug">
                              {perm.nameAr}
                            </span>
                            <span className="text-navy-400 text-xs block truncate mt-0.5">
                              {perm.nameEn}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-brand-500 border-brand-500 text-white'
                                : 'border-navy-600 bg-navy-800/80'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-navy-300 text-xs leading-relaxed line-clamp-2">
                          {perm.descriptionAr}
                        </p>
                      </div>

                      {/* Route Path & Code Footer */}
                      <div className="mt-3 pt-2.5 border-t border-navy-800/60 flex items-center justify-between text-[11px] text-navy-400">
                        <span className="font-mono text-brand-400/90 bg-navy-800/60 px-1.5 py-0.5 rounded">
                          {perm.routePath || meta.routePath}
                        </span>
                        <span className="font-mono text-navy-500">{perm.code}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-40 glass-card p-4 border border-navy-700/80 shadow-2xl flex items-center justify-between flex-wrap gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              {isNew ? 'جاهز لحفظ الدور وتخصيص المسار' : `تحديث بيانات دور: ${nameAr || existingRole?.nameAr}`}
            </p>
            <p className="text-navy-400 text-xs">
              سيتم تفعيل المسار {rolePath} مع منح {selectedPermissions.length} صلاحية وإجراء
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && existingRole && !existingRole.isSystem && (
            <button
              type="button"
              onClick={handleDeleteRole}
              className="btn-ghost text-xs text-danger-400 hover:bg-danger-500/10 hover:text-danger-300 flex items-center gap-1.5 px-3 py-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف الدور
            </button>
          )}

          <Link
            to="/users/roles"
            className="btn-ghost text-xs text-navy-300 hover:text-white px-4 py-2.5"
          >
            إلغاء
          </Link>

          <button
            type="submit"
            className="btn-primary text-sm flex items-center gap-2 px-6 py-2.5 font-bold shadow-lg shadow-brand-500/25"
          >
            <Save className="w-4 h-4" />
            {isNew ? 'حفظ الدور وتفعيل المسار' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </form>
  );
}
