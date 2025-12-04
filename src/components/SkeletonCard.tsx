import clsx from 'clsx';

export default function SkeletonCard({ variant = 'standard' }: { variant?: 'standard' | 'list-item' | 'large' }) {

    if (variant === 'list-item') {
        return (
            <div className="h-[80px] bg-[#121218] rounded-xl border border-navy-700 p-3 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4 w-full">
                    <div className="h-12 w-12 rounded-lg bg-navy-800 flex-shrink-0" />
                    <div className="flex flex-col gap-2 w-full pr-4">
                        <div className="h-4 bg-navy-800 rounded w-3/4" />
                        <div className="h-3 bg-navy-800 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'large') {
        return (
            <div className="h-[200px] bg-[#121218] rounded-2xl border border-navy-700 p-5 flex flex-col justify-between animate-pulse">
                <div className="flex justify-between items-start">
                    <div className="h-14 w-14 rounded-xl bg-navy-800" />
                    <div className="h-6 w-16 bg-navy-800 rounded" />
                </div>
                <div className="space-y-2">
                    <div className="h-5 bg-navy-800 rounded w-full" />
                    <div className="h-5 bg-navy-800 rounded w-2/3" />
                </div>
                <div className="flex justify-between pt-3 border-t border-navy-800">
                    <div className="h-4 w-20 bg-navy-800 rounded" />
                    <div className="h-4 w-12 bg-navy-800 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-[260px] h-[200px] bg-[#121218] rounded-2xl border border-navy-700 p-4 flex flex-col justify-between animate-pulse flex-shrink-0">
            <div className="flex justify-between items-start">
                <div className="h-11 w-11 rounded-[10px] bg-navy-800" />
                <div className="h-5 w-24 bg-navy-800 rounded" />
            </div>
            <div className="space-y-2 py-2">
                <div className="h-4 bg-navy-800 rounded w-full" />
                <div className="h-4 bg-navy-800 rounded w-5/6" />
                <div className="h-3 bg-navy-800 rounded w-1/2" />
            </div>
            <div className="flex justify-between pt-2 border-t border-navy-800">
                <div className="h-4 w-16 bg-navy-800 rounded" />
                <div className="h-4 w-10 bg-navy-800 rounded" />
            </div>
        </div>
    );
}
