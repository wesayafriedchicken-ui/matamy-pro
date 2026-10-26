import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import type { Employee } from '@/types';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  DollarSign,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  CalendarClock,
  CheckSquare,
  Wallet,
  Clock,
  Filter,
  X,
  CreditCard,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { formatCurrency } from '@/utils/helpers';

const ROLE_OPTIONS = [
  { role: 'Chef', roleAr: 'طباخ / شيف' },
  { role: 'Cashier', roleAr: 'كاشير ومبيعات' },
  { role: 'Waiter', roleAr: 'جرسون صالة' },
  { role: 'Kitchen Helper', roleAr: 'مساعد مطبخ وتحضير' },
  { role: 'Barista', roleAr: 'باريستا ومشروبات' },
  { role: 'Delivery', roleAr: 'مندوب توصيل' },
  { role: 'Manager', roleAr: 'مدير فرع / مشرف' },
  { role: 'Cleaner', roleAr: 'عامل نظافة وجودة' },
];

export default function EmployeesManagement() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, addShift, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for adding/editing employee
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form Fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [roleAr, setRoleAr] = useState('طباخ / شيف');
  const [contractType, setContractType] = useState<Employee['contractType']>('full_time');
  const [baseSalary, setBaseSalary] = useState<number>(6000);
  const [hourlyRate, setHourlyRate] = useState<number>(34);
  const [overtimeRate, setOvertimeRate] = useState<number>(50);
  const [monthlyIncentives, setMonthlyIncentives] = useState<number>(0);
  const [bankAccount, setBankAccount] = useState('');
  const [notes, setNotes] = useState('');

  // Quick Shift Modal for an employee
  const [quickShiftEmployee, setQuickShiftEmployee] = useState<Employee | null>(null);
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shiftStartTime, setShiftStartTime] = useState('08:00');
  const [shiftEndTime, setShiftEndTime] = useState('16:00');

  // Copy URL feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        !searchQuery.trim() ||
        emp.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.includes(searchQuery);

      const matchesRole = roleFilter === 'all' || emp.roleAr.includes(roleFilter);
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, roleFilter, statusFilter]);

  // Statistics
  const activeEmployees = employees.filter((e) => e.status === 'active');
  const totalBaseSalaries = employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0);
  const avgHourlyRate = employees.length > 0
    ? Math.round((employees.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / employees.length) * 10) / 10
    : 0;

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setNameAr('');
    setNameEn('');
    setEmployeeNumber(`EMP-${String(employees.length + 1).padStart(3, '0')}`);
    setPhone('');
    setNationalId('');
    setRoleAr('طباخ / شيف');
    setContractType('full_time');
    setBaseSalary(6000);
    setHourlyRate(34);
    setOvertimeRate(50);
    setMonthlyIncentives(0);
    setBankAccount('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setNameAr(emp.nameAr);
    setNameEn(emp.name);
    setEmployeeNumber(emp.employeeNumber);
    setPhone(emp.phone);
    setNationalId(emp.nationalId || '');
    setRoleAr(emp.roleAr);
    setContractType(emp.contractType);
    setBaseSalary(emp.baseSalary);
    setHourlyRate(emp.hourlyRate);
    setOvertimeRate(emp.overtimeRate);
    setMonthlyIncentives(emp.monthlyIncentives || 0);
    setBankAccount(emp.bankAccount || '');
    setNotes(emp.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim()) {
      showToast('يرجى إدخال اسم الموظف بالعربية', 'warning');
      return;
    }

    const matchedRole = ROLE_OPTIONS.find((r) => r.roleAr === roleAr);
    const roleEn = matchedRole ? matchedRole.role : 'Staff';

    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        name: nameEn.trim() || nameAr.trim(),
        nameAr: nameAr.trim(),
        employeeNumber: employeeNumber.trim() || editingEmployee.employeeNumber,
        phone: phone.trim(),
        nationalId: nationalId.trim() || undefined,
        role: roleEn,
        roleAr: roleAr,
        contractType,
        baseSalary: Number(baseSalary) || 0,
        hourlyRate: Number(hourlyRate) || 0,
        overtimeRate: Number(overtimeRate) || 0,
        monthlyIncentives: Number(monthlyIncentives) || 0,
        bankAccount: bankAccount.trim() || undefined,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      await updateEmployee(updated);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        name: nameEn.trim() || nameAr.trim(),
        nameAr: nameAr.trim(),
        employeeNumber: employeeNumber.trim() || `EMP-${Date.now().toString().slice(-4)}`,
        phone: phone.trim(),
        nationalId: nationalId.trim() || undefined,
        role: roleEn,
        roleAr: roleAr,
        contractType,
        hireDate: new Date().toISOString().split('T')[0],
        baseSalary: Number(baseSalary) || 0,
        hourlyRate: Number(hourlyRate) || 0,
        overtimeRate: Number(overtimeRate) || 0,
        monthlyIncentives: Number(monthlyIncentives) || 0,
        status: 'active',
        bankAccount: bankAccount.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      await addEmployee(newEmp);
    }

    setIsModalOpen(false);
  };

  const handleCopyEmployeePath = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const path = `/shifts/employees/${empId}`;
    navigator.clipboard.writeText(path);
    setCopiedId(empId);
    showToast(`تم نسخ مسار الموظف: ${path}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickShiftEmployee) return;

    await addShift({
      id: `shift-${Date.now()}`,
      employeeId: quickShiftEmployee.id,
      employeeName: quickShiftEmployee.name,
      employeeNameAr: quickShiftEmployee.nameAr,
      role: quickShiftEmployee.role,
      roleAr: quickShiftEmployee.roleAr,
      startTime: shiftStartTime,
      endTime: shiftEndTime,
      status: 'scheduled',
      date: shiftDate,
      geofenceStatus: 'in_range',
    });

    setQuickShiftEmployee(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title="الورديات والمهام"
        subtitle="سجل الموظفين والرواتب، جدولة الورديات وتتبع الحضور والانصراف"
      >
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موظف جديد</span>
        </button>
      </PageHeader>

      {/* Sub-Route Navigation (4 Dedicated Tabs) */}
      <div className="flex items-center gap-2 mb-6 p-1.5 bg-navy-800/60 rounded-2xl w-fit flex-wrap border border-navy-700/60">
        <Link
          to="/shifts/schedule"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <CalendarClock className="w-4 h-4" />
          <span>الجدولة والحضور</span>
        </Link>

        <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">
          <Users className="w-4 h-4" />
          <span>سجل الموظفين ({employees.length})</span>
        </span>

        <Link
          to="/shifts/tasks"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <CheckSquare className="w-4 h-4" />
          <span>المهام وتسليم الشيفت</span>
        </Link>

        <Link
          to="/shifts/payroll"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-navy-300 hover:text-white transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>الرواتب والساعات</span>
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="إجمالي الموظفين"
          value={String(employees.length)}
          sublabel="فريق العمل المسجل"
          color="brand"
        />
        <StatCard
          icon={UserCheck}
          label="موظفون نشطون"
          value={String(activeEmployees.length)}
          sublabel="على رأس العمل"
          color="success"
        />
        <StatCard
          icon={DollarSign}
          label="إجمالي الرواتب الأساسية"
          value={formatCurrency(totalBaseSalaries)}
          sublabel="كتلة الرواتب الشهرية"
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="متوسط أجر الساعة"
          value={formatCurrency(avgHourlyRate)}
          sublabel="لكل ساعة عمل تشغيلية"
          color="purple"
        />
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-navy-700/60">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-navy-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، الكود، أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pr-10 text-xs w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-navy-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field text-xs py-2 bg-navy-900"
            >
              <option value="all">كل الوظائف والتخصصات</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.role} value={r.roleAr}>
                  {r.roleAr}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs py-2 bg-navy-900"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="on_leave">إجازة</option>
            <option value="suspended">موقوف</option>
          </select>
        </div>
      </div>

      {/* Employees Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="glass-card p-12 text-center border border-dashed border-navy-700/80 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4 ring-1 ring-brand-500/20">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">لا يوجد موظفون مسجلون حالياً</h3>
          <p className="text-navy-400 text-sm max-w-md mx-auto mb-6">
            سجل بيانات الموظفين ورواتبهم الأساسية ومعدل الساعات لربطهم تلقائياً بجدول الورديات وتتبع الحضور وكشف الرواتب الشهري.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول موظف الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            const empPath = `/shifts/employees/${emp.id}`;

            return (
              <div
                key={emp.id}
                className="glass-card p-5 border border-navy-700/60 hover:border-brand-500/40 transition-all flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/20 to-blue-500/10 text-brand-400 flex items-center justify-center font-bold text-base ring-1 ring-white/10 group-hover:scale-105 transition-transform">
                        {emp.nameAr.slice(0, 2)}
                      </div>
                      <div>
                        <Link
                          to={empPath}
                          className="text-white font-bold text-base group-hover:text-brand-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{emp.nameAr}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand-400" />
                        </Link>
                        <div className="flex items-center gap-2 text-navy-400 text-xs">
                          <span className="font-mono text-brand-400/90">{emp.employeeNumber}</span>
                          <span>•</span>
                          <span>{emp.roleAr}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        emp.status === 'active'
                          ? 'bg-success-500/15 text-success-400 border-success-500/25'
                          : emp.status === 'on_leave'
                          ? 'bg-warning-500/15 text-warning-400 border-warning-500/25'
                          : 'bg-danger-500/15 text-danger-400 border-danger-500/25'
                      }`}
                    >
                      {emp.status === 'active' ? 'نشط' : emp.status === 'on_leave' ? 'إجازة' : 'موقوف'}
                    </span>
                  </div>

                  {/* Dedicated Route URL Badge */}
                  <div className="mb-3 p-2 rounded-lg bg-navy-900/80 border border-navy-700/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[10px] text-navy-400 shrink-0">المسار الخاص:</span>
                      <span className="text-[11px] font-mono text-cyan-400 truncate" dir="ltr">
                        {empPath}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleCopyEmployeePath(emp.id, e)}
                      className="p-1 rounded hover:bg-navy-700 text-navy-400 hover:text-white transition-colors shrink-0"
                      title="نسخ مسار صفحة الموظف"
                    >
                      {copiedId === emp.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Salary and Contract Details */}
                  <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800/80 mb-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-navy-400">الراتب الأساسي:</span>
                      <span className="font-bold text-white font-mono text-sm">
                        {formatCurrency(emp.baseSalary)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-navy-300">
                      <span>أجر الساعة:</span>
                      <span className="font-mono">{formatCurrency(emp.hourlyRate)} / س</span>
                    </div>
                    <div className="flex items-center justify-between text-navy-300">
                      <span>أجر الساعة الإضافية:</span>
                      <span className="font-mono text-amber-400">{formatCurrency(emp.overtimeRate)} / س</span>
                    </div>
                    {emp.monthlyIncentives ? (
                      <div className="flex items-center justify-between text-success-400">
                        <span>بدلات وحوافز:</span>
                        <span className="font-mono">+{formatCurrency(emp.monthlyIncentives)}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center justify-between text-xs text-navy-400 mb-4 pb-2 border-b border-navy-800/80">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-navy-400" />
                      <span dir="ltr">{emp.phone || '—'}</span>
                    </span>
                    <span className="text-[11px] bg-navy-800 px-2 py-0.5 rounded text-navy-300">
                      {emp.contractType === 'full_time'
                        ? 'دوام كامل'
                        : emp.contractType === 'part_time'
                        ? 'دوام جزئي'
                        : 'بالساعة'}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link
                    to={empPath}
                    className="flex-1 btn-ghost py-2 text-xs flex items-center justify-center gap-1.5 font-bold border border-navy-700/80 hover:border-brand-500/40 hover:text-brand-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>عرض الملف والمسار</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setQuickShiftEmployee(emp)}
                    className="p-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 transition-all cursor-pointer"
                    title="جدولة وردية لهذا الموظف"
                  >
                    <CalendarClock className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(emp)}
                    className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white transition-all cursor-pointer"
                    title="تعديل بيانات الموظف والراتب"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`هل أنت متأكد من حذف الموظف "${emp.nameAr}"؟`)) {
                        deleteEmployee(emp.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/20 transition-all cursor-pointer"
                    title="حذف الموظف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* Add / Edit Employee Modal */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col border border-navy-700 shadow-2xl overflow-hidden rounded-3xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-navy-700/60 flex items-center justify-between bg-navy-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {editingEmployee ? `تعديل بيانات الموظف: ${editingEmployee.nameAr}` : 'إضافة موظف جديد للسجل'}
                  </h3>
                  <p className="text-navy-400 text-xs">
                    تحديد بيانات التعاقد، المسمى الوظيفي، والراتب الأساسي ومعدلات الساعات
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEmployee} className="p-6 overflow-y-auto space-y-4 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">
                    الاسم باللغة العربية <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد مصطفى إبراهيم"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="input-field w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">
                    الاسم بالإنجليزية (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Mostafa"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="input-field w-full text-xs font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">
                    كود الموظف (ID)
                  </label>
                  <input
                    type="text"
                    placeholder="EMP-001"
                    value={employeeNumber}
                    onChange={(e) => setEmployeeNumber(e.target.value)}
                    className="input-field w-full text-xs font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">
                    رقم الهاتف / واتساب <span className="text-danger-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field w-full text-xs font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">
                    المسمى الوظيفي والتخصص
                  </label>
                  <select
                    value={roleAr}
                    onChange={(e) => setRoleAr(e.target.value)}
                    className="input-field w-full text-xs bg-navy-900"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.role} value={r.roleAr}>
                        {r.roleAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1.5">
                    نوع التعاقد
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as Employee['contractType'])}
                    className="input-field w-full text-xs bg-navy-900"
                  >
                    <option value="full_time">دوام كامل (شهري)</option>
                    <option value="part_time">دوام جزئي</option>
                    <option value="hourly">حساب بالساعة</option>
                  </select>
                </div>
              </div>

              {/* Salary Section */}
              <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/80 space-y-3">
                <h4 className="text-white font-bold text-xs flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-400" />
                  <span>بيانات الرواتب والمستحقات التشغيلية</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-navy-300 mb-1">
                      الراتب الأساسي الشهري (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={baseSalary}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setBaseSalary(val);
                        // Auto-calculate hourly rate based on standard 176 monthly hours
                        if (val > 0) {
                          setHourlyRate(Math.round((val / 176) * 10) / 10);
                          setOvertimeRate(Math.round((val / 176) * 1.5 * 10) / 10);
                        }
                      }}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-navy-300 mb-1">
                      معدل أجر الساعة (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-navy-300 mb-1">
                      أجر الساعة الإضافية (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={overtimeRate}
                      onChange={(e) => setOvertimeRate(Number(e.target.value))}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-navy-300 mb-1">
                      بدلات أو حوافز شهرية ثابتة (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={monthlyIncentives}
                      onChange={(e) => setMonthlyIncentives(Number(e.target.value))}
                      className="input-field w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-navy-300 mb-1">
                      بيانات التحويل / الحساب البنكي / محفظة
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: فودافون كاش 010... أو رقم حساب"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="input-field w-full text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1.5">
                  ملاحظات أو مهام خاصة بالموظف
                </label>
                <textarea
                  rows={2}
                  placeholder="أي ملاحظات تخص شفتات الموظف أو مهاراته..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field w-full text-xs"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-navy-800 flex items-center justify-end gap-3 sticky bottom-0 bg-navy-900/95 py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-ghost px-5 py-2.5 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEmployee ? 'حفظ التعديلات' : 'تسجيل الموظف'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* Quick Shift Modal */}
      {/* ==================================================== */}
      {quickShiftEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 border border-navy-700 shadow-2xl rounded-2xl animate-scale-in text-right">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-brand-400" />
                <h3 className="text-white font-bold text-base">
                  جدولة وردية لـ {quickShiftEmployee.nameAr}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickShiftEmployee(null)}
                className="text-navy-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickShiftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-navy-300 mb-1">تاريخ الوردية</label>
                <input
                  type="date"
                  required
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="input-field w-full text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1">وقت البدء</label>
                  <input
                    type="time"
                    required
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    className="input-field w-full text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-300 mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    required
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    className="input-field w-full text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuickShiftEmployee(null)}
                  className="btn-ghost px-4 py-2 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary px-5 py-2 text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد الإضافة للجدول</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
