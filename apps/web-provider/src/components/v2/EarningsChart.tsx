
'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface EarningsChartProps {
    data: { date: string; amount: number }[];
}

export const EarningsChart = ({ data }: EarningsChartProps) => {
    return (
        <div className="bg-white p-6 rounded-card border border-neutral-100 shadow-sm h-[300px]">
            <h3 className="font-bold text-neutral-900 mb-4">Weekly Earnings</h3>
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ fill: '#f3f4f6', radius: 4 }}
                            contentStyle={{
                                backgroundColor: '#171717',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '12px'
                            }}
                        />
                        <Bar
                            dataKey="amount"
                            fill="#8AE98D"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
