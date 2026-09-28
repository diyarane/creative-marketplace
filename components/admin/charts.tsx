"use client";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3654ff", "#f2542d", "#1c8a5b", "#8b5cf6", "#0ea5b7", "#d4af37", "#101114", "#6c6e70"];

export interface AdminStats {
  totalUsers: number; totalCreators: number; totalClients: number; activeProjects: number; completedProjects: number; pendingProjects: number; transactionValue: number;
  statusDistribution: Record<string, number>; categoryBreakdown: Record<string, number>;
  months: { label: string; users: number; projects: number; revenue: number }[];
}

export function ProjectsOverTime({ data }: { data: AdminStats["months"] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#dcd8cd" /><XAxis dataKey="label" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
        <Line type="monotone" dataKey="projects" stroke="#3654ff" strokeWidth={2} /><Line type="monotone" dataKey="users" stroke="#f2542d" strokeWidth={2} /></LineChart>
    </ResponsiveContainer>
  );
}
export function RevenueChart({ data }: { data: AdminStats["months"] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#dcd8cd" /><XAxis dataKey="label" fontSize={12} /><YAxis fontSize={12} /><Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} /><Bar dataKey="revenue" fill="#3654ff" radius={[6, 6, 0, 0]} /></BarChart>
    </ResponsiveContainer>
  );
}
export function DistributionPie({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data).map(([name, value]) => ({ name: name.replace(/_/g, " ").toLowerCase(), value }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart><Pie data={rows} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>{rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart>
    </ResponsiveContainer>
  );
}
export function CategoryBars({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} layout="vertical" margin={{ left: 40 }}><CartesianGrid strokeDasharray="3 3" stroke="#dcd8cd" /><XAxis type="number" allowDecimals={false} fontSize={12} /><YAxis type="category" dataKey="name" fontSize={11} width={110} /><Tooltip /><Bar dataKey="value" fill="#f2542d" radius={[0, 6, 6, 0]} /></BarChart>
    </ResponsiveContainer>
  );
}
