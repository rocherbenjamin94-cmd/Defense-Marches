'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BuyerHistoryProps {
    data?: { month: string; count: number }[];
    color?: string;
}

const MOCK_DATA = [
    { month: 'J', count: 4 },
    { month: 'F', count: 6 },
    { month: 'M', count: 3 },
    { month: 'A', count: 8 },
    { month: 'M', count: 5 },
    { month: 'J', count: 7 },
    { month: 'J', count: 4 },
    { month: 'A', count: 2 },
    { month: 'S', count: 9 },
    { month: 'O', count: 6 },
    { month: 'N', count: 5 },
    { month: 'D', count: 3 },
];

export default function BuyerHistory({ data = MOCK_DATA, color = '#3b82f6' }: BuyerHistoryProps) {
    return (
        <div className="h-[150px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 10 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#1a1a24' }}
                        contentStyle={{ backgroundColor: '#121218', borderColor: '#2a2a34', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={color} fillOpacity={0.6} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
