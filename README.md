# Setmore calendar prototype

A clickable prototype of the Setmore **Calendar** page light refresh, built from shadcn
components styled with EDS (Setmore brand) tokens. See the full spec and design boards under
`design/`.

**Live preview:** https://setmore-calendar-prototype.vercel.app/?kit=new
**Repo:** https://github.com/igorrodriguez-lgtm/setmore-calendar-prototype (branch: `testing`)

## Run it locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000/?kit=new** — the `?kit=new` query selects the New (refreshed)
calendar. The toggle in the top-right lets you switch between four modes:

| Mode | What it shows |
| ---- | ------------- |
| `shadcn` | Vanilla shadcn components |
| `eds` | `@adaptavant/eds-core` components (Setmore brand) |
| `test` | A test-registry mirror of EDS used in the review |
| `new` | **The light-refreshed calendar you're reviewing** |

Nothing in `new` reaches the other three modes — styles are scoped under
`html[data-ds="new"]` and the Tailwind config at `tailwind.new.config.ts` only emits inside
that scope.

## What's built

Build order follows `design/docs/calendar-spec.md`. Boards from the prototype are referenced
in brackets.

1. **Work Week** — [`Calendar-Fix.png`] — 24h grid scrolled to working hours, non-work tint,
   cards sized 72/36/18px (1h/30m/15m), current-time line, sidebar collapse at &lt;1024px.
2. **Hover preview with Join** — [`Calendar-Fix-Hover.png`] — opens right for Mon–Wed, left
   for Thu–Fri; "Starts in Nmin" / "Happening now" / "Ended" (Join becomes outline).
3. **Event details side panel** — [`Calendar-Fix-Details.png`] — docked right (380px),
   Edit / ⋯ / Close header, title + time + source line + optional "Private" line, Join + copy,
   people with job titles and RSVPs, description, reminder, Booking ID (Setmore only).
   RSVP footer (Accept / Decline / Reschedule) pinned at the bottom when someone else organized.
   ⋯ menu: Duplicate, Copy meeting link, Cancel/Delete event (red).
4. **Calendars chip + ⋯ menu + Time zones** — [`Calendar-Fix-Calendars.png`, `Calendar-Fix-View.png`, `Calendar-Fix-Zones.png`] —
   one Calendars list (own calendars + team), View submenu with Day/Work/Week/Month/Team day,
   Time zones popover with rename + add + show/hide switch, triggered from the `+ EDT` header
   button or the ⋯ menu.
5. **New dialog** — [`Calendar-Fix-New.png`] — tabs (Event / Service / Class / Reminder),
   Event is the default; Service tab shows the "no services" empty state with Request access +
   Create event instead; Create primary button always visible.
6. **Date picker + Team Day + Private event** — [`Calendar-Fix-Picker.png`, `Calendar-Fix-Team.png`, `Calendar-Fix-Private.png`] —
   month picker (brand circle on selected, light tonal hover), Team Day view (Marine first,
   then Jillian / Xenia / Tomek / Julia), lock on private meeting + "Private · others only see
   'Busy'" line in the details panel.

### Known gaps (deferred by scope agreement)

| What | Why it's not in |
| ---- | --------------- |
| Audit 17 (Calendar settings panel) | Behind the ⋯ menu, deferred. |
| Audit 18 (New customer side panel, Book: find customer, Book: new customer) | Secondary action, deferred. |
| Audit 19 (Guest / Customer profiles inside the details panel) | Secondary, deferred. |
| Audit 20 (Overlay / "Only" mode for other people's calendars) | Needs its own state machine; deferred. |
| Day / Week / Month views | Share the Work Week grid filtered to the right day range (Q1 decision). |
| Team Day — 15 person stress test | 5 people only. |
| Private "Busy" rendering in Team Day | Owner view only (shows lock + "Private"). |

Everything else from staging issues 1–20 is folded into the 6 build-order steps above.

## Where the code lives

```
src/components/new-ui/
  NewCalendarApp.tsx         everything above; one file by design
  intl.tsx                   Intl.DateTimeFormat helpers (AM/PM style)
  ui/                        shadcn primitives (unchanged)
tailwind.new.config.ts       scoped to html[data-ds="new"]
src/app/new-ui.css           @config link + base/components/utilities
design/
  docs/                      specs (Markdown + PDF with screenshots)
  prototype/                 clickable prototype boards (fake data, don't copy markup)
  screens/                   one PNG per board, 1440×900 / 1024×768 / 390×844
  tokens/tokens.css          design tokens (brand / tonal / radii / sizes)
  boards.json                every board as [file, title, width, height]
```

## Spec rules worth re-reading before you change anything

1. Use existing components (buttons, menus, popovers, inputs, avatars) — don't fork copies.
2. Never hard-code colours. Brand colour comes from EDS Setmore tokens.
3. 14px default type; only 12 / 14 / 16 / 18 / 24 / 32 (+11 badge).
4. Dates and times are not hard-coded formats — use `intl.tsx` helpers.
5. One primary button per view. Primary hover/pressed = black overlay (12% / 20%).
6. Every icon-only button gets a ghost style, hover fill, focus ring, and tooltip.

## Branch

Work lives on the **`testing`** branch so `main` keeps the design-system comparison harness
untouched.

```bash
git checkout testing
```

## Contact

Design: **Igor Rodriguez** · igor.rodriguez@anywhere.co
Spec authors: **Marine Lasserre** (Calendar + Connect specs under `design/docs/`)
