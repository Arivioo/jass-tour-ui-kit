# Jass-Tour auth emails sent people to their own machine

**Date:** 2026-09-01
**Board item:** `a-new-jass-tour-signup-email-sends-people-to-a-web-addre`
**Supabase project:** `uyksotlmrlxhmyeopktl`
**Fixed by:** a settings change on the Supabase project — **not** a repository change.

---

## What was wrong

Every mail Supabase Auth sends for this project — confirmation, password recovery, magic link,
invite — builds its link from `{{ .ConfirmationURL }}`, which GoTrue expands against the project's
**`site_url`**. That setting read:

```
site_url        = "http://localhost:3000"
uri_allow_list  = ""            (empty)
```

So the link in the email handed the recipient **their own machine**, on a port where nothing is
listening.

| address | observed |
|---|---|
| `http://localhost:3000` | **000** — nothing listening |
| `https://beize-jass-tour.mueller.ro` | **200** |

The empty `uri_allow_list` made it worse than a typo: GoTrue refuses any `redirect_to` that is not
on the allow-list and falls back to `site_url`. **A repo-side `emailRedirectTo` would therefore not
have fixed it** — it would have been rejected and fallen back to localhost anyway.

## Why no gate caught it

`site_url` lives in the Supabase project's auth config, not in this repository. Lint, unit tests,
the build, the Playwright critical path, gitleaks, semgrep and the deploy's site-id guard were all
green throughout, because none of them can see it. There was nothing to catch.

## The fix

```
site_url       = https://beize-jass-tour.mueller.ro
uri_allow_list = https://beize-jass-tour.mueller.ro/**,
                 https://beize-jass-tour.mueller.ro,
                 http://localhost:3000/**,
                 http://localhost:5173/**
```

localhost is kept **on the allow-list** so local development still works — it is just no longer the
default that strangers get posted to.

The live address is confirmed as this project's own site: the deployed bundle at
`https://beize-jass-tour.mueller.ro` references project ref `uyksotlmrlxhmyeopktl`, and the deploy
workflow mirrors into `/Beize-Jass-Tour.mueller.ro/` behind a site-id guard.

## Proof

Asked GoTrue itself where it would send somebody, with an invalid token — the redirect target is
chosen from `site_url` before the token is judged:

```
GET https://uyksotlmrlxhmyeopktl.supabase.co/auth/v1/verify?token=probe-not-a-real-token&type=signup
Location: https://beize-jass-tour.mueller.ro#<error fragment>
```

Before the change that Location was `http://localhost:3000`.

`test/auth-email-links.test.mjs` makes that permanent. It needs **no credentials** — the verify
endpoint answers an unauthenticated request, and the redirect target is the whole answer — so it
can run anywhere, any number of times:

```
ok - an auth email link lands on https://beize-jass-tour.mueller.ro
ok - https://beize-jass-tour.mueller.ro answers HTTP 200
```

---

## Two things found next to this, deliberately NOT changed

**1. Signup confirmation mail is not sent at all.** `mailer_autoconfirm = true` on this project, so
a new signup is confirmed automatically and **no confirmation email is sent** — while
`src/pages/Auth.tsx:207-213` tells the user *"Prüfe deine E-Mail für den Bestätigungslink."*
So the board item's headline is half right in an unexpected way: the broken address was real and
was reaching people, but through the **recovery / magic-link / invite** mails, not the signup one,
because the signup one does not exist.

Turning autoconfirm off would start requiring confirmation and change how every new player signs
up. That is a product decision, and it interacts with the next point.

**2. Two emails per hour, total.** `rate_limit_email_sent = 2` with `smtp_host = None` — the stock
GoTrue cap for projects with no custom SMTP. Requiring email confirmation on top of that would cap
signups at two an hour. If confirmation is ever switched on, custom SMTP has to come first.

Both are written up for a separate session rather than decided here.
