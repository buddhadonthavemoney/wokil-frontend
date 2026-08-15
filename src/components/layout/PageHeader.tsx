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
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-border ${className || ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Gold icon chip, matching the sidebar's gold active marker — the two
            together are what tell you which page you're on. */}
        <div className="p-3 bg-accent/12 border border-accent/25 rounded-xl shrink-0">
          <div className="text-accent">
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })
              : <span className="w-6 h-6">{icon}</span>}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold font-heading text-primary tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
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
