// From Thani's Earth shadcn registry (https://earth-ds-registry.vercel.app/r/eds-base.json),
// adapted for this Tailwind v3 project: local `cn`, and Tailwind v4-only classes rewritten.
import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				'flex [field-sizing:content] min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-[invalid=true]:border-destructive/50 dark:aria-[invalid=true]:ring-destructive/40',
				className
			)}
			{...props}
		/>
	);
}

export { Textarea };
