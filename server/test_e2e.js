// End-to-end API and workflow verification test
const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- FIND BACK END-TO-END VERIFICATION ---');

  // 1. Health check
  console.log('1. Testing Health Endpoint...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  if (health.status !== 'ok') throw new Error('Health check failed');
  console.log('   ✓ Health check passed:', health.service);

  // 2. Stats
  console.log('2. Testing Initial Campus Stats...');
  const statsRes = await fetch(`${BASE_URL}/api/stats`);
  const stats = await statsRes.json();
  console.log(`   ✓ Total Reports: ${stats.totalReports}, Recovery Rate: ${stats.recoveryRate}%`);

  // 3. Items list
  console.log('3. Testing Items Listing & Filters...');
  const itemsRes = await fetch(`${BASE_URL}/api/items?type=lost`);
  const items = await itemsRes.json();
  if (!Array.isArray(items.items) || items.items.length === 0) throw new Error('Lost items query failed');
  console.log(`   ✓ Found ${items.items.length} lost items`);

  // 4. Create new Lost Item
  console.log('4. Testing Report Lost Item Flow...');
  const newLostPayload = {
    type: 'lost',
    title: 'Sony WH-1000XM4 Noise Canceling Headphones',
    category: 'Electronics',
    brand: 'Sony',
    primaryColor: 'Silver / Grey',
    campusLocation: 'Central Library 3rd Floor',
    date: '2026-10-09',
    time: '10:00',
    description: 'Left silver over-ear headphones in study cubicle near window.',
    privateSecretClue: 'Small silver scratch on left ear cup; engraving "AARAV" under headband cushion.',
    reporterName: 'Aarav Sharma',
    reporterEmail: 'aarav.sharma@campus.edu',
    reporterPhone: '+91 98765 43210',
    reporterRollNo: '22CS104'
  };

  const createLostRes = await fetch(`${BASE_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLostPayload)
  });
  const createdLost = await createLostRes.json();
  if (!createdLost.item || !createdLost.item.id) throw new Error('Failed to create lost item');
  const lostItemId = createdLost.item.id;
  console.log('   ✓ Created Lost Item:', createdLost.item.title, `(${lostItemId})`);

  // 5. Create new Found Item matching the lost item
  console.log('5. Testing Report Found Item Flow (Good Samaritan)...');
  const newFoundPayload = {
    type: 'found',
    title: 'Sony Silver Wireless Over-Ear Headphones',
    category: 'Electronics',
    brand: 'Sony',
    primaryColor: 'Silver / Grey',
    campusLocation: 'Central Library 3rd Floor',
    date: '2026-10-09',
    time: '11:15',
    description: 'Found grey/silver Sony headphones left on table in 3rd floor quiet zone.',
    custodyLocation: 'Handed to Library Desk @ Meera',
    reporterName: 'Priya Patel',
    reporterEmail: 'priya.patel@campus.edu',
    reporterPhone: '+91 98112 34567',
    reporterRollNo: '23EC078'
  };

  const createFoundRes = await fetch(`${BASE_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newFoundPayload)
  });
  const createdFound = await createFoundRes.json();
  const foundItemId = createdFound.item.id;
  console.log('   ✓ Created Found Item:', createdFound.item.title, `(${foundItemId})`);

  // 6. Test Smart Matching Algorithm
  console.log('6. Testing Algorithmic Smart Matching...');
  const matchRes = await fetch(`${BASE_URL}/api/matches/${lostItemId}`);
  const matchData = await matchRes.json();
  if (!matchData.matches || matchData.matches.length === 0) throw new Error('No matches found for newly reported item');
  const topMatch = matchData.matches[0];
  console.log(`   ✓ Algorithmic Match Score: ${topMatch.score}%`);
  console.log('   ✓ Match Reasons:');
  topMatch.matchedReasons.forEach(r => console.log(`      - ${r}`));

  if (topMatch.score < 80) throw new Error('Match score unexpectedly low for identical item');

  // 7. Submit Ownership Claim
  console.log('7. Testing Ownership Claim Submission with Secret Clue...');
  const claimPayload = {
    itemId: foundItemId,
    claimantName: 'Aarav Sharma',
    claimantEmail: 'aarav.sharma@campus.edu',
    claimantPhone: '+91 98765 43210',
    claimantRollNo: '22CS104',
    secretProofClue: 'Small silver scratch on left ear cup; engraving "AARAV" under headband cushion.'
  };

  const claimRes = await fetch(`${BASE_URL}/api/claims`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimPayload)
  });
  const claimData = await claimRes.json();
  if (!claimData.claim || !claimData.claim.id) throw new Error('Failed to create claim');
  const claimId = claimData.claim.id;
  console.log('   ✓ Claim Submitted:', claimId, 'Status:', claimData.claim.status);

  // 8. Admin / Finder approves claim
  console.log('8. Testing Admin Review & Claim Approval...');
  const approveRes = await fetch(`${BASE_URL}/api/claims/${claimId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'approved',
      adminNote: 'Proof matches secret engraving exactly. Approved for pickup at Library Desk.',
      reviewedBy: 'Officer Rajendra Kumar'
    })
  });
  const approvedData = await approveRes.json();
  if (approvedData.claim.status !== 'approved') throw new Error('Claim approval failed');
  console.log('   ✓ Claim Approved successfully!');

  // 9. Mark Item as Safely Returned
  console.log('9. Testing Mark As Returned & Safe Handover...');
  const returnRes = await fetch(`${BASE_URL}/api/items/${foundItemId}/return`, {
    method: 'POST'
  });
  const returnData = await returnRes.json();
  if (returnData.item.status !== 'returned') throw new Error('Mark as returned failed');
  console.log('   ✓ Item Status Updated to:', returnData.item.status);

  // 10. Check updated Stats
  console.log('10. Verifying Updated Campus Recovery Stats...');
  const updatedStatsRes = await fetch(`${BASE_URL}/api/stats`);
  const updatedStats = await updatedStatsRes.json();
  console.log(`   ✓ New Recovered Total: ${updatedStats.recovered}, Recovery Rate: ${updatedStats.recoveryRate}%`);

  // 11. Reset database to default clean seed
  console.log('11. Testing Demo Reset Endpoint...');
  const resetRes = await fetch(`${BASE_URL}/api/demo/reset`, { method: 'POST' });
  const resetData = await resetRes.json();
  console.log('   ✓ Demo Reset Message:', resetData.message);

  console.log('\n==========================================');
  console.log('🎉 ALL 11 END-TO-END TESTS PASSED 100%! 🎉');
  console.log('==========================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
