# Setmore light refresh: Calendar + Connect

You are implementing a design refresh of the existing Setmore web app (Calendar and Connect pages).
This is a **light refresh, not a redesign**: keep the current layout, navigation, data flow and components; change what the specs describe.

## Sources of truth (read before coding)

- `design/docs/calendar-spec.md`: Calendar spec. The **"Implementation review (staging)"** and **"New design changes to build"** sections at the bottom are the work list; the sections above them are the full spec they link to.
- `design/docs/connect-spec.md`: Connect spec (link cards, chat header, new message, status, search, unread/read, message actions, tab title).
- `design/docs/*.pdf`: same specs **with all screenshots** (staging vs design). Use them when the Markdown says "Screenshot: …".
- `design/screens/*.png`: one screenshot per design board (1440×900). Compare your result to these.
- `design/prototype/`: the clickable design boards. Run `python3 -m http.server 8000` inside it and open `http://localhost:8000/index.html`. Prototype code only: **do not copy its markup or inline styles into the app.**
- `design/tokens/tokens.css`: colours, type scale, radii, hover rules.

## Rules

1. **Use existing components** (buttons, menus, popovers, inputs, avatars) and restyle them with the tokens. Don't create one-off copies.
2. **Never hard-code colours.** Brand colour comes from `--brand` / `--brand-tonal` / `--brand-on-tonal` (each business picks its own brand colour). Presence colours are fixed and only used for presence.
3. **Type scale:** 14px default; only 12 / 14 / 16 / 18 / 24 / 32 (+11px inside small badges).
4. **Dates and times are never hard-coded formats.** Use `Intl.DateTimeFormat` with the person's locale and time zone (see "Date format" in the Connect spec). AM/PM: no space, ~2px smaller.
5. **One primary (brand) button per view.** Hover/pressed on primary = black overlay (12% / 20%), never a second colour.
6. **Every icon-only button** gets the ghost style, a hover fill, a focus outline and a tooltip (same text as its `aria-label`).
7. Accessibility: keyboard reachable, visible focus, labels on inputs, colour never the only signal (presence uses glyphs).

## How to work

- Go **one numbered item at a time** (staging issues 1–13, then "New design changes to build" 1–16, then Connect sections in order).
- For each item: read the spec section → find the existing code → implement → run the app → screenshot the same state → compare with `design/screens/` → fix differences → next item.
- Don't refactor unrelated code. If a spec rule conflicts with existing behaviour or data, stop and ask.
- Open questions to engineering are listed in the Calendar spec ("Open questions to engineers"); don't guess those.
