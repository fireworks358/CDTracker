import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { Drug } from '@/types';
import { format, parseISO } from 'date-fns';

interface StockChartProps {
  drug: Drug;
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  available: number;
  total: number;
}

export function StockChart({ drug }: StockChartProps) {
  const chartData = useMemo(() => {
    // Sort logs by timestamp
    const sortedLogs = [...drug.logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (sortedLogs.length === 0) {
      // No logs, just show current state
      return [
        {
          date: new Date().toISOString(),
          dateLabel: format(new Date(), 'dd MMM'),
          available: drug.stockLevels.available,
          total: drug.stockLevels.total,
        },
      ];
    }

    // Calculate running totals from logs
    const dataPoints: ChartDataPoint[] = [];
    let runningAvailable = 0;
    let runningTotal = 0;
    let runningOOD = 0;

    // Group logs by date and calculate end-of-day values
    const logsByDate = new Map<string, typeof sortedLogs>();

    for (const log of sortedLogs) {
      const dateKey = log.timestamp.split('T')[0];
      const existing = logsByDate.get(dateKey) || [];
      existing.push(log);
      logsByDate.set(dateKey, existing);
    }

    // Process each date
    for (const [dateStr, logs] of logsByDate) {
      for (const log of logs) {
        switch (log.type) {
          case 'CHECK_IN':
            runningAvailable += log.quantity;
            runningTotal += log.quantity;
            break;
          case 'CHECK_OUT':
            runningAvailable -= log.quantity;
            runningTotal -= log.quantity;
            break;
          case 'OOD':
            runningAvailable -= log.quantity;
            runningOOD += log.quantity;
            // Total stays same: total = available + ood
            break;
          case 'PHARMACY_RETURN':
            // Removing OOD items - reduces OOD count and total
            runningOOD -= log.quantity;
            break;
        }
      }

      dataPoints.push({
        date: dateStr,
        dateLabel: format(parseISO(dateStr), 'dd MMM'),
        available: Math.max(0, runningAvailable),
        total: Math.max(0, runningTotal + runningOOD),
      });
    }

    // Add current state as last point if different from last log date
    const today = new Date().toISOString().split('T')[0];
    const lastDataPoint = dataPoints[dataPoints.length - 1];

    if (!lastDataPoint || lastDataPoint.date !== today) {
      dataPoints.push({
        date: today,
        dateLabel: format(new Date(), 'dd MMM'),
        available: drug.stockLevels.available,
        total: drug.stockLevels.total,
      });
    }

    return dataPoints;
  }, [drug]);

  if (chartData.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">
          More data needed to show trend chart
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
          />
          <ReferenceLine
            y={drug.stockLevels.minimumStock}
            stroke="#F59E0B"
            strokeDasharray="5 5"
            label={{
              value: 'Min',
              position: 'right',
              fill: '#F59E0B',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="available"
            name="Available"
            stroke="#16A34A"
            strokeWidth={2}
            dot={{ fill: '#16A34A', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#005EB8"
            strokeWidth={2}
            dot={{ fill: '#005EB8', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
