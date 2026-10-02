import test from 'node:test';
import assert from 'node:assert/strict';
import { getLeaderboard, addLeaderboardScore } from '../../lib/storage.ts';

test('Leaderboard: retrieves top entries in descending order', async () => {
  const scores = await getLeaderboard(5);
  assert.ok(Array.isArray(scores), 'Leaderboard should be an array');
  assert.ok(scores.length > 0, 'Leaderboard should have at least 1 entry');
  assert.equal(scores[0].rank, 1, 'Top entry should be rank 1');

  // Verify descending order
  for (let i = 0; i < scores.length - 1; i++) {
    assert.ok(
      scores[i].score >= scores[i + 1].score,
      `Score at rank ${scores[i].rank} (${scores[i].score}) should be >= rank ${scores[i + 1].rank} (${scores[i + 1].score})`
    );
  }
});

test('Leaderboard: can add a score and calculates rank correctly', async () => {
  const testPseudo = `TEST_${Math.floor(Math.random() * 1000)}`;
  const testScore = 77777;

  const result = await addLeaderboardScore({
    pseudo: testPseudo,
    score: testScore,
    lines: 75,
    level: 8,
  });

  assert.equal(result.pseudo, testPseudo);
  assert.equal(result.score, testScore);
  assert.ok(result.id, 'Entry should have an ID');
  assert.ok(result.rank && result.rank > 0, 'Entry should receive a rank');

  // Verify it appears in leaderboard
  const refreshed = await getLeaderboard(100);
  const found = refreshed.find((e) => e.pseudo === testPseudo);
  assert.ok(found, 'New score should be found in leaderboard');
  assert.equal(found.score, testScore);
});
