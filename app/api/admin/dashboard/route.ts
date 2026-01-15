// app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getAdminDashboard } from '@/app/actions';

export async function GET() {
    console.log('[API] /api/admin/dashboard - Start');
    try {
        const data = await getAdminDashboard();
        console.log('[API] /api/admin/dashboard - Success, keys:', Object.keys(data || {}));
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API] /api/admin/dashboard - Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch admin data' }, { status: 500 });
    }
}
