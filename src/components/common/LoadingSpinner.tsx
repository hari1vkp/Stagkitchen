import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ size = 48, className }: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="relative">
        <Loader2 size={size} className="animate-spin text-finpay-teal-500" />
        <div className="absolute inset-0 rounded-full border-4 border-finpay-teal-200/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-finpay-teal-500 animate-spin"></div>
      </div>
    </div>
  );
}
