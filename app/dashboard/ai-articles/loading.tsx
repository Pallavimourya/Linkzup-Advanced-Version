import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AIArticlesLoading() {
  return (
    <div className="container mx-auto p-2 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-36 sm:w-48" />
          <Skeleton className="h-3 sm:h-4 w-72 sm:w-96" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <Skeleton className="h-5 sm:h-6 w-48 sm:w-64" />
          <Skeleton className="h-3 sm:h-4 w-64 sm:w-80" />
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Skeleton className="h-9 sm:h-10 w-full" />
            <Skeleton className="h-9 sm:h-10 w-full" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-32" />
        </CardContent>
      </Card>

      <div className="space-y-3 sm:space-y-4">
        <Skeleton className="h-6 sm:h-7 w-36 sm:w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 sm:h-5 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                    <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
                  </div>
                </div>
                <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
