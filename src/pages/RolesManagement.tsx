import { useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Shield,
  Users,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  Lock,
  Sparkles,
  Info,
  ExternalLink,
  Copy,
  Check,
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Bike,
  UtensilsCrossed,
  Package,
  Store,
  Wallet,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Role, PermissionModule } from '@/types';
import {
  SYSTEM_PERMISSIONS,
  PERMISSION_MODULE_LABELS,
  ALL_PERMISSION_CODES,
} from '@/data/rolesPermissionsData';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

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

export default function RolesManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roles, users, deleteRole, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<Role | null>(null);
  const [copiedRoleId, setCopiedRoleId] = useState<string | null>(null);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    const q = searchQuery.toLowerCase().trim();
    return roles.filter(
      (r) =>
        r.nameAr.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.descriptionAr.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  // Copy role route path to clipboard
  const handleCopyRoute = (e: React.MouseEvent, roleId: string) => {
    e.stopPropagation();
    const route = `/users/roles/${roleId}`;
    navigator.clipboard.writeText(route);
    setCopiedRoleId(roleId);
    showToast(`تم نسخ المسار: ${route}`, 'info');
    setTimeout(() => setCopiedRoleId(null), 2000);
  };

  // Delete role handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmRole) return;
    await deleteRole(deleteConfirmRole.id);
    setDeleteConfirmRole(null);
  };

  // Statistics
  const systemRolesCount = roles.filter((r) => r.isSystem).length;
  const customRolesCount = roles.filter((r) => !r.isSystem).length;
  const assignedUsersTotal = users.length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="المستخدمين والصلاحيات"
        subtitle="تحديد مصفوفة الصلاحيات المسموحة لكل دور وظيفي وإدارة الحسابات المسجلة"
      >
        <button
          type="button"
          onClick={() => navigate('/users/roles/new')}
          className="btn-primary flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء دور وظيفي جديد</span>
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
          icon={ShieldCheck}
          label="إجمالي الأدوار المعرفة"
          value={String(roles.length)}
          sublabel="أدوار التشغيل والإدارة"
          color="brand"
        />
        <StatCard
          icon={Lock}
          label="أدوار النظام الأساسية"
          value={String(systemRolesCount)}
          sublabel="محمية ومسبقة الإعداد"
          color="purple"
        />
        <StatCard
          icon={Sparkles}
          label="أدوار مخصصة إضافية"
          value={String(customRolesCount)}
          sublabel="تم إنشاؤها يدوياً"
          color="blue"
        />
        <StatCard
          icon={Users}
          label="المستخدمين الموزعين"
          value={String(assignedUsersTotal)}
          sublabel="حسابات موظفي المطعم"
          color="success"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-navy-700/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-navy-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في أسماء الأدوار، المعرف أو الوصف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pr-10 text-xs w-full"
          />
        </div>

        <div className="text-xs text-navy-400 flex items-center gap-2 w-full sm:w-auto justify-end">
          <Info className="w-3.5 h-3.5 text-navy-400 shrink-0" />
          <span>كل دور وظيفي يمتلك مساراً خاصاً به في النظام (مثال: /users/roles/:roleId)</span>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role) => {
          const assignedUsers = users.filter((u) => u.roleId === role.id);
          const permissionsCount = role.permissions.length;
          const isFullAdmin = role.id === 'role-admin' || permissionsCount === ALL_PERMISSION_CODES.length;
          const roleRoute = `/users/roles/${role.id}`;

          return (
            <div
              key={role.id}
              className="glass-card p-5 border border-navy-700/60 hover:border-brand-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold text-sm ring-1 ring-brand-500/20 group-hover:scale-105 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <Link
                        to={roleRoute}
                        className="text-white font-bold text-base group-hover:text-brand-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{role.nameAr}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-400" />
                      </Link>
                      <p className="text-navy-400 text-xs font-mono">{role.name}</p>
                    </div>
                  </div>

                  {role.isSystem ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      أساسي
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      مخصص
                    </span>
                  )}
                </div>

                {/* Dedicated Route URL Badge */}
                <div className="mb-3 p-2 rounded-lg bg-navy-900/80 border border-navy-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[10px] text-navy-400 shrink-0">المسار الخاص:</span>
                    <span className="text-[11px] font-mono text-cyan-400 truncate" dir="ltr">
                      {roleRoute}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCopyRoute(e, role.id)}
                    className="p-1 rounded hover:bg-navy-700 text-navy-400 hover:text-white transition-colors shrink-0"
                    title="نسخ مسار هذا الدور"
                  >
                    {copiedRoleId === role.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-navy-300 text-xs line-clamp-2 mb-4 leading-relaxed min-h-[34px]">
                  {role.descriptionAr || 'لا يوجد وصف مدخل لهذا الدور'}
                </p>

                {/* Permissions Breakdown & Badges */}
                <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800/80 mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-400 font-medium">الصلاحيات الممنوحة:</span>
                    <span className="font-bold text-white font-mono">
                      {isFullAdmin ? (
                        <span className="text-emerald-400">كامل الصلاحيات (100%)</span>
                      ) : (
                        <span>
                          {permissionsCount}{' '}
                          <span className="text-navy-500 font-normal">/ {ALL_PERMISSION_CODES.length}</span>
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Module Access Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Object.keys(PERMISSION_MODULE_LABELS).map((moduleKey) => {
                      const mod = moduleKey as PermissionModule;
                      const modulePerms = SYSTEM_PERMISSIONS.filter((p) => p.module === mod);
                      const hasAccess = modulePerms.some((p) => role.permissions.includes(p.code));
                      if (!hasAccess && !isFullAdmin) return null;

                      const ModIcon = MODULE_ICONS[mod];
                      return (
                        <span
                          key={mod}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-navy-800 text-navy-200 border border-navy-700/60"
                        >
                          <ModIcon className="w-2.5 h-2.5 text-brand-400" />
                          <span>{PERMISSION_MODULE_LABELS[mod].labelAr.split(' ')[0]}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Users Count */}
                <div className="flex items-center justify-between text-xs text-navy-400 mb-4 pb-2 border-b border-navy-800/80">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-navy-400" />
                    <span>المستخدمين المسندين:</span>
                  </span>
                  <span className="font-bold text-white font-mono px-2 py-0.5 rounded bg-navy-800 text-[11px]">
                    {assignedUsers.length} مستخدم
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(roleRoute)}
                  className="flex-1 btn-ghost py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold border border-navy-700/80 hover:border-brand-500/40 hover:text-brand-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل الصلاحيات والميزات</span>
                </button>

                {!role.isSystem ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmRole(role)}
                    className="w-9 h-9 rounded-xl bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/20 flex items-center justify-center transition-all cursor-pointer"
                    title="حذف هذا الدور المخصص"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <div
                    className="w-9 h-9 rounded-xl bg-navy-800/40 text-navy-600 flex items-center justify-center cursor-not-allowed"
                    title="دور أساسي محمي من الحذف"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* Delete Confirmation Modal */}
      {/* ==================================================== */}
      {deleteConfirmRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 border border-danger-500/30 shadow-2xl rounded-2xl animate-scale-in text-right">
            <div className="w-12 h-12 rounded-2xl bg-danger-500/15 text-danger-400 flex items-center justify-center mb-4 ring-1 ring-danger-500/30 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-white font-bold text-lg text-center mb-1">
              تأكيد حذف الدور "{deleteConfirmRole.nameAr}"؟
            </h3>
            <p className="text-navy-300 text-xs text-center leading-relaxed mb-6">
              هل أنت متأكد من رغبتك في حذف هذا الدور المخصص من النظام؟ سيتم مسح مصفوفة الصلاحيات المرتبطة به ومساره الخاص ({`/users/roles/${deleteConfirmRole.id}`}) بشكل نهائي.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmRole(null)}
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
                <span>نعم، حذف الدور</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
