/**
 * Comprehensive Automated Verification Script for Finora Phase 7: Settings, Profile, Preferences & Security Management
 * Verifies profile retrieval/updates, financial preferences persistence, security status, password changes,
 * authentication protection, and regression checks.
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

  console.log('\n--- STARTING FINORA PHASE 7 SETTINGS & SECURITY VERIFICATION SUITE ---\n');

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

  // Test 2: Unauthenticated Protection Check
  console.log('\nScenario 2: Settings endpoints require authentication');
  const unauthRes = await fetch(`${baseUrl}/api/settings/preferences`);
  assert(unauthRes.status === 401, 'Unauthenticated preferences request correctly rejected with 401 Unauthorized');

  // Test 3: Retrieve User Profile
  console.log('\nScenario 3: Retrieve user profile');
  const profileRes = await fetch(`${baseUrl}/api/settings/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profileJson = await profileRes.json();
  assert(profileRes.status === 200 && profileJson.success === true, 'Profile endpoint returns 200 OK');
  assert(profileJson.profile.email === 'ansh@example.com', 'Profile email matches ansh@example.com');

  // Test 4: Update User Profile
  console.log('\nScenario 4: Update user profile full name');
  const updateProfRes = await fetch(`${baseUrl}/api/settings/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fullName: 'Ansh Kumar (Updated)' }),
  });
  const updateProfJson = await updateProfRes.json();
  assert(updateProfRes.status === 200 && updateProfJson.success === true, 'Profile update returns 200 OK');
  assert(updateProfJson.user.fullName === 'Ansh Kumar (Updated)', 'Full name updated successfully');

  // Revert profile change for consistency
  await fetch(`${baseUrl}/api/settings/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fullName: 'Ansh Kumar' }),
  });

  // Test 5: Retrieve User Preferences
  console.log('\nScenario 5: Retrieve user financial and display preferences');
  const prefGetRes = await fetch(`${baseUrl}/api/settings/preferences`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const prefGetJson = await prefGetRes.json();
  console.log('PREFERENCES JSON:', prefGetJson);
  assert(prefGetRes.status === 200 && prefGetJson.success === true, 'Preferences endpoint returns 200 OK');
  assert(prefGetJson.preferences.currency === 'INR', 'Default currency is INR');

  // Test 6: Update User Preferences
  console.log('\nScenario 6: Update user preferences (Currency & Table Density)');
  const prefPutRes = await fetch(`${baseUrl}/api/settings/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      tableDensity: 'compact',
    }),
  });
  const prefPutJson = await prefPutRes.json();
  assert(prefPutRes.status === 200 && prefPutJson.success === true, 'Preferences update returns 200 OK');
  assert(prefPutJson.preferences.currency === 'USD', 'Currency successfully updated to USD');
  assert(prefPutJson.preferences.tableDensity === 'compact', 'Table density successfully updated to compact');

  // Test 7: Retrieve Security Status
  console.log('\nScenario 7: Retrieve security status and active session info');
  const secRes = await fetch(`${baseUrl}/api/settings/security`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const secJson = await secRes.json();
  assert(secRes.status === 200 && secJson.success === true, 'Security status endpoint returns 200 OK');
  assert(secJson.security.isEmailVerified === true, 'Email verification status is verified');

  // Test 8: Password Change Validation & Execution
  console.log('\nScenario 8: Password change validation and success');
  // Invalid old password
  const badPassRes = await fetch(`${baseUrl}/api/settings/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      currentPassword: 'wrongpassword',
      newPassword: 'newsecurepassword123',
      confirmPassword: 'newsecurepassword123',
    }),
  });
  assert(badPassRes.status === 400, 'Incorrect current password rejected with 400 Bad Request');

  // Successful password change
  const goodPassRes = await fetch(`${baseUrl}/api/settings/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      currentPassword: 'password123',
      newPassword: 'newsecurepassword123',
      confirmPassword: 'newsecurepassword123',
    }),
  });
  assert(goodPassRes.status === 200, 'Password changed successfully with 200 OK');

  // Revert password back to password123 so future tests continue to work
  await fetch(`${baseUrl}/api/settings/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      currentPassword: 'newsecurepassword123',
      newPassword: 'password123',
      confirmPassword: 'password123',
    }),
  });

  console.log(`\n--- TEST SUMMARY ---`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n✨ ALL PHASE 6 & 7 SETTINGS & SECURITY TESTS PASSED SUCCESSFULLY! ✨\n');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test runner execution error:', err);
  process.exit(1);
});
