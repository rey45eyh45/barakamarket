"use client";

import { toast, Toaster as Sonner } from "sonner@2.0.3";
import type { ExternalToast } from "sonner@2.0.3";

type ToasterProps = {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  expand?: boolean;
  richColors?: boolean;
  duration?: number;
};

const Toaster = ({ position = 'top-center', ...props }: ToasterProps) => {
  return (
    <Sonner
      position={position}
      className="toaster group"
      {...props}
    />
  );
};

export { Toaster, toast };
export type { ExternalToast };