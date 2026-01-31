import React from 'react';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string; // Added to support styling
}

export function PageHeader({ icon, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 ${className || ''}`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl shrink-0">
          <div className="text-primary">
            {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
