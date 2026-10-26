import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Check, Clock, Flame, AlertCircle, ChefHat, Trash2 } from 'lucide-react';
import { formatTimer, getTimerColor, getTimerBg } from '@/utils/helpers';

export default function KitchenDisplay() {
  const { kdsTickets, advanceKdsTicket, showToast } = useApp();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const sortedTickets = [...kdsTickets].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority ? -1 : 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const priorityCount = sortedTickets.filter((t) => t.priority).length;

  const handleClearAllTickets = () => {
    if (sortedTickets.length === 0) return;
    if (window.confirm('هل تريد تفريغ وإنجاز جميع التذاكر الحالية من شاشة المطبخ؟')) {
      sortedTickets.forEach((t) => advanceKdsTicket(t.id));
      showToast('تم إنجاز وتفريغ جميع تذاكر المطبخ بنجاح', 'info');
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* KDS Header Bar */}
      <div className="glass-card px-6 py-4 mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-500/15 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">شاشة المطبخ</h3>
            <p className="text-navy-400 text-sm">
              {sortedTickets.length > 0
                ? `${sortedTickets.length} طلب قيد التحضير`
                : 'لا توجد طلبات قيد التحضير حالياً'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-navy-800/60 px-3 py-2 rounded-xl border border-navy-700/50">
            <Flame className={`w-4 h-4 ${priorityCount > 0 ? 'text-brand-400' : 'text-navy-500'}`} />
            <span className="text-navy-200 text-sm font-medium">{priorityCount} أولوية</span>
          </div>

          {sortedTickets.length > 0 && (
            <div className="flex items-center gap-2 bg-navy-800/60 px-3 py-2 rounded-xl border border-navy-700/50">
              <Clock className="w-4 h-4 text-navy-300" />
              <span className="text-navy-200 text-sm font-mono">{formatTimer(sortedTickets[0].createdAt)}</span>
              <span className="text-navy-400 text-xs">أقدم طلب</span>
            </div>
          )}

          {sortedTickets.length > 0 && (
            <button
              onClick={handleClearAllTickets}
              className="btn-ghost text-xs text-navy-400 hover:text-danger-400 flex items-center gap-1.5 px-3 py-2"
              title="إنجاز وتفريغ كل التذاكر"
            >
              <Trash2 className="w-3.5 h-3.5" />
              تفريغ الشاشة
            </button>
          )}
        </div>
      </div>

      {/* KDS Grid */}
      <div className="flex-1 overflow-y-auto">
        {sortedTickets.length === 0 ? (
          <div className="glass-card h-full min-h-[380px] flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-20 h-20 rounded-3xl bg-success-500/10 flex items-center justify-center border border-success-500/20">
              <Check className="w-10 h-10 text-success-400" />
            </div>
            <div className="text-center max-w-md">
              <p className="text-white font-bold text-xl mb-1">شاشة المطبخ فارغة وجاهزة</p>
              <p className="text-navy-400 text-sm leading-relaxed">
                لا توجد طلبات قيد التحضير حالياً. الطلبات الجديدة المسجلة من الكاشير أو التطبيق ستظهر هنا فورياً وتلقائياً.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedTickets.map((ticket) => {
              const timerColor = getTimerColor(ticket.createdAt);
              const timerBg = getTimerBg(ticket.createdAt);

              return (
                <div
                  key={ticket.id}
                  className={`rounded-2xl border-2 p-5 transition-all duration-300 hover:scale-[1.02] ${
                    ticket.priority
                      ? 'border-brand-500/50 bg-brand-500/5'
                      : 'border-navy-700/50 bg-navy-800/60'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                        ticket.priority ? 'bg-brand-500/20 text-brand-400' : 'bg-navy-700/50 text-white'
                      }`}>
                        {ticket.orderNumber}
                      </span>
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${
                          ticket.priority ? 'bg-brand-500/20 text-brand-400' : 'bg-navy-700/50 text-navy-300'
                        }`}>
                          {ticket.stationAr || 'المطبخ'}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${timerBg}`}>
                      <Clock className={`w-3.5 h-3.5 ${timerColor}`} />
                      <span className={`font-mono font-bold text-sm ${timerColor}`}>
                        {formatTimer(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2.5 mb-5">
                    {ticket.items.map((item, i) => (
                      <div
                        key={i}
                        className="bg-navy-900/50 rounded-xl px-4 py-3 border border-navy-700/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {item.quantity}×
                          </span>
                          <span className="text-white font-semibold text-base flex-1">
                            {item.nameAr}
                          </span>
                        </div>
                        {item.notes && (
                          <div className="flex items-center gap-1.5 mt-2 pr-11">
                            <AlertCircle className="w-3.5 h-3.5 text-warning-400 shrink-0" />
                            <span className="text-warning-400 text-sm font-medium">{item.notes}</span>
                          </div>
                        )}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pr-11">
                            {item.modifiers.map((mod, mi) => (
                              <span
                                key={mi}
                                className="bg-brand-500/10 text-brand-400 text-xs px-2.5 py-1 rounded-lg border border-brand-500/20 font-medium"
                              >
                                {mod}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Ready Button */}
                  <button
                    onClick={() => advanceKdsTicket(ticket.id)}
                    className="w-full bg-success-500/15 hover:bg-success-500/25 text-success-400 border-2 border-success-500/30 hover:border-success-500/50 font-bold py-4 rounded-2xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 text-lg"
                  >
                    <Check className="w-6 h-6" />
                    جاهز
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
