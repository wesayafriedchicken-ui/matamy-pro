import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function PageHeader({ title, description, subtitle, actions, children }: PageHeaderProps) {
  const desc = description || subtitle;
  const actionContent = actions || children;

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div>
        <h3 className="text-white font-bold text-xl">{title}</h3>
        {desc && <p className="text-navy-400 text-sm mt-1">{desc}</p>}
      </div>
      {actionContent && <div className="flex items-center gap-3">{actionContent}</div>}
    </div>
  );
}
