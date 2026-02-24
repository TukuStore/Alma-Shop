import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
    return (
        <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">

            {/* Breadcrumb Skeleton */}
            <div className="flex items-center space-x-2 mb-8">
                <Skeleton className="h-4 w-16" />
                <span className="text-muted-foreground">/</span>
                <Skeleton className="h-4 w-16" />
                <span className="text-muted-foreground">/</span>
                <Skeleton className="h-4 w-32" />
            </div>

            <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
                {/* Gallery Skeleton */}
                <div className="w-full lg:w-[45%] xl:w-1/2 space-y-4">
                    <Skeleton className="w-full aspect-square rounded-2xl" />
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="w-20 h-20 shrink-0 rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Info Area Skeleton */}
                <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col pt-4">
                    <div className="flex gap-2 mb-3">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>

                    <Skeleton className="h-10 w-3/4 mb-4" />

                    <Skeleton className="h-5 w-32 mb-8" />

                    <Skeleton className="h-10 w-48 mb-6" />

                    <div className="space-y-3 mb-8">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[95%]" />
                        <Skeleton className="h-4 w-[85%]" />
                        <Skeleton className="h-4 w-[90%]" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-border border-dashed pb-6 mb-6">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-3/4" />
                    </div>

                    {/* Actions Skeleton */}
                    <div className="space-y-4 mt-auto">
                        <div className="flex gap-4">
                            <Skeleton className="h-14 w-32 rounded-xl" />
                            <Skeleton className="h-14 flex-1 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
