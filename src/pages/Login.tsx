import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, currentUser, roles, users } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getLandingPath = (userIdent: string) => {
    const targetUser = users.find(
      (u) =>
        u.username.toLowerCase() === userIdent.toLowerCase() ||
        u.email.toLowerCase() === userIdent.toLowerCase()
    );
    if (!targetUser) return '/';
    const userRole = roles.find((r) => r.id === targetUser.roleId);
    if (!userRole) return '/';
    if (
      userRole.id === 'role-admin' ||
      userRole.permissions.includes('*') ||
      userRole.permissions.includes('dashboard.view')
    ) {
      return '/';
    }
    if (userRole.permissions.includes('dispatch.view')) return '/dispatch';
    if (userRole.permissions.includes('kds.view')) return '/kds';
    if (userRole.permissions.includes('orders.view')) return '/orders';
    if (userRole.permissions.includes('inventory.view')) return '/inventory';
    if (userRole.permissions.includes('financials.view') || userRole.permissions.includes('financials.manage')) {
      return '/financials/cash-drawer';
    }
    return '/';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier, password);
      if (res.success) {
        navigate(getLandingPath(identifier));
      } else {
        setErrorMessage(res.error || 'فشل تسجيل الدخول، يرجى التأكد من البيانات');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await login(username, pass);
      if (res.success) {
        navigate(getLandingPath(username));
      } else {
        setErrorMessage(res.error || 'تعذر تسجيل الدخول بهذا الحساب');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-cairo">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Brand */}
      <div className="text-center mb-8 relative z-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-xl shadow-brand-500/30 mb-4 ring-2 ring-brand-500/20">
          <UtensilsCrossed className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">مطعمي برو</h1>
        <p className="text-navy-300 text-sm mt-1.5 font-medium">نظام التشغيل وإدارة العمليات المطعمية المتكاملة</p>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Login Card */}
        <div className="glass-card p-8 border border-navy-700/60 shadow-2xl backdrop-blur-2xl rounded-3xl">
          <div className="flex items-center justify-between mb-6 border-b border-navy-700/50 pb-4">
            <div>
              <h2 className="text-white font-bold text-xl">تسجيل الدخول</h2>
              <p className="text-navy-400 text-xs mt-0.5">أدخل بيانات اعتماد حسابك للوصول للنظام</p>
            </div>
            {currentUser && (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-success-500/15 text-success-400 border border-success-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
                نشط حالياً
              </span>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-danger-500/15 border border-danger-500/30 text-danger-300 text-xs flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-200 mb-1.5 text-right">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-navy-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="مثال: admin أو admin@matamy.com"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="input-field pr-10 text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-navy-200 text-right">
                  كلمة المرور
                </label>
                <span className="text-[11px] text-navy-400">الافتراضي: 123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-navy-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="input-field pr-10 pl-10 text-sm font-mono"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-navy-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-navy-700 bg-navy-900 text-brand-500 focus:ring-brand-500/30"
                />
                <span>تذكر بيانات الدخول</span>
              </label>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', '123')}
                className="text-brand-400 hover:text-brand-300 hover:underline transition-colors font-medium text-[11px]"
              >
                الدخول كمدير نظام تلقائياً
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-bold text-sm shadow-xl mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جارٍ التحقق والدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول إلى لوحة التحكم</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info & link */}
        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-navy-400 hover:text-white transition-colors inline-flex items-center gap-1.5 font-medium"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>تخطي والتوجه مباشرة إلى لوحة العمليات</span>
          </button>
          <p className="text-[11px] text-navy-500 font-mono">
            مطعمي برو v2.4 • متصل بقاعدة بيانات العمليات
          </p>
        </div>
      </div>
    </div>
  );
}
