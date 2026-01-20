import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { ArrowLeft, Building2, AlertTriangle, TrendingUp } from 'lucide-react';
import type { Drug } from '@/types';
import { Button } from '@/components/ui/button';
import { format, parseISO, startOfMonth } from 'date-fns';

interface AnalyticsDashboardProps {
  drugs: Drug[];
  onBack: () => void;
}

interface TheatreUsage {
  location: string;
  total: number;
  drugs: { [drugName: string]: number };
}

interface OODByDrug {
  drugName: string;
  totalOOD: number;
  currentOOD: number;
  returned: number;
}

interface MonthlyOOD {
  month: string;
  [drugName: string]: string | number;
}

export function AnalyticsDashboard({ drugs, onBack }: AnalyticsDashboardProps) {
  // Calculate theatre usage statistics
  const theatreUsageData = useMemo(() => {
    const usageMap = new Map<string, TheatreUsage>();

    drugs.forEach((drug) => {
      drug.logs.forEach((log) => {
        if (log.type === 'CHECK_OUT' && log.location && log.location !== 'Pharmacy' && log.location !== 'Remote') {
          const existing = usageMap.get(log.location) || {
            location: log.location,
            total: 0,
            drugs: {},
          };

          existing.total += log.quantity;
          existing.drugs[drug.name] = (existing.drugs[drug.name] || 0) + log.quantity;
          usageMap.set(log.location, existing);
        }
      });
    });

    return Array.from(usageMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 15); // Top 15 theatres
  }, [drugs]);

  // Calculate OOD statistics by drug
  const oodByDrugData = useMemo(() => {
    const oodData: OODByDrug[] = drugs.map((drug) => {
      let totalOOD = 0;
      let returned = 0;

      drug.logs.forEach((log) => {
        if (log.type === 'OOD') {
          totalOOD += log.quantity;
        } else if (log.type === 'PHARMACY_RETURN') {
          returned += log.quantity;
        }
      });

      return {
        drugName: drug.name,
        totalOOD,
        currentOOD: drug.stockLevels.ood,
        returned,
      };
    });

    return oodData.filter((d) => d.totalOOD > 0 || d.currentOOD > 0);
  }, [drugs]);

  // Calculate monthly OOD trends (last 12 months)
  const monthlyOODData = useMemo(() => {
    const now = new Date();
    const months: MonthlyOOD[] = [];

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: format(date, 'MMM yy'),
      });
    }

    // Aggregate OOD by drug per month
    drugs.forEach((drug) => {
      const monthlyTotals = new Map<string, number>();

      drug.logs.forEach((log) => {
        if (log.type === 'OOD') {
          const logDate = parseISO(log.timestamp);
          const monthKey = format(startOfMonth(logDate), 'MMM yy');
          monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + log.quantity);
        }
      });

      months.forEach((monthData) => {
        const value = monthlyTotals.get(monthData.month) || 0;
        if (value > 0) {
          monthData[drug.name] = value;
        }
      });
    });

    return months;
  }, [drugs]);

  // Get drug names that have OOD data for the chart
  const drugsWithOOD = useMemo(() => {
    const drugNames = new Set<string>();
    drugs.forEach((drug) => {
      const hasOOD = drug.logs.some((log) => log.type === 'OOD');
      if (hasOOD) {
        drugNames.add(drug.name);
      }
    });
    return Array.from(drugNames);
  }, [drugs]);

  // Top drugs by theatre
  const topDrugsByTheatre = useMemo(() => {
    const result: { theatre: string; drug: string; quantity: number }[] = [];

    theatreUsageData.forEach((theatre) => {
      const topDrug = Object.entries(theatre.drugs).sort((a, b) => b[1] - a[1])[0];
      if (topDrug) {
        result.push({
          theatre: theatre.location,
          drug: topDrug[0],
          quantity: topDrug[1],
        });
      }
    });

    return result.slice(0, 10);
  }, [theatreUsageData]);

  // Chart colors
  const COLORS = [
    '#005EB8', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-11 w-11"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500">Theatre usage and OOD trends</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {theatreUsageData.reduce((sum, t) => sum + t.total, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Theatre Checkouts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {drugs.reduce((sum, d) => sum + d.stockLevels.ood, 0)}
                </p>
                <p className="text-sm text-gray-500">Current OOD Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {oodByDrugData.reduce((sum, d) => sum + d.returned, 0)}
                </p>
                <p className="text-sm text-gray-500">Returned to Pharmacy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Theatre Usage Chart */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Theatre Usage (Total Checkouts)
          </h2>
          {theatreUsageData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={theatreUsageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="location"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="total" fill="#005EB8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No theatre checkout data available</p>
          )}
        </div>

        {/* Top Drug by Theatre */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Most Common Drug by Theatre</h2>
          {topDrugsByTheatre.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topDrugsByTheatre.map((item) => (
                <div
                  key={item.theatre}
                  className="bg-gray-50 rounded-lg p-4 text-center"
                >
                  <p className="text-2xl font-bold text-primary">{item.theatre}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 truncate" title={item.drug}>
                    {item.drug}
                  </p>
                  <p className="text-xs text-gray-500">{item.quantity} units</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>

        {/* OOD by Drug */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Out of Date Summary by Drug
          </h2>
          {oodByDrugData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Drug Name</th>
                    <th className="text-right px-4 py-3 font-semibold">Total Marked OOD</th>
                    <th className="text-right px-4 py-3 font-semibold">Returned to Pharmacy</th>
                    <th className="text-right px-4 py-3 font-semibold">Current OOD</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {oodByDrugData.map((item) => (
                    <tr key={item.drugName} className="bg-white">
                      <td className="px-4 py-3 font-medium">{item.drugName}</td>
                      <td className="px-4 py-3 text-right text-orange-600 font-semibold">
                        {item.totalOOD}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-600 font-semibold">
                        {item.returned}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            item.currentOOD > 0
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item.currentOOD}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right text-orange-600">
                      {oodByDrugData.reduce((sum, d) => sum + d.totalOOD, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-purple-600">
                      {oodByDrugData.reduce((sum, d) => sum + d.returned, 0)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {oodByDrugData.reduce((sum, d) => sum + d.currentOOD, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No OOD data recorded yet</p>
          )}
        </div>

        {/* Monthly OOD Trend */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Monthly OOD Trends (Last 12 Months)
          </h2>
          {drugsWithOOD.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyOODData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {drugsWithOOD.map((drugName, index) => (
                    <Line
                      key={drugName}
                      type="monotone"
                      dataKey={drugName}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 0, r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No OOD trends to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
