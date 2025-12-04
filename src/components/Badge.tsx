import clsx from 'clsx';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'premium';
    className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
    const variants = {
        default: 'bg-navy-700 text-gray-300',
        outline: 'border border-navy-600 text-gray-400 bg-transparent',
        secondary: 'bg-navy-600 text-gray-200',
        destructive: 'bg-red-500/10 text-red-500 border border-red-500/20',
        success: 'bg-green-500/10 text-green-500 border border-green-500/20',
        warning: 'bg-gold-500/10 text-gold-500 border border-gold-500/20',
        info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
        premium: 'bg-gradient-to-r from-gold-600/20 to-gold-400/20 text-gold-400 border border-gold-500/30',
    };

    return (
        <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}
