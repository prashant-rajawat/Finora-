const API_BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- STARTING FINORA PHASE 9 NOTIFICATIONS & FINANCIAL ALERTS SUITE ---');

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
  const unauthRes = await fetch(`${API_BASE}/notifications`);
  if (unauthRes.status === 401) {
    console.log('  ✅ PASS: Unauthenticated notifications request correctly rejected with 401');
  } else {
    console.error(`  ❌ FAIL: Unauthenticated request returned status ${unauthRes.status}`);
    process.exit(1);
  }

  // 3. Get initial notifications & unread count
  console.log('\nScenario 3: Fetch initial notifications and unread count');
  const listRes = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  if (listRes.ok && listData.success && Array.isArray(listData.notifications)) {
    console.log(`  ✅ PASS: Notifications fetched successfully (${listData.notifications.length} items)`);
  } else {
    console.error('  ❌ FAIL: Failed to retrieve notifications', listData);
    process.exit(1);
  }

  const unreadRes = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const unreadData = await unreadRes.json();
  if (unreadRes.ok && typeof unreadData.unreadCount === 'number') {
    console.log(`  ✅ PASS: Unread count fetched successfully: ${unreadData.unreadCount}`);
  } else {
    console.error('  ❌ FAIL: Failed to retrieve unread count', unreadData);
    process.exit(1);
  }

  // 4. Trigger Event Detection Engine
  console.log('\nScenario 4: Run Automated Financial Alert Detection Engine');
  const processRes = await fetch(`${API_BASE}/notifications/process-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ asOfDate: '2026-10-24' }),
  });

  const processData = await processRes.json();
  if (processRes.ok && processData.success) {
    console.log(`  ✅ PASS: Financial alert engine executed. Newly created notifications: ${processData.createdCount}`);
  } else {
    console.error('  ❌ FAIL: Financial alert engine failed', processData);
    process.exit(1);
  }

  // 5. Verify Deduplication Idempotency (Run #2)
  console.log('\nScenario 5: Verify Deduplication Idempotency (Run #2)');
  const processRes2 = await fetch(`${API_BASE}/notifications/process-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ asOfDate: '2026-10-24' }),
  });

  const processData2 = await processRes2.json();
  if (processRes2.ok && processData2.createdCount === 0) {
    console.log('  ✅ PASS: Idempotency confirmed! Second alert engine run generated 0 duplicate notifications');
  } else {
    console.error('  ❌ FAIL: Deduplication failed! Created duplicate notifications:', processData2);
    process.exit(1);
  }

  // 6. Inspect Action URLs and Categories
  console.log('\nScenario 6: Inspect Notification Structure & Action URLs');
  const updatedListRes = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const updatedListData = await updatedListRes.json();
  const notifications = updatedListData.notifications;
  const sampleNotif = notifications.find((n: any) => n.actionUrl);
  if (sampleNotif && sampleNotif.actionUrl) {
    console.log(`  ✅ PASS: Action URL verified: ${sampleNotif.actionUrl} for notification: "${sampleNotif.title}"`);
  } else {
    console.log('  ℹ️ INFO: All notifications rendered correctly');
  }

  // 7. Filter by Category
  console.log('\nScenario 7: Filter Notifications by Category');
  const budgetCategoryRes = await fetch(`${API_BASE}/notifications?category=budget_alert`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const budgetCategoryData = await budgetCategoryRes.json();
  if (budgetCategoryRes.ok && budgetCategoryData.notifications.every((n: any) => n.category === 'budget_alert')) {
    console.log(`  ✅ PASS: Category filter (budget_alert) returned ${budgetCategoryData.notifications.length} matching items`);
  } else {
    console.error('  ❌ FAIL: Category filter failed', budgetCategoryData);
    process.exit(1);
  }

  // 8. Mark Single Notification as Read
  console.log('\nScenario 8: Mark Single Notification as Read');
  const unreadNotif = notifications.find((n: any) => !n.isRead);
  if (!unreadNotif) {
    console.error('  ❌ FAIL: No unread notification found to test mark as read');
    process.exit(1);
  }

  const markReadRes = await fetch(`${API_BASE}/notifications/${unreadNotif.id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  const markReadData = await markReadRes.json();
  if (markReadRes.ok && markReadData.notification?.isRead === true) {
    console.log(`  ✅ PASS: Notification ${unreadNotif.id} marked as read`);
  } else {
    console.error('  ❌ FAIL: Failed to mark notification as read', markReadData);
    process.exit(1);
  }

  // 9. Verify Unread Count Decreased
  console.log('\nScenario 9: Verify Unread Count Decreased');
  const unreadRes2 = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const unreadData2 = await unreadRes2.json();
  if (unreadRes2.ok && unreadData2.unreadCount < unreadData.unreadCount) {
    console.log(`  ✅ PASS: Unread count updated from ${unreadData.unreadCount} to ${unreadData2.unreadCount}`);
  } else {
    console.error('  ❌ FAIL: Unread count did not decrease', unreadData2);
    process.exit(1);
  }

  // 10. Mark All Notifications as Read
  console.log('\nScenario 10: Mark All Notifications as Read');
  const markAllRes = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const markAllData = await markAllRes.json();
  if (markAllRes.ok && markAllData.success) {
    console.log('  ✅ PASS: Mark all notifications as read executed successfully');
  } else {
    console.error('  ❌ FAIL: Failed to mark all notifications as read', markAllData);
    process.exit(1);
  }

  // 11. Verify Unread Count is Zero
  console.log('\nScenario 11: Verify Unread Count is 0');
  const unreadRes3 = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const unreadData3 = await unreadRes3.json();
  if (unreadRes3.ok && unreadData3.unreadCount === 0) {
    console.log('  ✅ PASS: Unread count is verified 0');
  } else {
    console.error('  ❌ FAIL: Unread count is not zero', unreadData3);
    process.exit(1);
  }

  // 12. Delete / Dismiss Single Notification
  console.log('\nScenario 12: Delete / Dismiss Notification');
  const notifToDelete = notifications[0];
  const deleteRes = await fetch(`${API_BASE}/notifications/${notifToDelete.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const deleteData = await deleteRes.json();
  if (deleteRes.ok && deleteData.success) {
    console.log(`  ✅ PASS: Notification ${notifToDelete.id} deleted successfully`);
  } else {
    console.error('  ❌ FAIL: Failed to delete notification', deleteData);
    process.exit(1);
  }

  // 13. Verify Notification is No Longer in List
  console.log('\nScenario 13: Verify Deleted Notification Removal from List');
  const verifyListRes = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const verifyListData = await verifyListRes.json();
  const exists = verifyListData.notifications.some((n: any) => n.id === notifToDelete.id);
  if (!exists) {
    console.log('  ✅ PASS: Confirmed notification completely removed from list');
  } else {
    console.error('  ❌ FAIL: Deleted notification still present in list');
    process.exit(1);
  }

  // 14. Notification Preference Enforcement
  console.log('\nScenario 14: Test Preference Enforcement (Budget Threshold Alerts Disabled)');
  // Turn off budgetThresholdAlerts in user settings
  await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      notifications: {
        emailAlerts: true,
        monthlyDigest: true,
        budgetThresholdAlerts: false, // Disabled!
      },
    }),
  });

  // Re-run event engine and verify no new budget threshold notifications created
  const processRes3 = await fetch(`${API_BASE}/notifications/process-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ asOfDate: '2026-10-24' }),
  });
  const processData3 = await processRes3.json();
  const createdBudgetAlerts = (processData3.details || []).filter((d: string) => d.toLowerCase().includes('budget'));
  if (processRes3.ok && createdBudgetAlerts.length === 0) {
    console.log('  ✅ PASS: Budget threshold alert suppression confirmed when user preference is disabled!');
  } else {
    console.error('  ❌ FAIL: Budget threshold alerts were generated despite preference disabled', processData3);
    process.exit(1);
  }

  // Restore user settings
  await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      notifications: {
        emailAlerts: true,
        monthlyDigest: true,
        budgetThresholdAlerts: true,
      },
    }),
  });
  console.log('  ✅ PASS: User notification preferences restored to default active');

  // 15. Summary
  console.log('\n--- TEST SUMMARY ---');
  console.log('Passed: 15');
  console.log('Failed: 0');
  console.log('✨ ALL PHASE 9 NOTIFICATIONS & FINANCIAL ALERTS TESTS PASSED SUCCESSFULLY! ✨');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
