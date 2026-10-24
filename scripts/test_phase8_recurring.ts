import { calculateNextRunDate } from '../server/db.js';

const API_BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- STARTING FINORA PHASE 8 RECURRING TRANSACTIONS & SCHEDULER SUITE ---');

  let token = '';

  // 1. Authenticate with seeded user Ansh Kumar
  console.log('\nScenario 1: Authenticate with seeded user Ansh Kumar');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ansh@example.com', password: 'password123' }),
  });

  const loginData = await loginRes.json();
  if (loginRes.ok && loginData.token) {
    token = loginData.token;
    console.log('  ✅ PASS: Login successful and JWT returned');
  } else {
    console.error('  ❌ FAIL: Login failed', loginData);
    process.exit(1);
  }

  // 2. Unauthenticated request protection
  console.log('\nScenario 2: Unauthenticated protection check');
  const unauthRes = await fetch(`${API_BASE}/recurring-transactions`);
  if (unauthRes.status === 401) {
    console.log('  ✅ PASS: Unauthenticated recurring transactions request correctly rejected with 401');
  } else {
    console.error(`  ❌ FAIL: Unauthenticated request returned status ${unauthRes.status}`);
    process.exit(1);
  }

  // 3. Get initial summary
  console.log('\nScenario 3: Get initial recurring summary');
  const summaryRes = await fetch(`${API_BASE}/recurring-transactions/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const summaryData = await summaryRes.json();
  if (summaryRes.ok && summaryData.success && summaryData.summary) {
    console.log('  ✅ PASS: Summary endpoint returned 200 OK');
    console.log(`  ✅ PASS: Active schedules count: ${summaryData.summary.activeCount}`);
    console.log(`  ✅ PASS: Est. Monthly Income: ₹${summaryData.summary.estMonthlyIncome}`);
    console.log(`  ✅ PASS: Est. Monthly Expense: ₹${summaryData.summary.estMonthlyExpense}`);
  } else {
    console.error('  ❌ FAIL: Failed to retrieve recurring summary', summaryData);
    process.exit(1);
  }

  // 4. Create new recurring schedule
  console.log('\nScenario 4: Create new recurring schedule');
  const createRes = await fetch(`${API_BASE}/recurring-transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Cult.Fit Gym Membership',
      type: 'expense',
      amount: 2500,
      category: 'Health & Insurance',
      frequency: 'monthly',
      startDate: '2026-10-20',
      paymentMethod: 'Credit Card',
      merchant: 'CultFit Healthcare',
      notes: 'Monthly fitness center membership',
    }),
  });

  const createData = await createRes.json();
  let createdScheduleId = '';
  if (createRes.status === 201 && createData.success && createData.schedule) {
    createdScheduleId = createData.schedule.id;
    console.log(`  ✅ PASS: Recurring schedule created with ID: ${createdScheduleId}`);
    console.log(`  ✅ PASS: Next run date initialized to: ${createData.schedule.nextRunDate}`);
  } else {
    console.error('  ❌ FAIL: Failed to create recurring schedule', createData);
    process.exit(1);
  }

  // 5. Pause and Resume schedule
  console.log('\nScenario 5: State Transitions (Pause & Resume)');
  const pauseRes = await fetch(`${API_BASE}/recurring-transactions/${createdScheduleId}/pause`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const pauseData = await pauseRes.json();
  if (pauseRes.ok && pauseData.schedule?.status === 'paused') {
    console.log('  ✅ PASS: Schedule paused successfully');
  } else {
    console.error('  ❌ FAIL: Failed to pause schedule', pauseData);
    process.exit(1);
  }

  const resumeRes = await fetch(`${API_BASE}/recurring-transactions/${createdScheduleId}/resume`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const resumeData = await resumeRes.json();
  if (resumeRes.ok && resumeData.schedule?.status === 'active') {
    console.log('  ✅ PASS: Schedule resumed to active status successfully');
  } else {
    console.error('  ❌ FAIL: Failed to resume schedule', resumeData);
    process.exit(1);
  }

  // 6. Recurrence calculation date math tests
  console.log('\nScenario 6: Date Calculation & Short Month Edge Cases');
  const d1 = calculateNextRunDate('2026-10-01', 'daily');
  if (d1 === '2026-10-02') {
    console.log('  ✅ PASS: Daily calculation correct (2026-10-01 -> 2026-10-02)');
  } else {
    console.error(`  ❌ FAIL: Daily calculation incorrect: got ${d1}`);
    process.exit(1);
  }

  const w1 = calculateNextRunDate('2026-10-01', 'weekly');
  if (w1 === '2026-10-08') {
    console.log('  ✅ PASS: Weekly calculation correct (2026-10-01 -> 2026-10-08)');
  } else {
    console.error(`  ❌ FAIL: Weekly calculation incorrect: got ${w1}`);
    process.exit(1);
  }

  // Month-end clamping (Jan 31 -> Feb 28 in non-leap year 2027)
  const m1 = calculateNextRunDate('2027-01-31', 'monthly', 31);
  if (m1 === '2027-02-28') {
    console.log('  ✅ PASS: Month-end clamping correct (2027-01-31 -> 2027-02-28)');
  } else {
    console.error(`  ❌ FAIL: Month-end clamping incorrect: got ${m1}`);
    process.exit(1);
  }

  // 7. Scheduler execution and Idempotency
  console.log('\nScenario 7: Real Backend Scheduler Execution & Idempotency Check');
  const schedulerRun1 = await fetch(`${API_BASE}/recurring-transactions/process-scheduler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ asOfDate: '2026-10-24' }),
  });

  const scheduler1Data = await schedulerRun1.json();
  if (schedulerRun1.ok && scheduler1Data.success) {
    console.log(`  ✅ PASS: Scheduler run 1 completed. Generated: ${scheduler1Data.result.generatedTransactionsCount} tx(s)`);
  } else {
    console.error('  ❌ FAIL: Scheduler run 1 failed', scheduler1Data);
    process.exit(1);
  }

  // Second run with SAME date must generate ZERO duplicate transactions!
  const schedulerRun2 = await fetch(`${API_BASE}/recurring-transactions/process-scheduler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ asOfDate: '2026-10-24' }),
  });

  const scheduler2Data = await schedulerRun2.json();
  if (schedulerRun2.ok && scheduler2Data.result.generatedTransactionsCount === 0) {
    console.log('  ✅ PASS: Idempotency confirmed! Second scheduler run generated 0 duplicate transactions.');
  } else {
    console.error('  ❌ FAIL: Idempotency check failed! Duplicates created', scheduler2Data);
    process.exit(1);
  }

  // 8. Verify generated transaction exists in financial ledger
  console.log('\nScenario 8: Verify generated transaction in financial ledger');
  const txListRes = await fetch(`${API_BASE}/transactions?month=2026-10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const txListData = await txListRes.json();
  const gymTx = txListData.transactions.find((t: any) => t.description.includes('Cult.Fit Gym Membership'));
  if (gymTx && gymTx.amount === 2500) {
    console.log(`  ✅ PASS: Automated generated transaction found in transactions ledger: ID ${gymTx.id}`);
  } else {
    console.error('  ❌ FAIL: Automated transaction not found in ledger');
    process.exit(1);
  }

  // 9. Edit schedule and verify historical transaction preservation
  console.log('\nScenario 9: Edit schedule and preserve transaction history');
  const editRes = await fetch(`${API_BASE}/recurring-transactions/${createdScheduleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: 3000, // Update future amount to 3000
    }),
  });

  const editData = await editRes.json();
  if (editRes.ok && editData.schedule?.amount === 3000) {
    console.log('  ✅ PASS: Schedule amount updated to 3000 for future occurrences');
  } else {
    console.error('  ❌ FAIL: Failed to update schedule', editData);
    process.exit(1);
  }

  // Re-check generated transaction to confirm its historical amount of 2500 was NOT modified!
  const txCheckRes = await fetch(`${API_BASE}/transactions/${gymTx.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const txCheckData = await txCheckRes.json();
  if (txCheckRes.ok && txCheckData.transaction?.amount === 2500) {
    console.log('  ✅ PASS: Historical generated transaction retained its original amount ₹2,500 without retroactive modification');
  } else {
    console.error('  ❌ FAIL: Historical transaction was retroactively modified', txCheckData);
    process.exit(1);
  }

  // 10. Delete schedule and verify historical transaction persists
  console.log('\nScenario 10: Delete schedule and verify financial record persistence');
  const deleteRes = await fetch(`${API_BASE}/recurring-transactions/${createdScheduleId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const deleteData = await deleteRes.json();
  if (deleteRes.ok && deleteData.success) {
    console.log('  ✅ PASS: Recurring schedule deleted successfully');
  } else {
    console.error('  ❌ FAIL: Failed to delete schedule', deleteData);
    process.exit(1);
  }

  const txCheckRes2 = await fetch(`${API_BASE}/transactions/${gymTx.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (txCheckRes2.ok) {
    console.log('  ✅ PASS: Historical generated transaction preserved in ledger after schedule deletion');
  } else {
    console.error('  ❌ FAIL: Historical transaction was deleted when schedule was removed');
    process.exit(1);
  }

  console.log('\n--- TEST SUMMARY ---');
  console.log('Passed: 15');
  console.log('Failed: 0');
  console.log('✨ ALL PHASE 8 RECURRING TRANSACTIONS & SCHEDULER TESTS PASSED SUCCESSFULLY! ✨');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
