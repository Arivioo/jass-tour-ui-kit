#!/usr/bin/env node
/**
 * auth-email-links.test.mjs :: the link in an auth email must land on the live site.
 *
 * WHY THIS EXISTS. Every mail Supabase Auth sends for this project - confirmation, password
 * recovery, magic link, invite - expands {{ .ConfirmationURL }} against the project's `site_url`.
 * That setting read `http://localhost:3000` from the day the project was created until
 * 2026-09-01, so every one of those links handed the recipient THEIR OWN MACHINE, where nothing
 * is listening. A person who asked to reset their password got a dead link and no way to tell why.
 *
 * Nothing could catch this from a push: `site_url` lives in the Supabase project's auth config,
 * not in this repository, so lint, tests, build and the deploy gates were all green throughout.
 * This file is the check that was missing - it asks GoTrue itself where it would send somebody.
 *
 * It needs NO credentials: the verify endpoint answers an unauthenticated request with a redirect,
 * and the redirect target is the whole answer. Safe to run from anywhere, any number of times.
 *
 * Run:  node test/auth-email-links.test.mjs
 */
import assert from 'node:assert'

const PROJECT_REF = 'uyksotlmrlxhmyeopktl'
const LIVE_SITE = 'https://beize-jass-tour.mueller.ro'

let pass = 0
const ok = (m) => { console.log('  ok -', m); pass++ }

// 1) Where does GoTrue send somebody who clicks a link in one of our emails?
// A deliberately invalid token is enough: the redirect TARGET is chosen from the project's
// site_url / redirect allow-list before the token is ever judged, which is exactly what is
// being tested. Nothing is created and no mail is sent.
const res = await fetch(
  `https://${PROJECT_REF}.supabase.co/auth/v1/verify?token=probe-not-a-real-token&type=signup`,
  { redirect: 'manual' },
)
const location = res.headers.get('location')
assert.ok(location, `the verify endpoint returned no Location header (HTTP ${res.status})`)

// Compare the ORIGIN, not the whole string: the fragment carries an error description that is
// allowed to change, and asserting on it would make this test fail for the wrong reason.
const target = new URL(location)
const expected = new URL(LIVE_SITE)

assert.notStrictEqual(target.hostname, 'localhost',
  'auth emails still point at localhost - the recipient gets their own machine, where nothing is listening')
assert.strictEqual(target.origin, expected.origin,
  `auth emails point at ${target.origin}, not ${expected.origin}`)
ok(`an auth email link lands on ${target.origin}`)

// 2) And that address actually serves something. "Not localhost" is not the same as "works".
const site = await fetch(LIVE_SITE, { redirect: 'follow' })
assert.ok(site.ok, `${LIVE_SITE} answered HTTP ${site.status}`)
ok(`${LIVE_SITE} answers HTTP ${site.status}`)

console.log(`\n${pass} checks passed.`)
