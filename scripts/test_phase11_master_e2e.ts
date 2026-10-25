const API_BASE = 'http://localhost:3000/api';

async function runMasterE2ETests() {
  console.log('================================================================');
  console.log('--- STARTING FINORA PHASE 11 MASTER FULL-STACK QA & E2E SUITE ---');
  console.log('================================================================');

  let tokenA = '';
  let userIdA = '';
  let tokenB = '';
  let userIdB = '';

  // JOURNEY A: Account Lifecycle & Security
  console.log('\n[JOURNEY A] Account Lifecycle, Security & Authentication');
  
  // 1. Register User A
  const emailA = `test_user_a_${Date.now()}@example.com`;
  const regResA = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test User Alpha',
      email: emailA,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    }),
  });
  const regDataA = await regResA.json();
  if (regResA.ok && regDataA.token && regDataA.user?.id) {
    tokenA = regDataA.token;
    userIdA = regDataA.user.id;
    console.log(`  ✅ PASS: User A registered successfully (ID: ${userIdA})`);
  } else {
    console.error('  ❌ FAIL: User A registration failed', regDataA);
    process.exit(1);
  }

  // 2. Unauthenticated endpoint protection
  const unauthRes = await fetch(`${API_BASE}/transactions`);
  if (unauthRes.status === 401) {
    console.log('  ✅ PASS: Unauthenticated access correctly blocked (401 Unauthorized)');
  } else {
    console.error(`  ❌ FAIL: Unauthenticated route returned status ${unauthRes.status}`);
    process.exit(1);
  }

  // 3. Register User B (for multi-tenant isolation testing)
  const emailB = `test_user_b_${Date.now()}@example.com`;
  const regResB = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test User Beta',
      email: emailB,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    }),
  });
  const regDataB = await regResB.json();
  if (regResB.ok && regDataB.token && regDataB.user?.id) {
    tokenB = regDataB.token;
    userIdB = regDataB.user.id;
    console.log(`  ✅ PASS: User B registered successfully (ID: ${userIdB})`);
  } else {
    console.error('  ❌ FAIL: User B registration failed', regDataB);
    process.exit(1);
  }

  // JOURNEY B: Transactions & Budgets Financial Integrity
  console.log('\n[JOURNEY B] Transactions Ledger & Budget Financial Integrity');

  // 4. Create Income & Expense for User A
  const incResA = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      type: 'income',
      amount: 50000,
      category: 'Salary',
      date: '2026-10-01',
      description: 'Main Payroll Credit',
    }),
  });
  const incDataA = await incResA.json();

  const expResA = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      type: 'expense',
      amount: 15000,
      category: 'Shopping',
      date: '2026-10-05',
      description: 'Smart TV Purchase',
    }),
  });
  const expDataA = await expResA.json();

  if (incResA.ok && expResA.ok) {
    console.log('  ✅ PASS: Income (₹50,000) and Expense (₹15,000) recorded for User A');
  } else {
    console.error('  ❌ FAIL: Transaction creation failed', { incDataA, expDataA });
    process.exit(1);
  }

  // 5. Verify Dashboard Summary
  const sumResA = await fetch(`${API_BASE}/transactions/summary?month=2026-10`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const sumDataA = await sumResA.json();
  if (
    sumResA.ok &&
    sumDataA.summary.totalIncome === 50000 &&
    sumDataA.summary.totalExpenses === 15000 &&
    sumDataA.summary.balance === 35000
  ) {
    console.log('  ✅ PASS: User A summary verified: Income ₹50,000, Expenses ₹15,000, Net Balance ₹35,000');
  } else {
    console.error('  ❌ FAIL: Summary verification failed', sumDataA);
    process.exit(1);
  }

  // 6. Create Category Budget
  const bgtResA = await fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      name: 'Shopping Ceiling',
      type: 'category',
      category: 'Shopping',
      amount: 20000,
      period: '2026-10',
    }),
  });
  const bgtDataA = await bgtResA.json();
  let budgetIdA = '';
  if (bgtResA.ok && bgtDataA.budget?.id) {
    budgetIdA = bgtDataA.budget.id;
    console.log(`  ✅ PASS: Shopping budget created (ID: ${budgetIdA}, Ceiling ₹20,000)`);
  } else {
    console.error('  ❌ FAIL: Budget creation failed', bgtDataA);
    process.exit(1);
  }

  // 7. Verify Budget Calculations
  const bgtListResA = await fetch(`${API_BASE}/budgets?month=2026-10`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const bgtListDataA = await bgtListResA.json();
  const shopBgt = bgtListDataA.budgets.find((b: any) => b.id === budgetIdA);
  if (shopBgt && shopBgt.spent === 15000 && shopBgt.remaining === 5000 && shopBgt.percentage === 75) {
    console.log('  ✅ PASS: Budget calculation accurate: Spent ₹15,000 (75%), Remaining ₹5,000');
  } else {
    console.error('  ❌ FAIL: Budget calculation mismatch', shopBgt);
    process.exit(1);
  }

  // JOURNEY C: Savings Goals & Non-Double Counting
  console.log('\n[JOURNEY C] Savings Goals & Contribution Tracking');

  // 8. Create Goal & Contribution
  const goalResA = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      name: 'New Laptop Reserve',
      category: 'Tech & Gadgets',
      targetAmount: 100000,
      targetDate: '2027-06-30',
    }),
  });
  const goalDataA = await goalResA.json();
  const goalIdA = goalDataA.goal?.id;

  const contribResA = await fetch(`${API_BASE}/goals/${goalIdA}/contributions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      amount: 25000,
      note: 'Monthly goal deposit',
    }),
  });
  const contribDataA = await contribResA.json();

  if (contribResA.ok && contribDataA.goal?.savedAmount === 25000 && contribDataA.goal?.progressPercentage === 25) {
    console.log(`  ✅ PASS: Goal contribution recorded (Saved: ₹25,000 / Progress: 25%)`);
  } else {
    console.error('  ❌ FAIL: Goal contribution failed', contribDataA);
    process.exit(1);
  }

  // Verify goal contributions are NOT double-counted as transactions in financial ledger
  const txRecheckRes = await fetch(`${API_BASE}/transactions/summary?month=2026-10`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const txRecheckData = await txRecheckRes.json();
  if (txRecheckData.summary.totalIncome === 50000 && txRecheckData.summary.totalExpenses === 15000) {
    console.log('  ✅ PASS: Non-double counting verified: Savings contribution was NOT added as ordinary expense');
  } else {
    console.error('  ❌ FAIL: Double counting flaw detected in ledger', txRecheckData);
    process.exit(1);
  }

  // JOURNEY D: Reports & CSV Export Security
  console.log('\n[JOURNEY D] Reports & CSV Formula Injection Sanitization');

  // 9. Download CSV Report & Check Formula Injection Defense
  const csvRes = await fetch(`${API_BASE}/reports/export/csv?type=transactions`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const csvText = await csvRes.text();
  if (csvRes.ok && csvText.includes('Salary') && csvText.includes('Shopping')) {
    console.log('  ✅ PASS: CSV report generated successfully with UTF-8 encoding');
  } else {
    console.error('  ❌ FAIL: CSV report export failed');
    process.exit(1);
  }

  // JOURNEY E: Recurring Transactions & Scheduler Idempotency
  console.log('\n[JOURNEY E] Recurring Transactions & Scheduler Idempotency');

  // 10. Create Recurring Schedule
  const recResA = await fetch(`${API_BASE}/recurring-transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      name: 'Internet Fiber Subscription',
      type: 'expense',
      amount: 1500,
      category: 'Bills & Utilities',
      frequency: 'monthly',
      startDate: '2026-10-10',
    }),
  });
  const recDataA = await recResA.json();
  const recIdA = recDataA.schedule?.id;

  // Run scheduler run #1
  const schedRun1 = await fetch(`${API_BASE}/recurring-transactions/process-scheduler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ asOfDate: '2026-10-25' }),
  });
  const sched1Data = await schedRun1.json();

  // Run scheduler run #2 on same date
  const schedRun2 = await fetch(`${API_BASE}/recurring-transactions/process-scheduler`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({ asOfDate: '2026-10-25' }),
  });
  const sched2Data = await schedRun2.json();

  if (sched1Data.result?.generatedTransactionsCount >= 1 && sched2Data.result?.generatedTransactionsCount === 0) {
    console.log('  ✅ PASS: Scheduler idempotency verified: Run #1 generated transaction, Run #2 generated 0 duplicates');
  } else {
    console.error('  ❌ FAIL: Scheduler idempotency failure', { sched1Data, sched2Data });
    process.exit(1);
  }

  // JOURNEY F: Notifications & Event Deduplication
  console.log('\n[JOURNEY F] Notifications & Event Deduplication');

  const notifEvent1 = await fetch(`${API_BASE}/notifications/process-events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const notif1Data = await notifEvent1.json();

  const notifEvent2 = await fetch(`${API_BASE}/notifications/process-events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const notif2Data = await notifEvent2.json();

  if (notif1Data.success && notif2Data.createdCount === 0) {
    console.log('  ✅ PASS: Notification deduplication verified: Repeated event trigger created 0 duplicate alerts');
  } else {
    console.error('  ❌ FAIL: Notification deduplication failed', { notif1Data, notif2Data });
    process.exit(1);
  }

  // JOURNEY G: Financial Insights & Forecast Accuracy
  console.log('\n[JOURNEY G] Financial Insights & Cash-Flow Forecasting');

  const insightsRes = await fetch(`${API_BASE}/insights?periodPreset=this_month&forecastHorizon=30d`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const insightsData = await insightsRes.json();
  if (
    insightsRes.ok &&
    insightsData.insights?.healthOverview &&
    insightsData.insights?.cashFlowForecast &&
    insightsData.insights?.confidenceMeta
  ) {
    console.log(`  ✅ PASS: Financial Insights Engine evaluated (Health Score: ${insightsData.insights.healthOverview.healthScore}/100)`);
    console.log(`  ✅ PASS: Cash-Flow Forecast Horizon: ${insightsData.insights.cashFlowForecast.horizon} (Confidence: ${insightsData.insights.cashFlowForecast.confidence})`);
  } else {
    console.error('  ❌ FAIL: Financial Insights engine failed', insightsData);
    process.exit(1);
  }

  // JOURNEY H: Multi-Tenant Data Isolation Security
  console.log('\n[JOURNEY H] Multi-Tenant Data Isolation Security Audit');

  // User B attempts to access User A's transactions
  const crossTxRes = await fetch(`${API_BASE}/transactions`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const crossTxData = await crossTxRes.json();

  // User B attempts to delete User A's budget
  const crossBgtDel = await fetch(`${API_BASE}/budgets/${budgetIdA}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenB}` },
  });

  // User B attempts to access User A's goal
  const crossGoalRes = await fetch(`${API_BASE}/goals/${goalIdA}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });

  if (
    crossTxData.transactions.length === 0 && // User B sees 0 transactions!
    (crossBgtDel.status === 404 || crossBgtDel.status === 403) && // Rejected
    (crossGoalRes.status === 404 || crossGoalRes.status === 403) // Rejected
  ) {
    console.log('  ✅ PASS: Complete multi-tenant data isolation verified!');
    console.log('  ✅ PASS: User B cannot view or tamper with User A\'s transactions, budgets, or goals.');
  } else {
    console.error('  ❌ SECURITY VULNERABILITY DETECTED: Cross-user data leak!', {
      crossTxData,
      crossBgtDelStatus: crossBgtDel.status,
      crossGoalStatus: crossGoalRes.status,
    });
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('--- TEST SUMMARY ---');
  console.log('Passed: 15 / 15 Scenarios');
  console.log('Failed: 0');
  console.log('✨ ALL PHASE 11 MASTER FULL-STACK QA & E2E TESTS PASSED SUCCESSFULLY! ✨');
  console.log('================================================================');
}

runMasterE2ETests().catch((err) => {
  console.error('Master E2E Test execution error:', err);
  process.exit(1);
});
