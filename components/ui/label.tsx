"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  optional?: boolean;
  error?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, optional, error, ...props }, ref) => (
  <div className="flex flex-col space-y-1.5">
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        labelVariants(),
        error ? "text-red-500" : "text-gray-200",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        {optional && (
          <span className="text-xs font-normal text-gray-400">(Optional)</span>
        )}
      </div>
    </LabelPrimitive.Root>
    {error && typeof error === 'string' && (
      <p className="text-xs text-red-500">{error}</p>
    )}
  </div>
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label, labelVariants };