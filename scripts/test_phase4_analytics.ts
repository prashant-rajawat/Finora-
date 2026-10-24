/**
 * Comprehensive Automated Verification Script for Finora Phase 4: Financial Analytics
 * Tests all 20 verification scenarios across authentication, metrics, zero-division safety,
 * time-series aggregation, category breakdown, comparison deltas, trends, and deterministic insights.
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

  console.log('\n--- STARTING FINORA PHASE 4 VERIFICATION SUITE ---\n');

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

  // Test 2: Analytics API requires authentication
  console.log('\nScenario 2: Analytics API security & authorization');
  const unauthRes = await fetch(`${baseUrl}/api/analytics`);
  assert(unauthRes.status === 401, 'Unauthenticated request correctly rejected with 401 Unauthorized');

  // Test 3: Fetch Default 'this_month' Analytics
  console.log('\nScenario 3: Default "this_month" Analytics Data for Ansh Kumar (October 2026)');
  const thisMonthRes = await fetch(`${baseUrl}/api/analytics?period=this_month`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const thisMonthJson = await thisMonthRes.json();
  assert(thisMonthRes.status === 200 && thisMonthJson.success === true, 'Analytics endpoint returns 200 OK');
  const an = thisMonthJson.analytics;

  // Test 4: Financial Summary Metric Accuracy
  console.log('\nScenario 4: Mathematical Accuracy of Financial Summary Cards');
  assert(an.summary.totalIncome === 45000, `Total Income is exactly ₹45,000 (Actual: ₹${an.summary.totalIncome})`);
  assert(an.summary.totalExpenses === 28450, `Total Expenses is exactly ₹28,450 (Actual: ₹${an.summary.totalExpenses})`);
  assert(an.summary.netCashFlow === 16550, `Net Cash Flow is exactly ₹16,550 (Surplus) (Actual: ₹${an.summary.netCashFlow})`);
  assert(an.summary.savingsRate === 36.8, `Savings Rate is precisely 36.8% ((45000-28450)/45000*100) (Actual: ${an.summary.savingsRate}%)`);
  assert(an.summary.avgDailySpend === 917.74, `Average Daily Spend is precisely ₹917.74/day (28450/31) (Actual: ₹${an.summary.avgDailySpend})`);
  assert(an.summary.daysInPeriod === 31, `Days in period correctly calculated as 31 for October (Actual: ${an.summary.daysInPeriod})`);
  assert(an.summary.transactionCount === 12, `Transaction count is 12 (Actual: ${an.summary.transactionCount})`);
  assert(an.summary.incomeCount === 2, `Income transactions count is 2 (Actual: ${an.summary.incomeCount})`);
  assert(an.summary.expenseCount === 10, `Expense transactions count is 10 (Actual: ${an.summary.expenseCount})`);

  // Test 5: Category Breakdown Accuracy (Expenses ONLY)
  console.log('\nScenario 5: Category Breakdown Exclusivity & Percentage Accuracy');
  const cats = an.categoryBreakdown;
  assert(cats.length > 0, `Category breakdown has ${cats.length} categories`);
  const hasIncomeInExpenses = cats.some((c: any) => c.category === 'Salary' || c.category === 'Freelance');
  assert(!hasIncomeInExpenses, 'Income categories (Salary/Freelance) are STRICTLY EXCLUDED from expense breakdown');
  
  const sumCatAmounts = Math.round(cats.reduce((acc: number, c: any) => acc + c.amount, 0));
  assert(sumCatAmounts === 28450, `Sum of category expense amounts strictly equals total expenses ₹28,450 (Actual: ₹${sumCatAmounts})`);

  // Check top category
  assert(cats[0].category === 'Food & Dining', `Top category is Food & Dining (Actual: ${cats[0].category})`);
  assert(cats[0].amount === 9104, `Food & Dining amount is ₹9,104 (450 + 8654) (Actual: ₹${cats[0].amount})`);
  assert(cats[0].percentage === 32, `Food & Dining percentage is 32.0% (Actual: ${cats[0].percentage}%)`);

  // Test 6: Time-Series Grouping for <= 31 days (Daily intervals)
  console.log('\nScenario 6: Time-Series Grouping for Monthly Presets (Daily Points)');
  const ts = an.timeSeries;
  assert(ts.length === 31, `Monthly preset generates daily points for all 31 days of October (Actual: ${ts.length})`);
  const oct1 = ts.find((p: any) => p.date === '2026-10-01');
  assert(oct1 && oct1.income === 40000, `Oct 1 correctly records ₹40,000 salary inflow (Actual: ₹${oct1?.income})`);

  // Test 7: Multi-Month Time Series Aggregation (Weekly for Last 3 Months)
  console.log('\nScenario 7: Multi-Month Aggregation: Last 3 Months (Weekly Chunks)');
  const last3MRes = await fetch(`${baseUrl}/api/analytics?period=last_3_months`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const last3MJson = await last3MRes.json();
  const ts3M = last3MJson.analytics.timeSeries;
  assert(ts3M.length > 0 && ts3M[0].label.startsWith('W1'), `Last 3 Months grouped into weekly chunks (e.g. ${ts3M[0].label})`);

  // Test 8: Multi-Month Time Series Aggregation (Monthly for Last 6 Months and This Year)
  console.log('\nScenario 8: Multi-Month Aggregation: This Year (Monthly Chunks)');
  const yearRes = await fetch(`${baseUrl}/api/analytics?period=this_year`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const yearJson = await yearRes.json();
  const tsYear = yearJson.analytics.timeSeries;
  assert(tsYear.length === 12, `This Year preset generates 12 monthly data points (Actual: ${tsYear.length})`);
  const octYear = tsYear.find((p: any) => p.key === '2026-10');
  assert(octYear && octYear.income === 45000 && octYear.expenses === 28450, 'October data point in yearly view aggregates correctly');

  // Test 9: Period Comparison & Deltas
  console.log('\nScenario 9: Period Comparison & Favorable Flags');
  const comp = an.comparison;
  assert(!!comp.current && !!comp.previous && !!comp.deltas, 'Comparison structure includes current, previous, and deltas');
  assert(comp.current.income === 45000, `Comparison current income is ₹45,000`);
  assert(typeof comp.deltas.expenses.isFavorable === 'boolean', 'Favorable boolean flag is calculated for expense delta');

  // Test 10: Spending Trends & Peak Outflow Day
  console.log('\nScenario 10: Spending Trends & Peak Outflow Day');
  const trends = an.spendingTrends;
  assert(!!trends.trajectory, `Trajectory computed as '${trends.trajectory}'`);
  assert(trends.peakSpendDay !== null, 'Peak spending day identified');
  assert(trends.peakSpendDay.amount > 0, `Peak day amount is ₹${trends.peakSpendDay.amount} on ${trends.peakSpendDay.formattedDate}`);
  assert(trends.topCategory?.name === 'Food & Dining', `Top category identified in trends: ${trends.topCategory?.name}`);

  // Test 11: Budget Compliance Integration (Phase 3 Budget Sync)
  console.log('\nScenario 11: Budget Compliance Analytics Integration');
  const bp = an.budgetPerformance;
  assert(bp.budgetCount === 5, `Total budgets active: ${bp.budgetCount} (Actual: ${bp.budgetCount})`);
  assert(bp.totalAllocated === 32000, `Overall budget allocation is ₹32,000 (Actual: ₹${bp.totalAllocated})`);
  assert(bp.totalSpent === 28450, `Total budget spent is ₹28,450 (Actual: ₹${bp.totalSpent})`);
  assert(bp.utilizationPercentage === 88.9, `Budget utilization is 88.9% (Actual: ${bp.utilizationPercentage}%)`);

  // Test 12: Deterministic Smart Financial Insights
  console.log('\nScenario 12: Deterministic Smart Financial Insights');
  const insights = an.smartInsights;
  assert(insights.length > 0, `Generated ${insights.length} deterministic smart insights`);
  const hasSavingsInsight = insights.some((i: any) => i.id === 'ins_high_savings' || i.title.includes('Savings'));
  assert(hasSavingsInsight, 'Positive savings insight generated for 36.8% savings rate');
  const hasSurplusInsight = insights.some((i: any) => i.id === 'ins_surplus');
  assert(hasSurplusInsight, 'Cash flow surplus insight generated for positive net balance');
  const hasConcentrationInsight = insights.some((i: any) => i.id === 'ins_concentration');
  assert(hasConcentrationInsight, 'Category concentration insight generated for Food & Dining (32%)');

  // Test 13: Top Expenses List
  console.log('\nScenario 13: Top Ranked Expenses List');
  const topExpenses = an.topExpenses;
  assert(topExpenses.length > 0 && topExpenses.length <= 8, `Top expenses list has ${topExpenses.length} items (up to 8)`);
  assert(topExpenses[0].amount === 8654, `Top single expense is Groceries & Dining for ₹8,654 (Actual: ₹${topExpenses[0].amount})`);
  assert(topExpenses[0].percentageOfTotal === 30.4, `Top expense is 30.4% of total period expenses (Actual: ${topExpenses[0].percentageOfTotal}%)`);
  // Ensure descending sort
  let isSorted = true;
  for (let i = 1; i < topExpenses.length; i++) {
    if (topExpenses[i].amount > topExpenses[i - 1].amount) isSorted = false;
  }
  assert(isSorted, 'Top expenses are strictly sorted descending by amount');

  // Test 14: Custom Date Range Query
  console.log('\nScenario 14: Custom Date Range Query');
  const customRes = await fetch(`${baseUrl}/api/analytics?period=custom&startDate=2026-10-01&endDate=2026-10-10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const customJson = await customRes.json();
  assert(customRes.status === 200, 'Custom date range query returns 200 OK');
  assert(customJson.analytics.summary.daysInPeriod === 10, 'Custom period accurately computes 10 days');
  assert(customJson.analytics.timeSeries.length === 10, 'Custom 10-day period outputs 10 daily points');

  // Test 15: Invalid Date Range Validation
  console.log('\nScenario 15: Invalid Date Range Validation');
  const invalidRes = await fetch(`${baseUrl}/api/analytics?startDate=2026-10-20&endDate=2026-10-10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(invalidRes.status === 400, 'Inverted dates (start > end) correctly rejected with 400 Bad Request');

  const malformedRes = await fetch(`${baseUrl}/api/analytics?startDate=invalid-date`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(malformedRes.status === 400, 'Malformed date format rejected with 400 Bad Request');

  // Test 16: Zero-Division Safety & Empty Account Handling
  console.log('\nScenario 16: Zero-Division Safety with Fresh / Empty User Account');
  const testEmail = `newuser_analytics_${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Vikram Mehta',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
    }),
  });
  const regJson = await regRes.json();
  const newUserToken = regJson.token;
  assert(regRes.status === 201 && !!newUserToken, 'New user successfully registered');

  const emptyAnalyticsRes = await fetch(`${baseUrl}/api/analytics?period=this_month`, {
    headers: { Authorization: `Bearer ${newUserToken}` },
  });
  const emptyJson = await emptyAnalyticsRes.json();
  assert(emptyAnalyticsRes.status === 200, 'Fresh account analytics returns 200 OK without errors');
  const emptyAn = emptyJson.analytics;
  assert(emptyAn.summary.totalIncome === 0, 'Empty account has totalIncome = 0');
  assert(emptyAn.summary.totalExpenses === 0, 'Empty account has totalExpenses = 0');
  assert(emptyAn.summary.netCashFlow === 0, 'Empty account has netCashFlow = 0');
  assert(emptyAn.summary.savingsRate === null, 'Empty account has savingsRate = null (Safely avoids 0/0 NaN% or Infinity%)');
  assert(emptyAn.summary.avgDailySpend === 0, 'Empty account has avgDailySpend = 0');
  assert(emptyAn.categoryBreakdown.length === 0, 'Empty account has empty categoryBreakdown');
  assert(emptyAn.topExpenses.length === 0, 'Empty account has empty topExpenses');
  const emptyInsight = emptyAn.smartInsights.find((i: any) => i.id === 'ins_no_tx');
  assert(!!emptyInsight, 'Empty account receives helpful "No Data for This Timeframe" insight');

  // Test 17: User Logging Only Expense (Zero Income Handling)
  console.log('\nScenario 17: Account with Only Expenses (Zero Income Division Check)');
  await fetch(`${baseUrl}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newUserToken}`,
    },
    body: JSON.stringify({
      type: 'expense',
      amount: 1500,
      category: 'Shopping',
      date: '2026-10-15',
      description: 'Shoes purchase',
    }),
  });

  const zeroIncRes = await fetch(`${baseUrl}/api/analytics?period=this_month`, {
    headers: { Authorization: `Bearer ${newUserToken}` },
  });
  const zeroIncJson = await zeroIncRes.json();
  const zeroIncAn = zeroIncJson.analytics;
  assert(zeroIncAn.summary.totalIncome === 0, 'Total income is 0');
  assert(zeroIncAn.summary.totalExpenses === 1500, 'Total expenses is ₹1,500');
  assert(zeroIncAn.summary.netCashFlow === -1500, 'Net cash flow is -₹1,500 (Deficit)');
  assert(zeroIncAn.summary.savingsRate === null, 'Savings rate is null when income is 0 (No division by zero)');
  assert(zeroIncAn.categoryBreakdown.length === 1, 'Category breakdown contains 1 category (Shopping 100%)');
  assert(zeroIncAn.categoryBreakdown[0].percentage === 100, 'Shopping is 100% of expenses');
  const zeroIncInsight = zeroIncAn.smartInsights.find((i: any) => i.id === 'ins_zero_inc');
  assert(!!zeroIncInsight, 'Zero income insight generated explaining expenses logged without income');

  // Test 18: User with Deficit (Expenses > Income)
  console.log('\nScenario 18: Account with Deficit (Expenses > Income)');
  await fetch(`${baseUrl}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newUserToken}`,
    },
    body: JSON.stringify({
      type: 'income',
      amount: 1000,
      category: 'Freelance',
      date: '2026-10-10',
      description: 'Small gig',
    }),
  });

  const deficitRes = await fetch(`${baseUrl}/api/analytics?period=this_month`, {
    headers: { Authorization: `Bearer ${newUserToken}` },
  });
  const deficitJson = await deficitRes.json();
  const deficitAn = deficitJson.analytics;
  assert(deficitAn.summary.totalIncome === 1000, 'Income is ₹1,000');
  assert(deficitAn.summary.totalExpenses === 1500, 'Expenses is ₹1,500');
  assert(deficitAn.summary.netCashFlow === -500, 'Net cash flow is -₹500 (Deficit)');
  // Savings rate: ((1000 - 1500) / 1000) * 100 = -50%
  assert(deficitAn.summary.savingsRate === -50, `Negative savings rate is mathematically -50% (Actual: ${deficitAn.summary.savingsRate}%)`);
  const deficitInsight = deficitAn.smartInsights.find((i: any) => i.id === 'ins_deficit');
  assert(!!deficitInsight, 'Deficit warning insight triggered for negative net cash flow');

  // Test 19: Prior Data Preservation
  console.log('\nScenario 19: Verify Persistence & Original Data Preservation');
  const verifyRes = await fetch(`${baseUrl}/api/analytics?period=this_month`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const verifyJson = await verifyRes.json();
  assert(verifyJson.analytics.summary.totalIncome === 45000, 'Original Ansh Kumar income intact (₹45,000)');
  assert(verifyJson.analytics.summary.totalExpenses === 28450, 'Original Ansh Kumar expenses intact (₹28,450)');

  // Test 20: Performance Check
  console.log('\nScenario 20: API Response Time & Scalability');
  const t0 = Date.now();
  await fetch(`${baseUrl}/api/analytics?period=this_year`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const elapsed = Date.now() - t0;
  assert(elapsed < 200, `Yearly analytics computed and returned in ${elapsed}ms (< 200ms)`);

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
