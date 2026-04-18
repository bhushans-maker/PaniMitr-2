import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

export default function History() {
  const { dailyHistory, getDailyGoal } = useStore();
  
  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const record = dailyHistory[dateStr];
    return {
      name: format(d, 'EEE'), // Mon, Tue, etc.
      intake: record ? record.totalIntake : 0,
      goal: record ? record.goal : getDailyGoal(),
      fullDate: dateStr
    };
  });

  return (
    <div className="p-6 space-y-8 pt-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">History</h2>
        <p className="text-muted-foreground text-sm">Your hydration journey</p>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Last 7 Days</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'var(--muted-fg)' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'var(--muted-fg)' }}
              />
              <Tooltip 
                cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="intake" radius={[6, 6, 6, 6]}>
                {last7Days.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.intake >= entry.goal ? 'var(--primary)' : 'var(--primary)'} 
                    fillOpacity={entry.intake >= entry.goal ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Recent Logs</h3>
        <div className="space-y-2">
          {last7Days.slice().reverse().map((day) => (
            <div key={day.fullDate} className="flex justify-between items-center bg-card border border-border/50 p-4 rounded-2xl">
              <div className="flex flex-col">
                <span className="font-semibold">{day.name}</span>
                <span className="text-xs text-muted-foreground">{day.fullDate}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold">{day.intake} ml</span>
                <span className="text-xs text-muted-foreground">/ {day.goal} ml</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
