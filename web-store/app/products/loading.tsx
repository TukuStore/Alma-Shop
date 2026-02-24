import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
    return (
        <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar Skeleton */}
                <div className="w-full md:w-64 lg:w-72 shrink-0 hidden md:block space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-full rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                            <Skeleton className="h-8 w-full rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <Skeleton className="h-10 w-48 rounded-md" />
                        <Skeleton className="h-10 w-32 rounded-md" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-3">
                                {/* Image Placeholder */}
                                <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                                {/* Content Placeholders */}
                                <Skeleton className="h-4 w-1/3 mt-2" />
                                <Skeleton className="h-5 w-3/4" />
                                <div className="flex justify-between items-center mt-2">
                                    <Skeleton className="h-6 w-1/2" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
