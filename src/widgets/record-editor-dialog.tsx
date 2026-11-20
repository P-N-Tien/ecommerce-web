import { useState, type FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export type EditorField = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'textarea' | 'select';
  required?: boolean;
  min?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

type RecordEditorDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  fields: EditorField[];
  initialValues?: Record<string, unknown>;
  isSaving?: boolean;
  errorMessage?: string | null;
  submitLabel: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Record<string, string | number>) => Promise<void>;
};

export function RecordEditorDialog({
  open,
  title,
  description,
  fields,
  initialValues = {},
  isSaving = false,
  errorMessage,
  submitLabel,
  onOpenChange,
  onSubmit,
}: RecordEditorDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, String(initialValues[field.name] ?? '')])),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result: Record<string, string | number> = {};
    for (const field of fields) {
      const value = values[field.name] ?? '';
      result[field.name] = field.type === 'number' ? Number(value) : value.trim();
    }
    await onSubmit(result);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        {fields.map((field) => {
          const value = values[field.name] ?? '';
          return (
            <label key={field.name} className="block space-y-2 text-sm font-medium">
              <span>{field.label}</span>
              {field.type === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  rows={4}
                  required={field.required}
                  placeholder={field.placeholder}
                  disabled={isSaving}
                  className="flex w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm font-normal placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                />
              ) : field.type === 'select' ? (
                <select
                  value={value}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  required={field.required}
                  disabled={isSaving}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type ?? 'text'}
                  value={value}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  required={field.required}
                  min={field.min}
                  step={field.step}
                  placeholder={field.placeholder}
                  disabled={isSaving}
                />
              )}
            </label>
          );
        })}
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Could not save changes</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
