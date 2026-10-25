const API_BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- STARTING FINORA PHASE 10 FINANCIAL INSIGHTS & PLANNING SUITE ---');

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
  const unauthRes = await fetch(`${API_BASE}/insights`);
  if (unauthRes.status === 401) {
    console.log('  ✅ PASS: Unauthenticated insights request correctly rejected with 401');
  } else {
    console.error(`  ❌ FAIL: Unauthenticated request returned status ${unauthRes.status}`);
    process.exit(1);
  }

  // 3. Fetch Full Insights Payload
  console.log('\nScenario 3: Fetch composite financial insights payload');
  const insightsRes = await fetch(`${API_BASE}/insights?periodPreset=this_month&forecastHorizon=30d`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const insightsData = await insightsRes.json();
  if (insightsRes.ok && insightsData.success && insightsData.insights) {
    console.log('  ✅ PASS: Full insights payload retrieved successfully');
  } else {
    console.error('  ❌ FAIL: Failed to retrieve insights payload', insightsData);
    process.exit(1);
  }

  const { insights } = insightsData;

  // 4. Verify Financial Health Overview Metrics
  console.log('\nScenario 4: Verify Financial Health Overview metrics');
  const { healthOverview } = insights;
  if (
    typeof healthOverview.totalIncome === 'number' &&
    typeof healthOverview.totalExpenses === 'number' &&
    typeof healthOverview.healthScore === 'number' &&
    healthOverview.netCashFlow === healthOverview.totalIncome - healthOverview.totalExpenses
  ) {
    console.log(`  ✅ PASS: Health Score: ${healthOverview.healthScore}/100 (${healthOverview.healthScoreLabel})`);
    console.log(`  ✅ PASS: Net Cash Flow verified: ₹${healthOverview.netCashFlow.toLocaleString('en-IN')}`);
    console.log(`  ✅ PASS: Essential: ₹${healthOverview.essentialSpending}, Discretionary: ₹${healthOverview.discretionarySpending}`);
  } else {
    console.error('  ❌ FAIL: Health Overview calculations mismatch', healthOverview);
    process.exit(1);
  }

  // 5. Test Cash-Flow Forecast (30d Horizon)
  console.log('\nScenario 5: Test Cash-Flow Forecast for 30d horizon');
  const { cashFlowForecast } = insights;
  if (
    cashFlowForecast.horizon === '30d' &&
    typeof cashFlowForecast.estimatedIncome === 'number' &&
    typeof cashFlowForecast.estimatedExpenses === 'number' &&
    Array.isArray(cashFlowForecast.forecastPoints)
  ) {
    console.log(`  ✅ PASS: 30d Est Income: ₹${cashFlowForecast.estimatedIncome}, Est Expenses: ₹${cashFlowForecast.estimatedExpenses}`);
    console.log(`  ✅ PASS: Generated ${cashFlowForecast.forecastPoints.length} visual forecast time-series points`);
  } else {
    console.error('  ❌ FAIL: Cash flow forecast 30d structure error', cashFlowForecast);
    process.exit(1);
  }

  // 6. Test Cash-Flow Forecast (3m Horizon)
  console.log('\nScenario 6: Test Cash-Flow Forecast for 3m horizon');
  const forecast3mRes = await fetch(`${API_BASE}/insights/cash-flow?forecastHorizon=3m`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const forecast3mData = await forecast3mRes.json();
  if (forecast3mRes.ok && forecast3mData.cashFlowForecast?.horizon === '3m') {
    console.log(`  ✅ PASS: 3m forecast horizon evaluated with Est Net Cash Flow: ₹${forecast3mData.cashFlowForecast.estimatedNetCashFlow}`);
  } else {
    console.error('  ❌ FAIL: 3m cash flow horizon request failed', forecast3mData);
    process.exit(1);
  }

  // 7. Verify Scheduled vs Unscheduled Separation
  console.log('\nScenario 7: Verify separation of scheduled recurring vs unscheduled expenses');
  if (
    typeof cashFlowForecast.expectedRecurringExpenses === 'number' &&
    typeof cashFlowForecast.unscheduledEstimatedExpenses === 'number' &&
    cashFlowForecast.estimatedExpenses === cashFlowForecast.expectedRecurringExpenses + cashFlowForecast.unscheduledEstimatedExpenses
  ) {
    console.log(`  ✅ PASS: Scheduled Recurring: ₹${cashFlowForecast.expectedRecurringExpenses}, Unscheduled: ₹${cashFlowForecast.unscheduledEstimatedExpenses}`);
  } else {
    console.error('  ❌ FAIL: Recurring vs unscheduled sum mismatch', cashFlowForecast);
    process.exit(1);
  }

  // 8. Test Historical Spending Trends
  console.log('\nScenario 8: Test Historical Spending Trends & category deltas');
  const { spendingTrends } = insights;
  if (Array.isArray(spendingTrends.topCategories) && spendingTrends.topCategories.length > 0) {
    const topCat = spendingTrends.topCategories[0];
    console.log(`  ✅ PASS: Top Category: ${topCat.category} (₹${topCat.currentAmount}) Trend: ${topCat.trend}`);
    console.log(`  ✅ PASS: Recurring vs Variable split: ${spendingTrends.recurringVsNonRecurring.recurringPercentage}% / ${spendingTrends.recurringVsNonRecurring.nonRecurringPercentage}%`);
  } else {
    console.error('  ❌ FAIL: Spending trends empty or invalid', spendingTrends);
    process.exit(1);
  }

  // 9. Test Pace-Based Budget Forecasts
  console.log('\nScenario 9: Test Budget Forecasts & Pace Projection');
  const { budgetForecasts } = insights;
  if (Array.isArray(budgetForecasts) && budgetForecasts.length > 0) {
    const sampleBudget = budgetForecasts[0];
    console.log(`  ✅ PASS: Budget ${sampleBudget.budgetName}: Spent ₹${sampleBudget.actualSpent}/${sampleBudget.limit}, Projected End: ₹${sampleBudget.projectedEndSpending}`);
  } else {
    console.error('  ❌ FAIL: Budget forecasts invalid', budgetForecasts);
    process.exit(1);
  }

  // 10. Test Savings Goal Projections
  console.log('\nScenario 10: Test Savings Goal Projections & Required Contributions');
  const { savingsProjections } = insights;
  if (Array.isArray(savingsProjections) && savingsProjections.length > 0) {
    const sampleGoal = savingsProjections[0];
    console.log(`  ✅ PASS: Goal ${sampleGoal.goalName}: ${sampleGoal.progressPercentage}% saved (Target: ₹${sampleGoal.targetAmount})`);
    if (sampleGoal.requiredMonthlyContribution) {
      console.log(`  ✅ PASS: Required Monthly Transfer: ₹${sampleGoal.requiredMonthlyContribution}`);
    }
  } else {
    console.error('  ❌ FAIL: Savings goal projections invalid', savingsProjections);
    process.exit(1);
  }

  // 11. Test Unusual Spending Signals
  console.log('\nScenario 11: Test Unusual Spending Detection');
  const { unusualSpending } = insights;
  if (Array.isArray(unusualSpending)) {
    console.log(`  ✅ PASS: Unusual spending engine generated ${unusualSpending.length} signal(s)`);
  } else {
    console.error('  ❌ FAIL: Unusual spending signals property invalid', unusualSpending);
    process.exit(1);
  }

  // 12. Test Actionable Recommendations
  console.log('\nScenario 12: Test Actionable Financial Recommendations');
  const { recommendations } = insights;
  if (Array.isArray(recommendations) && recommendations.length > 0) {
    console.log(`  ✅ PASS: Generated ${recommendations.length} actionable advice card(s)`);
    console.log(`  ✅ font: Sample Recommendation: "${recommendations[0].title}"`);
  } else {
    console.error('  ❌ FAIL: Recommendations invalid', recommendations);
    process.exit(1);
  }

  // 13. Test Forecast Confidence Metadata
  console.log('\nScenario 13: Test Forecast Confidence & Data Sufficiency');
  const { confidenceMeta } = insights;
  if (confidenceMeta && confidenceMeta.level && Array.isArray(confidenceMeta.factors)) {
    console.log(`  ✅ PASS: Confidence Level: ${confidenceMeta.level}`);
    console.log(`  ✅ PASS: Evaluation factors count: ${confidenceMeta.factors.length}`);
  } else {
    console.error('  ❌ FAIL: Confidence metadata invalid', confidenceMeta);
    process.exit(1);
  }

  // 14. Test Sub-resource Endpoints
  console.log('\nScenario 14: Test Modular Sub-resource Endpoints');
  const overviewRes = await fetch(`${API_BASE}/insights/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const overviewData = await overviewRes.json();

  const trendsRes = await fetch(`${API_BASE}/insights/spending-trends`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const trendsData = await trendsRes.json();

  if (overviewRes.ok && overviewData.overview && trendsRes.ok && trendsData.spendingTrends) {
    console.log('  ✅ PASS: /api/insights/overview and /api/insights/spending-trends endpoints responsive');
  } else {
    console.error('  ❌ FAIL: Sub-resource endpoints failed', { overviewData, trendsData });
    process.exit(1);
  }

  // 15. Verify Financial Data Integrity
  console.log('\nScenario 15: Verify Financial Data Integrity');
  const txRes = await fetch(`${API_BASE}/transactions?month=2026-10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const txData = await txRes.json();
  if (txRes.ok && Array.isArray(txData.transactions)) {
    console.log(`  ✅ PASS: Financial ledger intact with ${txData.transactions.length} recorded transactions for October 2026`);
  } else {
    console.error('  ❌ FAIL: Transaction ledger corrupted or unreachable', txData);
    process.exit(1);
  }

  console.log('\n--- TEST SUMMARY ---');
  console.log('Passed: 15');
  console.log('Failed: 0');
  console.log('✨ ALL PHASE 10 FINANCIAL INSIGHTS & PLANNING TESTS PASSED SUCCESSFULLY! ✨');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
