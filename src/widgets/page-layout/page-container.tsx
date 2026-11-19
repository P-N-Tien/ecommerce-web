import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderProps {
  section?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return <main className={`mx-auto w-full max-w-6xl space-y-6 px-6 py-10 ${className}`}>{children}</main>;
}

export function PageHeader({ section, title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="space-y-1">
        {section && <p className="text-sm font-medium text-muted-foreground">{section}</p>}
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  );
}
