'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { ArrowUp } from 'lucide-react';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} size="icon">
      {pending ? (
          <Icons.Spinner className="animate-spin" />
      ) : (
        <>
          <ArrowUp />
          <span className="sr-only">Search</span>
        </>
      )}
    </Button>
  );
}
