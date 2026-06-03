"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { DailyMetric } from "@/lib/dashboard-analytics"

import { BOOST_GREEN, BOOST_GREEN_DIM } from "@/lib/brand"

const CHART_COLOR = BOOST_GREEN
const CHART_FILL = BOOST_GREEN_DIM

type LimeLineChartProps = {
  data: DailyMetric[]
  valuePrefix?: string
  valueSuffix?: string
  height?: number
}

export function LimeLineChart({
  data,
  valuePrefix = "",
  valueSuffix = "",
  height = 240,
}: LimeLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={40}
          allowDecimals={valuePrefix === "$"}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => [
            `${valuePrefix}${Number(value).toLocaleString()}${valueSuffix}`,
            "",
          ]}
          labelFormatter={(label) => String(label)}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART_COLOR}
          strokeWidth={2.5}
          dot={{ fill: CHART_COLOR, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: CHART_COLOR }}
          fill={CHART_FILL}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
