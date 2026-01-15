// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getAdminDashboard } from '@/app/actions';

export async function GET() {
    try {
        const data = await getAdminDashboard();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }
}
