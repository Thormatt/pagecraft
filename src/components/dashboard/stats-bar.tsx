import { formatNumber } from "@/lib/utils";

interface StatsBarProps {
  totalPages: number;
  totalViews: number;
  publishedPages: number;
}

export function StatsBar({ totalPages, totalViews, publishedPages }: StatsBarProps) {
  const stats = [
    { label: "Total Pages", value: formatNumber(totalPages) },
    { label: "Published", value: formatNumber(publishedPages) },
    { label: "Total Views", value: formatNumber(totalViews) },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border/50 bg-background p-4 gradient-border card-glow">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
          <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
