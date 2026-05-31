const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function debug() {
    console.log('\n=== DB DEBUG ===\n');

    const users = await pool.query('SELECT id, name, role FROM "User"');
    console.log('USERS:');
    users.rows.forEach(u => console.log(`  [${u.role}] ${u.name} — ${u.id}`));

    const contracts = await pool.query('SELECT id, "clientId", "freelancerId", status, "paymentStatus", "createdAt" FROM "Contract"');
    console.log('\nCONTRACTS:');
    if (contracts.rows.length === 0) console.log('  (none)');
    contracts.rows.forEach(c => console.log(`  ${c.id} | status=${c.status} | client=${c.clientId} | freelancer=${c.freelancerId}`));

    const proposals = await pool.query('SELECT id, status, "freelancerId", "jobId" FROM "Proposal"');
    console.log('\nPROPOSALS:');
    if (proposals.rows.length === 0) console.log('  (none)');
    proposals.rows.forEach(p => console.log(`  ${p.id} | status=${p.status} | freelancer=${p.freelancerId}`));

    const convs = await pool.query('SELECT id, "contractId", "clientId", "freelancerId" FROM "Conversation"');
    console.log('\nCONVERSATIONS:');
    if (convs.rows.length === 0) console.log('  (none)');
    convs.rows.forEach(c => console.log(`  ${c.id} | contract=${c.contractId}`));

    console.log('\n================\n');
    await pool.end();
}

debug().catch(console.error);
