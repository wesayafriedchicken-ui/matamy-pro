import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  pageTitleAr?: string;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  pageTitleAr,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { currentUser, roles, hasPermission, setCurrentUser, users } = useApp();

  useEffect(() => {
    if (!currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  // If permission is required and current user doesn't have it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const currentRole = roles.find((r) => r.id === currentUser.roleId);
    const adminUser = users.find((u) => u.roleId === 'role-admin' && u.status === 'active');

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in font-cairo">
        <div className="glass-card max-w-lg w-full p-8 border border-warning-500/30 shadow-2xl rounded-3xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-warning-500 via-brand-500 to-danger-500" />

          {/* Icon */}
          <div className="w-16 h-16 rounded-3xl bg-warning-500/15 text-warning-400 flex items-center justify-center mx-auto mb-5 ring-1 ring-warning-500/30 shadow-lg shadow-warning-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold text-white mb-2">
            غير مصرح لك بالوصول إلى هذه الصفحة
          </h2>
          <p className="text-navy-300 text-xs leading-relaxed mb-6">
            عذراً، دورك الوظيفي الحالي{' '}
            <span className="font-bold text-brand-400">"{currentRole?.nameAr || 'عضو'}"</span> لا يمتلك الصلاحية المطلوبة{' '}
            <code className="px-1.5 py-0.5 rounded bg-navy-900 border border-navy-700 text-warning-300 font-mono text-[11px] dir-ltr inline-block">
              {requiredPermission}
            </code>{' '}
            {pageTitleAr ? `المخصصة لـ (${pageTitleAr}).` : ''}
          </p>

          {/* Details badge */}
          <div className="p-3.5 rounded-2xl bg-navy-900/70 border border-navy-800 text-right mb-6 space-y-2 text-xs">
            <div className="flex items-center justify-between text-navy-400">
              <span>المستخدم الحالي:</span>
              <span className="text-white font-bold">{currentUser.nameAr} (@{currentUser.username})</span>
            </div>
            <div className="flex items-center justify-between text-navy-400">
              <span>الدور الوظيفي:</span>
              <span className="text-brand-400 font-semibold">{currentRole?.nameAr}</span>
            </div>
            <div className="flex items-center justify-between text-navy-400">
              <span>عدد الصلاحيات المتاحة لك:</span>
              <span className="font-mono text-white">{currentRole?.permissions.length || 0} صلاحية</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2.5">
            {adminUser && (
              <button
                type="button"
                onClick={() => {
                  setCurrentUser(adminUser);
                }}
                className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>التبديل إلى حساب مدير النظام (Admin)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full btn-ghost py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-navy-700 hover:border-navy-600"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>العودة للوحة التحكم الرئيسية</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
