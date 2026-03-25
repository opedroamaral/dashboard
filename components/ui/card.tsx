import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-slate-900 border border-slate-700/50 rounded-xl p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
