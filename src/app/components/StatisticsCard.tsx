import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatisticsCardProps {
  icon: LucideIcon;
  count: number;
  label: string;
  trend?: {
    value: number;
    label: string;
  };
  variant: 'primary' | 'success' | 'warning' | 'danger';
  delay?: number;
}

const variantStyles = {
  primary: {
    border: 'border-l-4 border-l-primary',
    icon: 'text-primary',
    bg: 'bg-primary/5',
  },
  success: {
    border: 'border-l-4 border-l-success',
    icon: 'text-success',
    bg: 'bg-success/5',
  },
  warning: {
    border: 'border-l-4 border-l-warning',
    icon: 'text-warning',
    bg: 'bg-warning/5',
  },
  danger: {
    border: 'border-l-4 border-l-destructive',
    icon: 'text-destructive',
    bg: 'bg-destructive/5',
  },
};

export function StatisticsCard({ icon: Icon, count, label, trend, variant, delay = 0 }: StatisticsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`bg-card rounded-lg p-6 ${styles.border} transition-shadow duration-200 hover:shadow-[var(--shadow-depth-8)] shadow-[var(--shadow-depth-4)]`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${styles.bg}`}>
            <Icon className={`h-6 w-6 ${styles.icon}`} />
          </div>
        </div>
        
        <div>
          <div className="text-3xl font-semibold text-card-foreground mb-1">
            {count}
          </div>
          <div className="text-sm text-muted-foreground">
            {label}
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className={trend.value > 0 ? 'text-success' : trend.value < 0 ? 'text-destructive' : ''}>
              {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '•'} {Math.abs(trend.value)}
            </span>
            <span>{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
