"use client";

import { 
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

// Define chart colors based on Tailwind CSS variables
const getChartColors = () => {
  return [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
};

interface ChartData {
  [key: string]: string | number;
}

interface ChartProps {
  data: ChartData[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  className?: string;
}

export function BarChart({
  data,
  index,
  categories,
  colors = getChartColors(),
  valueFormatter = (value) => value.toString(),
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  className,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={cn(className)}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis />}
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <Tooltip formatter={valueFormatter} />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Bar 
            key={category} 
            dataKey={category} 
            fill={colors[i % colors.length]} 
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function LineChart({
  data,
  index,
  categories,
  colors = getChartColors(),
  valueFormatter = (value) => value.toString(),
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  className,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={cn(className)}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis />}
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <Tooltip formatter={valueFormatter} />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

interface PieChartProps {
  data: ChartData[];
  index: string;
  category: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function PieChart({
  data,
  index,
  category,
  colors = getChartColors(),
  valueFormatter = (value) => value.toString(),
  className,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={cn(className)}>
      <RechartsPieChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={valueFormatter} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}