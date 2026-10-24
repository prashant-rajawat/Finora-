/**
 * Comprehensive Automated Verification Script for Finora Phase 6: Reports, Financial Statements & CSV/PDF Export System
 * Verifies all report types, date filtering presets, summary calculations, CSV export generation,
 * formula injection prevention, security, and regression tests.
 */

async function runTests() {
  const baseUrl = 'http://127.0.0.1:3000';
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  console.log('\n--- STARTING FINORA PHASE 6 REPORTS & EXPORT VERIFICATION SUITE ---\n');

  // Test 1: Authenticate with demo user Ansh Kumar
  console.log('Scenario 1: Authenticate with seeded user Ansh Kumar');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ansh@example.com', password: 'password123' }),
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200 && !!loginData.token, 'Login successful and JWT returned');
  const token = loginData.token;

  // Test 2: Reports API Authorization & Protection
  console.log('\nScenario 2: Reports API requires authentication');
  const unauthRes = await fetch(`${baseUrl}/api/reports/summary`);
  assert(unauthRes.status === 401, 'Unauthenticated report request correctly rejected with 401 Unauthorized');

  // Test 3: Fetch Report Summary for This Month (October 2026)
  console.log('\nScenario 3: Fetch Financial Report Summary for This Month');
  const summaryRes = await fetch(`${baseUrl}/api/reports/summary?period=this_month`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const summaryJson = await summaryRes.json();
  assert(summaryRes.status === 200 && summaryJson.success === true, 'Report summary endpoint returns 200 OK');
  assert(!!summaryJson.report.analytics, 'Analytics section present in report summary');
  assert(summaryJson.report.analytics.summary.totalIncome === 45000, `Total Income is ₹45,000 (Actual: ₹${summaryJson.report.analytics.summary.totalIncome})`);
  assert(summaryJson.report.analytics.summary.totalExpenses >= 28450, `Total Expenses is verified (Actual: ₹${summaryJson.report.analytics.summary.totalExpenses})`);

  // Test 4: Fetch Filtered Transaction Report
  console.log('\nScenario 4: Fetch Filtered Transaction Report API');
  const txReportRes = await fetch(`${baseUrl}/api/reports/transactions?startDate=2026-10-01&endDate=2026-10-31`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const txReportJson = await txReportRes.json();
  assert(txReportRes.status === 200 && txReportJson.success === true, 'Transaction report endpoint returns 200 OK');
  assert(txReportJson.transactions.length >= 12, `Transactions list populated (${txReportJson.transactions.length} records)`);
  assert(txReportJson.totalIncome === 45000, 'Report income total matches (₹45,000)');

  // Test 5: CSV Export - Transaction Report
  console.log('\nScenario 5: Generate and verify CSV Export for Transactions');
  const csvTxRes = await fetch(`${baseUrl}/api/reports/export/csv?type=transactions&startDate=2026-10-01&endDate=2026-10-31`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const csvTxText = await csvTxRes.text();
  assert(csvTxRes.status === 200, 'CSV transaction export returns 200 OK');
  assert(csvTxRes.headers.get('content-type')?.includes('text/csv') === true, 'Content-Type is text/csv');
  assert(csvTxText.includes('ID,Date,Type,Category') || csvTxText.includes('Date,Type,Category'), 'CSV contains correct header columns');
  assert(csvTxText.includes('Salary') && csvTxText.includes('Zomato'), 'CSV contains actual transaction records');

  // Test 6: CSV Export - Budget Performance Report
  console.log('\nScenario 6: Generate CSV Export for Budget Performance');
  const csvBudgetRes = await fetch(`${baseUrl}/api/reports/export/csv?type=budgets&startDate=2026-10-01`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const csvBudgetText = await csvBudgetRes.text();
  assert(csvBudgetRes.status === 200, 'CSV budget export returns 200 OK');
  assert(csvBudgetText.includes('Budget Name') && csvBudgetText.includes('Allocated'), 'Budget CSV contains correct header columns');
  assert(csvBudgetText.includes('Food & Dining Budget'), 'Budget CSV contains user budget records');

  // Test 7: CSV Export - Savings Goals Report
  console.log('\nScenario 7: Generate CSV Export for Savings Goals');
  const csvGoalRes = await fetch(`${baseUrl}/api/reports/export/csv?type=goals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const csvGoalText = await csvGoalRes.text();
  assert(csvGoalRes.status === 200, 'CSV goals export returns 200 OK');
  assert(csvGoalText.includes('Goal Name') && csvGoalText.includes('Target Amount'), 'Goals CSV contains correct header columns');
  assert(csvGoalText.includes('Emergency Safety Net'), 'Goals CSV contains user goal records');

  // Test 8: Formula Injection Safety Check in CSV
  console.log('\nScenario 8: Formula injection prevention in CSV export');
  const maliciousTxRes = await fetch(`${baseUrl}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      type: 'expense',
      amount: 100,
      category: 'Others',
      date: '2026-10-20',
      description: '=SUM(999+999)',
    }),
  });
  assert(maliciousTxRes.status === 201, 'Test transaction with potential formula injection created');

  const csvInjectedRes = await fetch(`${baseUrl}/api/reports/export/csv?type=transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const csvInjectedText = await csvInjectedRes.text();
  assert(csvInjectedRes.status === 200, 'Export with malicious description succeeds');
  assert(!csvInjectedText.includes(',"=SUM'), 'Unescaped formula injection not present in CSV output');

  console.log(`\n--- TEST SUMMARY ---`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n✨ ALL PHASE 6 REPORTS & EXPORT TESTS PASSED SUCCESSFULLY! ✨\n');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test runner execution error:', err);
  process.exit(1);
});
