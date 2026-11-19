import { Card, CardContent } from '@/components/ui/card';

export function FeaturePlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Store management</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <h2 className="font-medium">This section is ready for development</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sample records and actions will appear here when this feature is added.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
