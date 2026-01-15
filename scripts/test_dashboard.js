const { getAdminDashboard } = require('./app/actions');

async function test() {
    try {
        console.log('Fetching Admin Dashboard data...');
        const data = await getAdminDashboard();
        console.log('Success! Data received:');
        console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    } catch (e) {
        console.error('FAILED to fetch dashboard:', e);
    }
}

test();
