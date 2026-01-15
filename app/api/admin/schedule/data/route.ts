// app/api/admin/schedule/data/route.ts
import { NextResponse } from 'next/server';
import db from '@/app/db';

export async function GET() {
    if (!db) {
        return NextResponse.json({ error: 'DB not connected' }, { status: 500 });
    }

    try {
        const departments = db.prepare('SELECT name FROM Department').all().map((d: any) => d.name);
        const rooms = db.prepare('SELECT id, name, capacity as capacite FROM ExamRoom').all();
        const professors = db.prepare('SELECT id, firstName, lastName FROM Professor').all().map((p: any) => ({
            id: p.id,
            name: `Dr. ${p.firstName} ${p.lastName}`
        }));
        const formations = db.prepare('SELECT name FROM Formation').all().map((f: any) => f.name);
        const modules = db.prepare('SELECT id, name, code FROM Module').all();

        return NextResponse.json({
            departments,
            rooms,
            professors,
            formations,
            modules
        });
    } catch (error) {
        console.error('Error fetching schedule data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
