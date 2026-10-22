'use client';

// From Thani's Earth shadcn registry (https://earth-ds-registry.vercel.app/r/eds-base.json),
// adapted for this Tailwind v3 project: local `cn`, and Tailwind v4-only classes rewritten.
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				'peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none group-has-[:disabled]/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:[&:not([data-checked])]:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-destructive/20 aria-[invalid=true]:aria-checked:border-primary dark:bg-input/30 dark:aria-[invalid=true]:border-destructive/50 dark:aria-[invalid=true]:ring-destructive/40 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground group-has-[:focus-visible]/field-label:data-[checked]:border-primary dark:data-[checked]:bg-primary',
				className
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
			>
				<CheckIcon />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
