import { ArrowLeft, Download, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Tender } from '../data/mockTenders';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsPageProps {
  tenders: Tender[];
  onBack: () => void;
}

export function AnalyticsPage({ tenders, onBack }: AnalyticsPageProps) {
  // Calculate statistics
  const totalTenders = tenders.length;
  const accepted = tenders.filter(t => t.status === 'accepted').length;
  const onhold = tenders.filter(t => t.status === 'onhold').length;
  const removed = tenders.filter(t => t.status === 'removed').length;
  const available = tenders.filter(t => t.status === 'available').length;
  
  const urgent = tenders.filter(t => t.isUrgent && t.status === 'available').length;
  
  const totalValue = tenders.reduce((sum, t) => sum + t.amount, 0);
  const acceptedValue = tenders
    .filter(t => t.status === 'accepted')
    .reduce((sum, t) => sum + t.amount, 0);
  const avgValue = totalValue / totalTenders;
  const maxValue = Math.max(...tenders.map(t => t.amount));

  // Tender activity data (mock 30 days)
  const activityData = [
    { date: 'Dec 8', tenders: 12 },
    { date: 'Dec 15', tenders: 18 },
    { date: 'Dec 22', tenders: 15 },
    { date: 'Dec 29', tenders: 22 },
    { date: 'Jan 5', tenders: 17 },
    { date: 'Jan 7', tenders: 25 },
  ];

  // Status distribution
  const statusData = [
    { name: 'Accepted', value: accepted, color: '#107C10' },
    { name: 'On Hold', value: onhold, color: '#F7630C' },
    { name: 'Removed', value: removed, color: '#D13438' },
  ];

  // Category performance
  const categoryStats: { [key: string]: number } = {};
  tenders.forEach(t => {
    const code = t.category.code;
    categoryStats[code] = (categoryStats[code] || 0) + 1;
  });

  const categoryData = Object.entries(categoryStats)
    .map(([code, count]) => {
      const tender = tenders.find(t => t.category.code === code);
      return {
        category: `${code} - ${tender?.category.name.substring(0, 20)}...`,
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Urgency data
  const moderate = tenders.filter(t => {
    const days = Math.ceil((t.dates.closing.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days >= 7 && days <= 14 && t.status === 'available';
  }).length;
  
  const comfortable = tenders.filter(t => {
    const days = Math.ceil((t.dates.closing.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 14 && t.status === 'available';
  }).length;

  // Category value
  const categoryValueStats: { [key: string]: number } = {};
  tenders.forEach(t => {
    const name = t.category.name;
    categoryValueStats[name] = (categoryValueStats[name] || 0) + t.amount;
  });

  const handleExport = () => {
    toast.success('📥 Report exported successfully');
  };

  const handleEmail = () => {
    toast.success('📧 Report sent to your email');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={handleEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">📊 Tender Analytics & Insights</h1>
          <p className="text-muted-foreground">Comprehensive overview of tender activity and performance</p>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
            <h2 className="text-xl font-semibold mb-6">📈 Tender Activity (Last 30 Days)</h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tenders"
                  stroke="#0078D4"
                  strokeWidth={2}
                  dot={{ fill: '#0078D4', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Scraped</p>
                <p className="text-2xl font-semibold">{totalTenders} tenders</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
                <p className="text-2xl font-semibold">{(totalTenders / 30).toFixed(1)} tenders</p>
              </div>
            </div>
          </section>

          {/* Decision Metrics */}
          <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
            <h2 className="text-xl font-semibold mb-6">🎯 Tender Status Distribution</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success"></div>
                    <span className="text-sm">Accepted</span>
                  </div>
                  <span className="font-semibold">
                    {((accepted / totalTenders) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-warning"></div>
                    <span className="text-sm">On Hold</span>
                  </div>
                  <span className="font-semibold">
                    {((onhold / totalTenders) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive"></div>
                    <span className="text-sm">Removed</span>
                  </div>
                  <span className="font-semibold">
                    {((removed / totalTenders) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Response Time: <span className="font-medium text-foreground">Avg. 2.3 days</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Success Rate: <span className="font-medium text-foreground">{((accepted / totalTenders) * 100).toFixed(0)}% acceptance</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Category Performance */}
          <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
            <h2 className="text-xl font-semibold mb-6">🏆 Most Active Categories</h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" />
                <YAxis dataKey="category" type="category" width={200} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#0078D4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Financial Overview */}
            <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
              <h2 className="text-xl font-semibold mb-6">💰 Tender Value Analysis</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Value Tracked</p>
                  <p className="text-2xl font-semibold">
                    RM {totalValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Accepted Value</p>
                  <p className="text-2xl font-semibold text-success">
                    RM {acceptedValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({((acceptedValue / totalValue) * 100).toFixed(0)}% of total)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Average Value</p>
                    <p className="text-lg font-semibold">
                      RM {avgValue.toLocaleString('en-MY', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Highest Value</p>
                    <p className="text-lg font-semibold">
                      RM {maxValue.toLocaleString('en-MY', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Value by Category:</p>
                  <div className="space-y-2">
                    {Object.entries(categoryValueStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([name, value]) => (
                        <div key={name} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{name}:</span>
                          <span className="font-medium">
                            RM {value.toLocaleString('en-MY', { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Urgency Analysis */}
            <section className="bg-card rounded-lg border border-border p-6 shadow-[var(--shadow-depth-4)]">
              <h2 className="text-xl font-semibold mb-6">⚠️ Deadline Status</h2>
              
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">🔴 Urgent (&lt; 7 days)</p>
                    <p className="text-2xl font-semibold text-destructive">{urgent}</p>
                  </div>
                  <div className="w-full bg-destructive/20 rounded-full h-2">
                    <div
                      className="bg-destructive h-2 rounded-full"
                      style={{ width: `${(urgent / available) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">🟡 Moderate (7-14 days)</p>
                    <p className="text-2xl font-semibold text-warning">{moderate}</p>
                  </div>
                  <div className="w-full bg-warning/20 rounded-full h-2">
                    <div
                      className="bg-warning h-2 rounded-full"
                      style={{ width: `${(moderate / available) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">🟢 Comfortable (&gt; 14 days)</p>
                    <p className="text-2xl font-semibold text-success">{comfortable}</p>
                  </div>
                  <div className="w-full bg-success/20 rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full"
                      style={{ width: `${(comfortable / available) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Average Time Remaining:{' '}
                    <span className="font-medium text-foreground">16.5 days</span>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
