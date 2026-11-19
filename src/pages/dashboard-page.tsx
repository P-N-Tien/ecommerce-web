import { Activity, Boxes, ClipboardList, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const metrics = [
  { label: 'Orders today', value: '24', change: '+12% from yesterday', icon: ClipboardList },
  { label: 'Products', value: '148', change: 'Across 8 categories', icon: Boxes },
  { label: 'Customers', value: '1,284', change: '+36 this week', icon: Users },
  { label: 'Store activity', value: 'Healthy', change: 'All systems operational', icon: Activity },
];

export function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Overview</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A quick look at your store. These are sample values for the development demo.
        </p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store summary">
        {metrics.map(({ label, value, change, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{label}</span>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <p className="mt-4 text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{change}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold">Welcome to your admin workspace</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Use the navigation to manage your catalog. Categories are backed by local demo data and support create,
            edit, and delete.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
