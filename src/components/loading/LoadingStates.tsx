
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, TrendingUp } from 'lucide-react';

export const TradingChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-32" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-80 w-full" />
    </CardContent>
  </Card>
);

export const OrderFormSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

export const PortfolioSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const OrderBookSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const GlobalLoader = ({ message = "Loading..." }: { message?: string }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <Card className="p-6">
      <CardContent className="flex flex-col items-center gap-4">
        <TrendingUp className="w-8 h-8 text-primary animate-pulse" />
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const InlineLoader = ({ size = "sm", message }: { size?: "sm" | "md" | "lg"; message?: string }) => {
  const iconSize = size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8";
  const textSize = size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg";
  
  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <Loader2 className={`${iconSize} animate-spin text-primary`} />
      {message && <span className={`${textSize} text-muted-foreground`}>{message}</span>}
    </div>
  );
};
