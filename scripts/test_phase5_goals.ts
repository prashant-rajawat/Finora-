/**
 * Comprehensive Automated Verification Script for Finora Phase 5: Savings Goals & Progress Tracking
 * Verifies all 22 scenarios across authentication, creation, validation, contribution workflows,
 * projections, progress calculations, status lifecycles, and cross-module accounting integrity.
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

  console.log('\n--- STARTING FINORA PHASE 5 SAVINGS GOALS VERIFICATION SUITE ---\n');

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

  // Test 2: Goals API Authorization & Protection
  console.log('\nScenario 2: Goals API requires authentication');
  const unauthRes = await fetch(`${baseUrl}/api/goals`);
  assert(unauthRes.status === 401, 'Unauthenticated request correctly rejected with 401 Unauthorized');

  // Test 3: Retrieve Seeded Goals for Ansh Kumar
  console.log('\nScenario 3: Fetch seeded goals for Ansh Kumar');
  const goalsRes = await fetch(`${baseUrl}/api/goals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const goalsJson = await goalsRes.json();
  assert(goalsRes.status === 200 && goalsJson.success === true, 'Goals endpoint returns 200 OK');
  assert(goalsJson.goals.length === 3, `Ansh Kumar has 3 seeded goals (Actual: ${goalsJson.goals.length})`);

  // Verify first seeded goal: Emergency Safety Net
  const emergencyGoal = goalsJson.goals.find((g: any) => g.name === 'Emergency Safety Net');
  assert(!!emergencyGoal, 'Emergency Safety Net goal found');
  assert(emergencyGoal.targetAmount === 100000, 'Emergency Safety Net target is ₹100,000');
  assert(emergencyGoal.savedAmount === 35000, `Emergency Safety Net saved amount is ₹35,000 (Actual: ₹${emergencyGoal.savedAmount})`);
  assert(emergencyGoal.remainingAmount === 65000, `Remaining amount is ₹65,000 (Actual: ₹${emergencyGoal.remainingAmount})`);
  assert(emergencyGoal.progressPercentage === 35, `Progress is 35.0% (Actual: ${emergencyGoal.progressPercentage}%)`);
  assert(emergencyGoal.status === 'active', 'Status is active');

  // Test 4: Goal Summary KPI calculations
  console.log('\nScenario 4: Savings Goals Summary KPI Calculations');
  const summaryRes = await fetch(`${baseUrl}/api/goals/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const summaryJson = await summaryRes.json();
  const sum = summaryJson.summary;
  assert(summaryRes.status === 200 && !!sum, 'Summary endpoint returns 200 OK');
  assert(sum.totalTarget === 380000, `Total target for active goals is ₹380,000 (100k+250k+30k) (Actual: ₹${sum.totalTarget})`);
  assert(sum.totalSaved === 130000, `Total saved for active goals is ₹130,000 (35k+75k+20k) (Actual: ₹${sum.totalSaved})`);
  assert(sum.totalRemaining === 250000, `Total remaining is ₹250,000 (Actual: ₹${sum.totalRemaining})`);
  assert(sum.activeCount === 3, `Active goals count is 3 (Actual: ${sum.activeCount})`);
  assert(sum.overallProgress === 34.2, `Overall progress is 34.2% ((130000/380000)*100) (Actual: ${sum.overallProgress}%)`);

  // Test 5: Linear Projection Calculator
  console.log('\nScenario 5: Linear Projection Calculator Verification');
  assert(emergencyGoal.projections !== null, 'Emergency goal has projections calculated');
  assert(typeof emergencyGoal.projections.monthlyNeeded === 'number' && emergencyGoal.projections.monthlyNeeded > 0, `Monthly pacing estimated (Actual: ₹${emergencyGoal.projections.monthlyNeeded}/mo)`);
  assert(emergencyGoal.daysRemaining > 0, `Days remaining accurately calculated (${emergencyGoal.daysRemaining} days)`);

  // Test 6: Validation when Creating Goal
  console.log('\nScenario 6: Validation rules on Goal Creation');
  // Missing name
  const missingNameRes = await fetch(`${baseUrl}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ category: 'Travel', targetAmount: 50000 }),
  });
  assert(missingNameRes.status === 400, 'Missing goal name rejected with 400 Bad Request');

  // Non-positive target amount
  const negTargetRes = await fetch(`${baseUrl}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Invalid Goal', category: 'Travel', targetAmount: -500 }),
  });
  assert(negTargetRes.status === 400, 'Negative target amount rejected with 400 Bad Request');

  const zeroTargetRes = await fetch(`${baseUrl}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Zero Goal', category: 'Travel', targetAmount: 0 }),
  });
  assert(zeroTargetRes.status === 400, 'Zero target amount rejected with 400 Bad Request');

  // Negative starting amount
  const negInitialRes = await fetch(`${baseUrl}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Neg Initial', category: 'Travel', targetAmount: 5000, initialAmount: -100 }),
  });
  assert(negInitialRes.status === 400, 'Negative starting amount rejected with 400 Bad Request');

  // Test 7: Create a New Goal with Initial Deposit
  console.log('\nScenario 7: Successfully create a new goal with initial deposit');
  const createRes = await fetch(`${baseUrl}/api/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Sony A7 IV Camera',
      category: 'Tech & Gadgets',
      targetAmount: 200000,
      initialAmount: 40000,
      targetDate: '2027-06-30',
      description: 'Camera body and 24-70mm lens for photography.',
      color: '#8B5CF6',
      icon: 'Sparkles',
      frequencyPreference: 'monthly',
    }),
  });
  const createJson = await createRes.json();
  assert(createRes.status === 201 && !!createJson.goal, 'Goal successfully created with 201 Created');
  const newGoal = createJson.goal;
  assert(newGoal.targetAmount === 200000, 'Target amount is ₹200,000');
  assert(newGoal.savedAmount === 40000, `Initial starting amount ₹40,000 credited as saved amount (Actual: ₹${newGoal.savedAmount})`);
  assert(newGoal.remainingAmount === 160000, `Remaining amount is ₹160,000 (Actual: ₹${newGoal.remainingAmount})`);
  assert(newGoal.progressPercentage === 20, `Progress percentage is 20.0% (Actual: ${newGoal.progressPercentage}%)`);
  assert(newGoal.contributionsCount === 1, 'Inaugural contribution record created for initial deposit');

  // Test 8: Add Contribution Workflow & Live Calculation
  console.log('\nScenario 8: Record contribution toward goal');
  const contribRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}/contributions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      amount: 60000,
      date: '2026-10-24',
      note: 'Photography client project milestone payment',
      source: 'Bank Transfer',
    }),
  });
  const contribJson = await contribRes.json();
  assert(contribRes.status === 201 && !!contribJson.contribution, 'Contribution recorded with 201 Created');
  const updatedAfterContrib = contribJson.goal;
  assert(updatedAfterContrib.savedAmount === 100000, `New saved total is ₹100,000 (40k + 60k) (Actual: ₹${updatedAfterContrib.savedAmount})`);
  assert(updatedAfterContrib.remainingAmount === 100000, `New remaining is ₹100,000 (Actual: ₹${updatedAfterContrib.remainingAmount})`);
  assert(updatedAfterContrib.progressPercentage === 50, `New progress is 50.0% (Actual: ${updatedAfterContrib.progressPercentage}%)`);
  assert(updatedAfterContrib.contributionsCount === 2, 'Goal now has 2 contributions');

  // Test 9: Complete Goal via Target Reached
  console.log('\nScenario 9: Complete goal by reaching 100% target');
  const completeContribRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}/contributions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      amount: 100000,
      date: '2026-10-24',
      note: 'Final equipment fund transfer',
      source: 'Savings Account',
    }),
  });
  const completeJson = await completeContribRes.json();
  const completedGoal = completeJson.goal;
  assert(completedGoal.savedAmount === 200000, `Saved amount equals target ₹200,000 (Actual: ₹${completedGoal.savedAmount})`);
  assert(completedGoal.remainingAmount === 0, `Remaining amount is 0 (Actual: ₹${completedGoal.remainingAmount})`);
  assert(completedGoal.progressPercentage === 100, `Progress is 100.0% (Actual: ${completedGoal.progressPercentage}%)`);
  assert(completedGoal.status === 'completed', `Goal status automatically promoted to 'completed' (Actual: '${completedGoal.status}')`);

  // Test 10: Legitimate Overachievement (Saved > Target)
  console.log('\nScenario 10: Overachievement beyond target');
  const overachieveRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}/contributions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      amount: 10000,
      date: '2026-10-24',
      note: 'Bonus for extra camera accessories & SD cards',
      source: 'UPI',
    }),
  });
  const overachieveJson = await overachieveRes.json();
  const overachievedGoal = overachieveJson.goal;
  assert(overachievedGoal.savedAmount === 210000, `Saved amount accurately reflects overachievement ₹210,000 (Actual: ₹${overachievedGoal.savedAmount})`);
  assert(overachievedGoal.remainingAmount === 0, 'Remaining amount stays 0');
  assert(overachievedGoal.progressPercentage === 105, `Progress accurately shows 105.0% overachievement (Actual: ${overachievedGoal.progressPercentage}%)`);

  // Test 11: Delete Contribution and Verify Recalculation
  console.log('\nScenario 11: Delete contribution & verify automatic recalculation');
  const contribToDelete = overachieveJson.contribution;
  const deleteContribRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}/contributions/${contribToDelete.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const deleteContribJson = await deleteContribRes.json();
  assert(deleteContribRes.status === 200, 'Contribution successfully deleted with 200 OK');
  const revertedGoal = deleteContribJson.goal;
  assert(revertedGoal.savedAmount === 200000, `Saved amount correctly reverts to ₹200,000 (Actual: ₹${revertedGoal.savedAmount})`);
  assert(revertedGoal.progressPercentage === 100, `Progress reverts to 100.0%`);

  // Test 12: Edit Goal Details
  console.log('\nScenario 12: Edit Goal Details and Pacing');
  const updateRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'Sony A7 IV Studio Kit',
      targetAmount: 250000, // increased target from 200k to 250k
    }),
  });
  const updateJson = await updateRes.json();
  const updatedGoal = updateJson.goal;
  assert(updatedGoal.name === 'Sony A7 IV Studio Kit', 'Name updated');
  assert(updatedGoal.targetAmount === 250000, 'Target amount updated to ₹250,000');
  assert(updatedGoal.remainingAmount === 50000, `Remaining amount recalculated as ₹50,000 (Actual: ₹${updatedGoal.remainingAmount})`);
  assert(updatedGoal.progressPercentage === 80, `Progress recalculated as 80.0% (200k/250k*100) (Actual: ${updatedGoal.progressPercentage}%)`);
  assert(updatedGoal.status === 'active', `Status reverted from completed to 'active' because target was increased above saved total`);

  // Test 13: Goal Status Transitions: Pause and Resume
  console.log('\nScenario 13: Pause and Resume Goal Lifecycle');
  const pauseRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'paused' }),
  });
  const pauseJson = await pauseRes.json();
  assert(pauseJson.goal.status === 'paused', 'Goal marked as paused');

  const resumeRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'active' }),
  });
  const resumeJson = await resumeRes.json();
  assert(resumeJson.goal.status === 'active', 'Goal resumed to active');

  // Test 14: Archive Goal
  console.log('\nScenario 14: Archive Goal');
  const archiveRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'archived' }),
  });
  const archiveJson = await archiveRes.json();
  assert(archiveJson.goal.status === 'archived', 'Goal marked as archived');

  // Test 15: Filtering and Sorting
  console.log('\nScenario 15: Goals Filtering & Sorting');
  const activeOnlyRes = await fetch(`${baseUrl}/api/goals?filter=active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const activeOnlyJson = await activeOnlyRes.json();
  const hasArchivedInActive = activeOnlyJson.goals.some((g: any) => g.id === newGoal.id);
  assert(!hasArchivedInActive, 'Archived goal excluded from active filter');

  const archivedOnlyRes = await fetch(`${baseUrl}/api/goals?filter=archived`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const archivedOnlyJson = await archivedOnlyRes.json();
  const hasInArchived = archivedOnlyJson.goals.some((g: any) => g.id === newGoal.id);
  assert(hasInArchived, 'Goal present in archived filter');

  // Test 16: Safe Goal Deletion
  console.log('\nScenario 16: Delete Goal Safely');
  const deleteRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(deleteRes.status === 200, 'Goal deleted with 200 OK');

  const verifyDeleteRes = await fetch(`${baseUrl}/api/goals/${newGoal.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(verifyDeleteRes.status === 404, 'Deleted goal returns 404 Not Found');

  // Test 17: User Isolation & Cross-Account Security
  console.log('\nScenario 17: User Isolation & Security (Cross-User Access Prevention)');
  const otherUserEmail = `other_user_${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Rahul Varma',
      email: otherUserEmail,
      password: 'password123',
      confirmPassword: 'password123',
    }),
  });
  const regJson = await regRes.json();
  const otherUserToken = regJson.token;
  assert(!!otherUserToken, 'Second user registered successfully');

  // Other user trying to access Ansh Kumar's goal
  const forbiddenGetRes = await fetch(`${baseUrl}/api/goals/${emergencyGoal.id}`, {
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  assert(forbiddenGetRes.status === 404, 'Other user cannot view Ansh Kumar goal (404/Isolated)');

  const forbiddenContribRes = await fetch(`${baseUrl}/api/goals/${emergencyGoal.id}/contributions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${otherUserToken}` },
    body: JSON.stringify({ amount: 5000 }),
  });
  assert(forbiddenContribRes.status === 404, 'Other user cannot contribute to Ansh Kumar goal');

  const forbiddenDeleteRes = await fetch(`${baseUrl}/api/goals/${emergencyGoal.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  assert(forbiddenDeleteRes.status === 404, 'Other user cannot delete Ansh Kumar goal');

  // Test 18: Empty State for Fresh User
  console.log('\nScenario 18: Empty state for fresh user');
  const freshGoalsRes = await fetch(`${baseUrl}/api/goals`, {
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  const freshGoalsJson = await freshGoalsRes.json();
  assert(freshGoalsJson.goals.length === 0, 'Fresh user has 0 goals');

  const freshSummaryRes = await fetch(`${baseUrl}/api/goals/summary`, {
    headers: { Authorization: `Bearer ${otherUserToken}` },
  });
  const freshSummaryJson = await freshSummaryRes.json();
  assert(freshSummaryJson.summary.totalTarget === 0, 'Fresh user summary has totalTarget = 0');
  assert(freshSummaryJson.summary.totalSaved === 0, 'Fresh user summary has totalSaved = 0');
  assert(freshSummaryJson.summary.overallProgress === 0, 'Fresh user summary has overallProgress = 0%');

  // Test 19: Critical Financial Integrity: Transactions Unaltered by Contributions
  console.log('\nScenario 19: Financial Accounting Integrity (No Cross-Contamination of Ledgers)');
  const txRes = await fetch(`${baseUrl}/api/transactions?month=2026-10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const txJson = await txRes.json();
  const anshExpenses = txJson.transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((acc: number, t: any) => acc + t.amount, 0);
  const anshIncome = txJson.transactions
    .filter((t: any) => t.type === 'income')
    .reduce((acc: number, t: any) => acc + t.amount, 0);

  assert(anshIncome === 45000, `Income remains strictly ₹45,000 (Unaffected by savings contributions)`);
  assert(anshExpenses === 28450, `Expenses remain strictly ₹28,450 (Unaffected by savings contributions)`);

  // Test 20: Analytics Module Integrity
  console.log('\nScenario 20: Analytics API Integrity Check');
  const anRes = await fetch(`${baseUrl}/api/analytics?period=this_month`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const anJson = await anRes.json();
  assert(anJson.analytics.summary.totalIncome === 45000, 'Analytics total income verified as ₹45,000');
  assert(anJson.analytics.summary.totalExpenses === 28450, 'Analytics total expenses verified as ₹28,450');

  // Test 21: Budgets Module Integrity
  console.log('\nScenario 21: Budgets API Integrity Check');
  const bgtRes = await fetch(`${baseUrl}/api/budgets/summary?period=2026-10`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const bgtJson = await bgtRes.json();
  assert(bgtJson.summary.totalBudget === 32000, 'Budget total remains ₹32,000');
  assert(bgtJson.summary.totalSpent === 28450, 'Budget total spent remains ₹28,450');

  // Test 22: Performance Benchmarking
  console.log('\nScenario 22: API Latency & Execution Speed');
  const t0 = Date.now();
  await fetch(`${baseUrl}/api/goals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const tElapsed = Date.now() - t0;
  assert(tElapsed < 100, `Goals list with projections calculated and retrieved in ${tElapsed}ms (< 100ms)`);

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
