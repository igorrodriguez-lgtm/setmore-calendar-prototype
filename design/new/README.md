# Setmore light refresh: design handoff

Calendar + Connect light refresh, exported 22 Oct 2026 from the design canvas and the dev spec doc.

## What's inside

| Folder | What it is |
|---|---|
| `CLAUDE.md` | Instructions for Claude Code. Copy it to the root of the app repo (or merge into the existing one). |
| `docs/` | The specs as Markdown (`calendar-spec.md`, `connect-spec.md`) and as PDF with every screenshot. |
| `screens/` | One PNG per design board, 1440×900. |
| `prototype/` | The clickable design boards. Run `python3 -m http.server 8000` in this folder and open `http://localhost:8000/index.html`. |
| `tokens/` | `tokens.css` (CSS variables + button rules) and `tokens.json` (same values). |

## How to use with Claude Code

1. Put this folder in the app repo as `design/` and copy `CLAUDE.md` to the repo root.
2. Start Claude Code in the repo and ask it to work through the list one item at a time, e.g. *"Read CLAUDE.md, then implement Calendar staging issue 1. Compare with design/screens/Calendar-Fix.png when done."*
3. Review each item before moving to the next.

## Notes

- The prototype boards are design markup with fake data and inline styles. They show **what** to build, not **how**: build with the app's own components and the tokens.
- Screenshots were rendered without the Geist web font, so letter shapes may differ slightly; sizes, spacing and colours are accurate.
- Live versions: design canvas https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889 and spec doc https://claude.ai/artifact/CXtmA67my7DSksNq1YB4ML (they may be newer than this export).

## Boards

- `Calendar-Fix-Address.png`: Calendar · New, saved addresses
- `Calendar-Fix-Calendars.png`: Calendar · Calendars chip
- `Calendar-Fix-Details.png`: Calendar · Event details
- `Calendar-Fix-Edit.png`: Calendar · Edit event
- `Calendar-Fix-Hover.png`: Calendar · Hover preview
- `Calendar-Fix-New.png`: Calendar · New defaults to Event
- `Calendar-Fix-Picker.png`: Calendar · Date picker
- `Calendar-Fix-Private.png`: Calendar · Private event
- `Calendar-Fix-Service.png`: Calendar · No services, with a way out
- `Calendar-Fix-Slot.png`: Calendar · New from a time slot
- `Calendar-Fix-Team-Large.png`: Calendar · Team day, 15 people
- `Calendar-Fix-Team.png`: Calendar · Team day
- `Calendar-Fix-View.png`: Calendar · More menu
- `Calendar-Fix-Zones.png`: Calendar · Time zones
- `Calendar-Fix.png`: Calendar · Work week
- `Connect-Fix-Doc.png`: Connect · Link cards
- `Connect-Fix-Group.png`: Connect · Details panel open
- `Connect-Fix-MsgDelete.png`: Connect · Delete a message
- `Connect-Fix-MsgDeleted.png`: Connect · Deleted message
- `Connect-Fix-MsgEdit.png`: Connect · Edit a message
- `Connect-Fix-MsgHover.png`: Connect · Message hover and reactions
- `Connect-Fix-MsgMenu.png`: Connect · Message menu
- `Connect-Fix-MsgReply.png`: Connect · Reply to a message
- `Connect-Fix-New.png`: Connect · New message
- `Connect-Fix-NewGroup.png`: Connect · New group
- `Connect-Fix-Search.png`: Connect · Search results
- `Connect-Fix-SearchEmpty.png`: Connect · No search results
- `Connect-Fix-Status.png`: Connect · Status with duration
- `Connect-Fix-Unread.png`: Connect · Unread and read
- `Connect-Fix.png`: Connect · Fixed
- `Home-Growth.png`: Home · After setup
- `Onboard-Client-Account.png`: Onboarding · Client saves booking
- `Onboard-Client-Home.png`: Onboarding · Client home
- `Onboard-Setup.png`: Onboarding · Business setup
- `Onboard-Who.png`: Onboarding · Who are you?
- `Onboard.png`: Onboarding · Light refresh
