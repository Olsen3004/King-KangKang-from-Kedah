import test from 'node:test';
import assert from 'node:assert/strict';
import { getTimeGreeting, processQuery } from './nlpProcessor';
import { createInitialGreetingMessage, runExpertInference } from './inferenceEngine';

test('getTimeGreeting respects computer local hour boundaries', () => {
  const morning = new Date('2026-11-15T09:15:00');
  const afternoon = new Date('2026-11-15T14:30:00');
  const evening = new Date('2026-11-15T20:05:00');

  assert.equal(getTimeGreeting(morning), 'Good morning');
  assert.equal(getTimeGreeting(afternoon), 'Good afternoon');
  assert.equal(getTimeGreeting(evening), 'Good evening');
});

test('createInitialGreetingMessage starts conversation first with time greeting', () => {
  const morning = new Date('2026-11-15T10:30:00');
  const msg = createInitialGreetingMessage(null, morning);

  assert.ok(msg.text.startsWith('Good morning!'));
  assert.ok(msg.text.includes('King KangKang'));
  assert.equal(msg.awaitingName, true);
  assert.ok(msg.activeNodeIds.includes('wau_kangkang'));
});

test('name extraction remembers user name and rejects non-name tokens', () => {
  const intro = runExpertInference('My name is Aiman', null, true, new Date('2026-11-15T10:30:00'));
  assert.equal(intro.updatedUserName, 'Aiman');
  assert.ok(intro.replyText.includes('Aiman'));
  assert.equal(intro.stillAwaitingName, false);

  const directReply = runExpertInference('Sarah', null, true);
  assert.equal(directReply.updatedUserName, 'Sarah');

  const rejectNonName = runExpertInference('yes', null, true);
  assert.equal(rejectNonName.updatedUserName, null);
});

test('NLP handles spelling typos, grammar shorthands, and synonyms accurately', () => {
  const analysis = processQuery('hw to mak bmb00 fram and busor sound');
  assert.equal(analysis.isValid, true);
  assert.ok(analysis.tokens.includes('how'));
  assert.ok(analysis.tokens.includes('bamboo'));
  assert.ok(analysis.spellingCorrections.some((c) => c.original === 'busor' && c.corrected === 'busur'));
  assert.ok(analysis.matchedSynonyms.length >= 2);
});

test('validation rejects empty, numeric-only, and repeated-character gibberish', () => {
  const empty = runExpertInference('   ', 'Aiman', false);
  assert.equal(empty.analysis.isValid, false);
  assert.equal(empty.ruleFired, 'EXCEPTION_INVALID_INPUT');

  const mash = runExpertInference('zzzzzzzz', 'Aiman', false);
  assert.equal(mash.analysis.isValid, false);
  assert.equal(mash.ruleFired, 'EXCEPTION_INVALID_INPUT');
});

test('out-of-domain queries trigger polite domain guardrail while preserving user name', () => {
  const res = runExpertInference('What is the price of bitcoin today?', 'Aiman', false);
  assert.equal(res.analysis.detectedIntent, 'off_topic');
  assert.equal(res.ruleFired, 'EXCEPTION_OUT_OF_DOMAIN_GUARD');
  assert.ok(res.replyText.includes('Aiman'));
  assert.ok(res.replyText.includes('Wau Kangkang'));
});

test('diagnostic rule fires for kite flight issues and remembers user name', () => {
  const res = runExpertInference('My kite keeps spinning to the left when flying', 'Aiman', false);
  assert.equal(res.analysis.detectedIntent, 'flight_diagnosis');
  assert.equal(res.ruleFired, 'RULE_SPIN_ASYMMETRY');
  assert.ok(res.matchedDiagnosis !== null);
  assert.ok(res.replyText.includes('Aiman'));
  assert.ok(res.activeNodeIds.includes('sayap_frame'));
});
