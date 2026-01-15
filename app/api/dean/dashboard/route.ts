// app/api/dean/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getDeanDashboard } from '@/app/actions';

export async function GET() {
    try {
        const data = await getDeanDashboard();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching dean dashboard:', error);
        return NextResponse.json({ error: 'Failed to fetch dean data' }, { status: 500 });
    }
}
