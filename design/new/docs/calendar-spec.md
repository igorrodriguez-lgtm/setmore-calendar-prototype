# Calendar updates: Dev spec

Oct 15, 2026 · @Marine

> **Developers, start here:** the list of what to fix and build is at the bottom of this doc.
>
> - Implementation review (staging): bugs found on staging, numbered, each with a staging screenshot, the design and the expected behaviour.
> - New design changes to build: design changes and new features added during the review.
>
> The sections in between are the full spec they link to.

## Overview

These are fixes inside today's Calendar, not a redesign: the layout and navigation stay, with a light refresh of spacing and type. Each change maps to a finding in the [Setmore UX/UI Audit](https://docs.google.com/document/d/19peTJaEHB7KbyW0nqNCDRHlohCyNMBjQpVjjnO2R_fU/edit?tab=t.0#heading=h.ed0bxv1lia1p).

The interactive designs are on the [design canvas](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889), in the row "Calendar · Audit fixes (light refresh)". Each board can be clicked through:

| Board | What it shows |
| --- | --- |
| Calendar · Work week | The default week view |
| Calendar · Hover preview | Hover card with Join |
| Calendar · Event details | Side panel after clicking a meeting |
| Calendar · Calendars chip | One Calendars list with search |
| Calendar · Team day | Everyone's calendar side by side for one day |
| Calendar · Team day, 15 people | A large team with sideways scrolling |
| Calendar · More menu | The ⋯ menu |
| Calendar · New defaults to Event | New dialog |
| Calendar · New, saved addresses | Location picker with the default and saved addresses |
| Calendar · No services, with a way out | Empty state on the Service tab |
| Calendar · Time zones | Extra time zones: rename, search, show / hide switch |
| Calendar · New from a time slot | New dialog opening next to the clicked slot |
| Calendar · Date picker | Month picker: green selected date, light green hover, bold weekdays |
| Calendar · Edit event | Edit form inside the details panel |
| Calendar · Private event | Your private meeting, and how others see it as Busy |

The canvas has one link for all boards: each link above opens it, then find the board by its title in the "Calendar · Audit fixes (light refresh)" row. Every screenshot below names its board the same way.

All names, meetings and times in the designs are sample data.

## Toolbar, calendars chip and ⋯ menu

The week gets the full width: the "Your calendars" side panel is removed, and the toolbar keeps only what people use every day. [Audit 09, 10, 11, 16](https://docs.google.com/document/d/19peTJaEHB7KbyW0nqNCDRHlohCyNMBjQpVjjnO2R_fU/edit?tab=t.0#heading=h.ed0bxv1lia1p).

> 🖼 Screenshot: Calendar work week: Today as a ghost button, arrows and an 18px date title; day headers with date and weekday only; Calendars chip, New and more menu on the right; Time clock in the sidebar (see the PDF version or `screens/`)

Board: [Calendar · Work week](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

**Toolbar, left to right:** Today, previous / next arrows, then the date range with a dropdown caret (e.g. "Sep – Oct 2026 ▾", opens a date picker); on the right: Calendars chip, New (primary), ⋯ (more). Today and the arrows are ghost buttons: no border, 32px high, 8px radius, light grey (#f1f1f1) on hover. Today, the arrows and the date title share one centre line. The date title is 18px semibold.

**Date picker:** clicking the date title opens a month picker underneath it (300px wide, 16px radius, light shadow). The title button gets a light grey background while it is open.

- Header: month and year ("October 2026", 15px semibold) with ghost < > arrows to change month.
- Weekday letters M T W T F S S, Monday first, **bold** (12.5px, 700, #161616) so they read clearly.
- **Selected date:** brand green circle (#2f6a4a) with a white, semibold number.
- **Hover:** light green circle (#e8efe9) with a dark green number (#1f4a33).
- **Today**, when another date is selected: a thin green ring (1.5px #2f6a4a) and a semibold number.
- Days from the previous or next month: light grey (#b5b5b5), still clickable.
- Day circles are 34px. Clicking a date moves the calendar there and closes the picker.

> 🖼 Screenshot: Date picker open under the date title: bold weekday letters, 2 October in a brand green circle, 14 October in the light green hover shade, other-month days in light grey (see the PDF version or `screens/`)

Board: [Calendar · Date picker](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

**Removed from the toolbar:** the "Your calendars" panel and its collapse, the Eastern Time button, the Work week button, the Share button.

**Calendars chip**

- Shows a small coloured dot per visible calendar, the label "Calendars" and a chevron.
- Opens one list titled "Calendars" with every calendar the user can see, in this order: their own calendars (Setmore, connected Google), shared calendars (e.g. Design team), then each team member. Each row: checkbox, avatar or calendar badge, name and type ("Setmore calendar", "Google Calendar", "Shared calendar", "Team member").
- Ticking a row shows or hides it right away. Team members are the columns in Team day.
- A search field ("Search calendars and people") appears at the top once the list has more than 6 rows; it filters by name and type and shows "No calendars match" when empty.
- "See side by side" in the list header opens Team day; in Team day it reads "Back to my week".
- Last row: "Connect & manage in Settings", linking to calendar settings. Connecting a calendar no longer happens in the main view.
- Only one popover is open at a time: opening the chip closes the ⋯ menu and the New dialog.

> 🖼 Screenshot: Calendars dropdown: one list with search, own calendars, shared calendar and team members, See side by side in the header (see the PDF version or `screens/`)

Board: [Calendar · Calendars chip](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

**⋯ menu**

| Group | Item | Behaviour |
| --- | --- | --- |
| View | Day / Work week / Week / Month | Switches the view; current one highlighted. Work week shows its range (e.g. Mon–Fri) on the right |
| View | Team day | One column per staff member for one day (see Team day below) |
| Settings shortcuts | Working days | Shows current days (Mon–Fri); opens working-days settings |
| Settings shortcuts | Time zone | Shows current zone (Eastern · EDT); opens time zone settings |
| Settings shortcuts | Show more time zones | Opens the Time zones popover: up to 9 extra zones, rename, search, one show / hide switch (see More time zones above) |
| Actions | Share calendar | Copies the calendar link, confirms with a toast |
| Actions | Calendar settings | Opens calendar settings |

> 🖼 Screenshot: More menu open: view (including Team day), working days, time zone, show more time zones, share calendar, calendar settings (see the PDF version or `screens/`)

Board: [Calendar · More menu](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

**Working days (**[audit 11](https://docs.google.com/document/d/19peTJaEHB7KbyW0nqNCDRHlohCyNMBjQpVjjnO2R_fU/edit?tab=t.0#heading=h.ed0bxv1lia1p)**):** Work week is the default view and shows only the working days set in Settings (default Mon–Fri). Week still shows all 7 days, so bookings on other days are never hidden.

**Time zone (**[audit 16](https://docs.google.com/document/d/19peTJaEHB7KbyW0nqNCDRHlohCyNMBjQpVjjnO2R_fU/edit?tab=t.0#heading=h.ed0bxv1lia1p)**):** no longer in the toolbar. The grid's time column keeps a small zone label (EDT) above the hours.

**More time zones.** People can show up to 9 extra time zones next to their own, so when planning with someone abroad they see that person's hours at a glance.

- **Open it:** click the zone label above the hours (when there is only one zone it reads "+ EDT": a ghost plus, no border, left of the label and aligned with it), or "Show more time zones" in the ⋯ menu.
- **Popover "Time zones":** the user's own zone first ("Your time zone": a name field, "Eastern Time (UTC−4)" and a "Change in Settings" link; the zone itself is changed in Settings), then each extra zone with an editable name, its city and abbreviation, its current time, and a remove button. "Add a time zone" opens a search field. Typing "P" lists every city starting with P (Paris, Perth, Phoenix, Porto, Prague, Pune…) with the typed letters in bold; typing "Paris" narrows to Paris. Search works both ways: by place or by time zone. Results come in this order: cities starting with the text; zone abbreviations starting with it ("CEST" lists Berlin, Madrid, Paris, Prague; "P" also brings in PDT, Los Angeles); full zone names ("Central European Summer Time" or just "central eu"); then countries ("Portugal" lists Lisbon and Porto). Full names and countries match from 3 letters; matching ignores upper/lower case. Each result shows the city, a second line with country, abbreviation and full zone name (e.g. "France · CEST, Central European Summer Time"), and its current time; clicking one adds it without a name, so its label shows the zone abbreviation until someone renames it. No match shows "No city, time zone or country matches …".
- **Rename:** the user's own zone and each extra zone's name field shows the abbreviation as a placeholder (e.g. "IST (add a name)"). Typing a name, e.g. "Jillian" for London, makes the column read as a person (or "Me" for your own zone); clearing it goes back to the abbreviation.
- **Show or hide:** one "Show additional time zones" switch at the top of the popover (under the user's own zone) shows or hides all extra columns at once. Turning it off keeps every zone and its name saved; the header shows only your own zone ("EDT", or its name) and the ⋯ menu item reads "Hidden". Turning it on brings them all back. There is no per-zone show/hide.
- **Quick show / hide in the grid:** as soon as at least one extra zone exists, a small round handle sits on the divider between the hours and the first day, on the bottom edge of the header row (22px tall, white, 1px #dcdcdc border). With the zones shown it's a ‹ chevron ("Hide other time zones"); one click collapses to your own zone only. Collapsed, it reads "+2 ›" (the number of hidden zones, "Show 2 other time zones"); one click brings them back. It controls the same setting as the switch in the popover, and the choice is remembered. With no extra zones there is no handle, only the ghost "+ EDT".
- **In the grid:** each extra zone gets its own narrow hour column (56px, light grey) to the left; the user's own zone stays next to the grid. Header labels are always one line: the name if the zone was renamed ("Jillian"), otherwise the zone abbreviation ("IST", "EDT"). The zone is never shown under the name. Labels are regular weight (not bold) and vertically centred in the header row, like the day labels. Half-hour offsets show minutes (e.g. 6:30 PM for India).
- **Current time:** every zone column shows its own current time in a small outline pill on the time line; the user's zone keeps the black pill.
- **Saved per user:** extra zones and their names are remembered for that person, and follow daylight saving changes automatically.

> 🖼 Screenshot: Time zones popover: your own zone renamed Me, the show switch on, Jillian and IST columns, and the search open with P typed (see the PDF version or `screens/`)

> 🖼 Screenshot: The same popover with the switch off: the extra columns are hidden, the header shows only your zone, and the handle reads +2 (see the PDF version or `screens/`)

> 🖼 Screenshot: Quick show / hide handle on the header divider: left, extra zones shown with a ‹ handle; right, collapsed to EDT only with a +2 › handle (see the PDF version or `screens/`)

> 🖼 Screenshot: Time zones search with CEST typed: Berlin, Madrid, Paris and Prague, each with the full zone name (see the PDF version or `screens/`)

Board: [Calendar · Time zones](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

## Team day: everyone side by side

A business can see all its staff calendars at once: Team day shows one column per person for a single day, instead of one column per day. A salon with five stylists sees five columns for today.

> 🖼 Screenshot: Team day: one column per person, lightly tinted in that person's colour, with soft meeting cards in the same colour; the first column reads Marine (see the PDF version or `screens/`)

Board: [Calendar · Team day](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

- **How to open it:** "See side by side" in the Calendars dropdown, or Team day in the ⋯ menu's View list. "Back to my week" in the same place returns to the user's own week.
- **Who shows:** the team members ticked in the Calendars list get a column; the current user's column always shows.
- **Column header:** avatar, first name and no event count. The current user's column is always first and shows just their first name ("Marine"), with no "(you)": the position and their own photo already make it clear, and it keeps headers short when columns narrow. "(you)" stays in people lists (meeting details, Calendars list). The avatar is the person's photo when they have one, otherwise the letter placeholder (see Avatars under Visual system).
- **Date:** the header shows the single day (e.g. "Friday, 2 October 2026"); previous / next move one day at a time.
- **Shared meetings** appear in each attendee's column. A card's people line lists the other attendees, not the column's owner.
- **Everything else works the same:** Join chip, hover card, details panel, current-time line across all columns.
- **New** from Team day prefills the column's person as the staff member (for a booking) or guest (for an event).

**Colour by person.** In Team day, colour shows whose column it is, not which calendar a meeting comes from:

- Each staff member has their own colour, also used for their avatar and their checkbox in the Calendars list.
- The whole column is tinted with that colour at 5%, so it stays very light.
- Every meeting in the column uses the same colour, kept soft: fill at 14%, left bar at 70%, text in a darker shade. The moss / lake / clay calendar colours apply only to the user's own week.
- Cards have no outline or white border; only a selected card gets a 2px green ring.

| Person (sample) | Colour |
| --- | --- |
| Marine | #c0703f (terracotta) |
| Jillian | #4f7f3f (moss) |
| Xenia | #a8475e (berry) |
| Tomek | #3d76a0 (lake) |
| Julia | #a88a2e (ochre) |

Neighbouring columns can be hard to tell apart for colour-blind users (e.g. terracotta next to moss), so the name and avatar in each column header always identify the person. Colours are assigned from a fixed list in staff order and the admin can change them in Settings.

**Large teams.** Columns have a minimum width of 160px instead of a fixed maximum count. Below that, the grid scrolls sideways, so a 1440px screen shows about 7 people and a bigger screen shows more.

- Scrolling snaps to whole columns, so no one is ever cut in half.
- The hours column, the row of names and avatars, and the current-time line stay pinned while scrolling.
- A people count chip next to the date (e.g. "15 people") and a soft fade on the right edge show there are more columns.
- The chip and fade appear only when the columns don't fit. Measure the space actually available (it shrinks when the menu or the details panel is open); don't assume a screen size.
- Column headers have no event count, so the name has room.
- The Calendars list (with search) is the way to narrow down who shows.

Why a minimum width rather than a fixed number of columns: a fixed count would be too narrow on a laptop and leave space unused on a large monitor, while 160px always fits a card's title, time and one guest line. Squeezing everyone to fit, or paging people in groups of 7, were considered and dropped: the first makes titles unreadable past about 10 people, the second stops people being compared across pages.

> 🖼 Screenshot: Team day with 15 people: 7 columns fit, a fade on the right edge and a 15 people chip next to the date (see the PDF version or `screens/`)

> 🖼 Screenshot: The same view scrolled sideways: hours and names stay pinned while later columns come into view (see the PDF version or `screens/`)

Board: [Calendar · Team day, 15 people](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) (scroll it sideways on the canvas)

## Event cards and current time

Every card shows its time and who is in it, so people don't have to open it. [Audit 08](https://docs.google.com/document/d/19peTJaEHB7KbyW0nqNCDRHlohCyNMBjQpVjjnO2R_fU/edit?tab=t.0#heading=h.ed0bxv1lia1p).

**Card content by length**

| Event length | Line 1 | Line 2 | Line 3 |
| --- | --- | --- | --- |
| 15 min or less | Title (+ video icon) | — | — |
| 30 min | Title + video icon | Start time · people (e.g. "9AM · Jillian") | — |
| 45 min or more | Title + video icon | Time range (e.g. "10 – 11AM") | Up to 3 avatars + names (e.g. "Xenia, Naresh +3") |

- People = guests other than the current user. Two names max, then "+N". Only the user → "Just you".
- The video icon shows when the event has a meeting link. It's an outline video camera (rounded body + lens), the same icon as the call button in Connect, used on cards, the Join chip and the Join Google Meet button.
- Text truncates with an ellipsis; the title never wraps.
- Past events keep their full colour; they are not faded or greyed out.
- A selected event (details panel open) gets a 2px green ring.
- Card colours come from the calendar (see Visual system).

**Day headers:** date number and weekday only, no event count. Today's number sits in a green circle.

**Current time:** a 2px black line across today's column, with a dot at the left and a black time label (e.g. 9:34) in the hours column. It replaces the red line.

## Joining meetings

Joining a Google Meet takes one click from the card, the hover card or the details panel. [Audit 07](https://docs.google.com/document/d/19peTJaEHB7KbyW0nqNCDRHlohCyNMBjQpVjjnO2R_fU/edit?tab=t.0#heading=h.ed0bxv1lia1p).

**Join chip on the card**

- Shows on events with a meeting link that are live now or start within 15 minutes.
- Replaces the video icon; small pill with a video icon and "Join", secondary style (white, green text, light green border).
- Click opens the meeting link in a new tab.

**Hover card** (shows on hover, no click needed)

- Opens beside the card: to the right for days in the left half of the week, to the left otherwise.
- Contents, top to bottom: calendar colour square, title, date and time in your own time zone with no zone label, status line ("Starts in 11 min", "Happening now" or "Ended").
- Then "Join Google Meet" (secondary button, full width) + copy-link button. No URL line under them: the copy button's tooltip shows it ("Copy link · meet.google.com/…").
- Then guests with their role (Organizer), the description, and the source ("From Google Calendar").
- For an event that has ended, Join becomes an outline button.
- Hidden while that event's details panel is open.

> 🖼 Screenshot: Hover card on a meeting starting in 11 minutes: Friday 2 Oct · 9:45AM – 10:15AM with no zone label, Join Google Meet and the copy button (see the PDF version or `screens/`)

Board: [Calendar · Hover preview](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

## Meeting details panel

Clicking a meeting opens a 380px side panel on the right, next to the week (not over it), with everything needed to join, respond and see who is coming. [Audit 07](https://docs.google.com/document/d/19peTJaEHB7KbyW0nqNCDRHlohCyNMBjQpVjjnO2R_fU/edit?tab=t.0#heading=h.ed0bxv1lia1p).

> 🖼 Screenshot: Meeting details side panel: no title in the header, "From Google Calendar" in small grey under the time, Join Google Meet and the copy button, ghost Accept / Decline / Reschedule, people, description and the reminder line (see the PDF version or `screens/`)

Board: [Calendar · Event details](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

**Header:** only Edit, More (⋯) and Close (×), right-aligned, with no title. Where the meeting comes from is shown under the time, and only when it matters: "From Google Calendar" for synced meetings or the shared calendar's name ("Design team calendar"), 12px grey with a small calendar icon. Meetings on your own Setmore calendar show no source line. Close returns the week to full width.

**Body, top to bottom**

1. Colour square + title, date and time ("Friday 2 Oct · 9:45AM – 10:15AM"), and a status pill when relevant ("Starts in 11 min", "Happening now", "Ended").

   Times are always shown in your own time zone, so there's no "EDT" after them; the zone is set in Settings and already labelled above the hours. Only the Edit form names the zone, since that's where it can be changed.
2. "Join Google Meet" (secondary, full width) + copy link button (tooltip "Copy link · meet.google.com/…", click shows a "Link copied" toast). No URL line under the button: Join and Copy already cover it, and the tooltip lets people check which meeting it is. Only for events with a link.
3. Response row (when someone else organized the meeting), with no grey box around it:
   1. Question that reflects the current answer: "Are you going?", "You're going", "You declined", "You suggested a new time". Shown as a small label above the buttons (12px, grey).
   2. Three ghost buttons, each with a 15px icon: Accept (check), Decline (cross), Reschedule (calendar). 32px tall, 8px radius, no border, grey text (#4a4a4a), left-aligned with the text above. The chosen one gets the light green fill (#e8efe9) with dark green semibold text, still no border.
   3. Reschedule opens a short list of suggested times that work for everyone invited (e.g. "Today, 11:30AM", "Mon 5 Oct, 10:00AM") and a "Send suggestion" button. Sending notifies the organizer and shows a toast: "New time suggested to Hannah".
4. When the user organized the meeting, the response row is replaced by two ghost buttons with icons, styled the same way: Reschedule (calendar icon) and Cancel event (crossed-circle icon).
5. People: "N people", then one row each: avatar, name, job title, and their response on the right (Organizer, Accepted, Declined, Not answered). Job titles come from AnywhereWorks profiles; when someone has none, the line is simply hidden. Customers (e.g. a salon client on a booking) never show one. The organizer is listed first; the user shows as "Marine Lasserre (you)". Avatars show the person's photo when there is one, otherwise the letter placeholder.
6. Description (when the event has one).
7. Footer line: reminder ("Reminder 10 minutes before"). No "Organized by" line: the organizer is already shown in the people list with the "Organizer" label.

**Behaviour**

- Clicking another event swaps the panel's content.
- Opening New, the Calendars chip or ⋯ closes the hover card; opening New closes the panel.
- Responses update the user's own row in the people list right away.

## New appointment and no-services empty state

Creating something never looks blocked: New opens on a type the user can actually create, and the empty state offers a way out. [Audit 12, 13](https://docs.google.com/document/d/19peTJaEHB7KbyW0nqNCDRHlohCyNMBjQpVjjnO2R_fU/edit?tab=t.0#heading=h.ed0bxv1lia1p).

**New dialog**

- Tabs in this order: Event, Service, Class, Reminder.
- The default tab is a setting: the business chooses Event, Service or Class in Settings.
- If the default type has nothing the user can book (e.g. no services assigned to them), New opens on Event instead, with a hint next to Create: "Event is your default. You have no services yet."
- Event fields: title, date and time with time zone, Add guests, Location, "Google Meet link" switch (on by default), "Private" switch (off by default, see Private meetings), Notes for guests. Create is the primary button.
- While the dialog is open, a placeholder block shows the new event's slot in the grid.
- Create adds the event and shows a toast ("Event created for Fri 2 Oct, 12:00 PM").

**Where the dialog opens:** from the New button, under the button. From an empty time slot, next to that slot (right of the column for the left half of the week, left of it for the right half), with the slot's day and time filled in. See issue 4 in the Implementation review.

**Saved addresses**

People never retype their address: the location of a new appointment or event defaults to the business address entered in Settings, and can be changed when needed.

- The Location row shows the selected address (name + street) and a "Change" link.
- Change opens the list of saved addresses as radio options. The default one carries a "Default" tag.
- Businesses with several locations save each one (name + address) and pick it per booking.
- "Add an address" opens a name field and an address field; "Save address" adds it to the saved list and selects it.
- Saved addresses, and which one is the default, are managed in Settings.

> 🖼 Screenshot: New dialog with the Location row open: Main location selected as default, Second location, and Add an address (see the PDF version or `screens/`)

Board: [Calendar · New, saved addresses](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

> 🖼 Screenshot: New dialog opening on Event, with Location set to the business address and the placeholder slot in Friday's column (see the PDF version or `screens/`)

Board: [Calendar · New defaults to Event](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

**Service or Class tab with nothing assigned**

- Title: "You're not assigned to any services yet" ("classes" on the Class tab).
- Text names the account admins: "An admin decides which services you can book. Your admins are Jillian and Alicia."
- Two actions: "Request access" (primary) and "Create an event instead" (outline, switches to the Event tab).
- Request access sends the admins a message in Connect, then the button reads "Request sent" and the note confirms who was messaged.

> 🖼 Screenshot: Service tab with no services assigned: Request access or Create an event instead (see the PDF version or `screens/`)

Board: [Calendar · No services, with a way out](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

## Time clock (sidebar)

"Start timer 00:00:00" read like a kitchen timer. It is really for hourly staff (e.g. phone agents) who clock in and out of a shift, so it is renamed to **Time clock**, the usual name for this in tools like Homebase, Gusto and Deputy, with **Clock in / Clock out** as the action. The same block sits at the bottom of the sidebar in Calendar and Connect.

> 🖼 Screenshot: Time clock in the sidebar: clocked out with a tonal Clock in button (left), on shift with a Clock out button (right) (see the PDF version or `screens/`)

- **Clocked out:** clock icon, "Time clock", a grey dot with "Clocked out", and a tonal **Clock in** button.
- **On shift:** the row gets a light green background, a green dot with "On shift" (hovering shows "Clocked in at 9:02AM"), and an outline **Clock out** button.
- Clicking the button switches state right away and records the clock-in / clock-out time for timesheets.
- The old running counter (00:00:00) is removed: the start time matters more than a ticking number.

## Private meetings

People can mark a meeting as private, for example a doctor's appointment they want on their calendar without colleagues seeing the details. Everyone else only sees that they're busy.

- **Where it's set:** a "Private" switch with a lock icon in the New dialog and in Edit ("Others only see “Busy”, no details"). Off by default.
- **What the owner sees:** the meeting as normal, with a small lock before the title on the card. When there are no guests, the card says "Private" where it would otherwise say "Just you" (e.g. "12PM · Private"). The details panel shows "Private · others only see “Busy”" under the time.
- **What everyone else sees** (Team day, side-by-side calendars, shared calendars): a grey block (#f2f2f2, grey bar #b5b5b5) with only the word "Busy" and the time. No lock icon, so it stays discreet. No title, guests, location, meeting link or notes. It can't be hovered or opened.
- Private meetings still block the time, so they count as busy for scheduling and reschedule suggestions.

> 🖼 Screenshot: Marine's own private Dentist appointment on her Setmore calendar: no source line, Private · others only see Busy, and ghost Reschedule and Cancel event buttons (see the PDF version or `screens/`)

> 🖼 Screenshot: A private event created for yourself: lock before the title Dr and 12PM · Private on the card (see the PDF version or `screens/`)

> 🖼 Screenshot: Team day: Xenia's private appointment shows to others as a plain grey block reading only Busy and 12:30 – 1:30PM, with no lock (see the PDF version or `screens/`)

Board: [Calendar · Private event](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889); the Busy block is also on Calendar · Team day.

## Visual system

One primary button per view, so actions don't compete; black fills are no longer used for buttons. Calendar colours move to a neutral nature palette around the Setmore green.

**Brand colour (not hard-coded).** Each business can pick its own brand colour. The green in the mockups (#2f6a4a) is only the default. Wherever this doc says "brand green" or uses #2f6a4a, #e8efe9 or #1f4a33, build it from three tokens worked out from the business's colour, never as fixed hex values:

| Token | Mockup value | How to get it from any brand colour | Used for |
| --- | --- | --- | --- |
| `--brand` | #2f6a4a | The colour the business picked | Primary buttons (New, Create, Save, Send), selected date, today's circle and ring, selected-card ring, focus outlines, unread badge |
| `--brand-tonal` | #e8efe9 | `color-mix(in srgb, var(--brand) 10%, white)` | Tonal buttons (Join, Clock in), date picker hover, selected Accept, the active nav item |
| `--brand-on-tonal` | #1f4a33 | `color-mix(in srgb, var(--brand) 70%, black)` | Text and icons on the tonal fill |

- **Text on the brand colour:** white by default. If white on `--brand` is under 4.5:1 contrast (a light brand such as yellow or light blue), use dark text (#161616) instead. Check this once when the business picks its colour.
- **Hover and pressed:** black overlay on top (12% / 20% on primary buttons), never a second colour, see Primary buttons below.
- **Not brand:** calendar colours on event cards, Team day person colours, presence dots and status colours (red, amber) keep their own palettes, whatever the brand colour.
- Test the screens with at least one dark, one bright and one light brand colour before release.

**Button levels**

| Level | Use | Background | Text | Border |
| --- | --- | --- | --- | --- |
| Primary | One per view: New in the toolbar; Create / Request access inside a dialog | #2f6a4a | #ffffff | none |
| Secondary | Join Google Meet, Send suggestion, a chosen response | #e8efe9 | #1f4a33 | none, or 1.5px #2f6a4a when selected |
| Outline | Everything else (Decline, Reschedule, Cancel event). Today and the toolbar arrows are ghost buttons with no border | #ffffff | #161616 | 1px #dcdcdc |

**Icon buttons (hover and tooltips):** every icon-only button (sidebar « / », week and month arrows, ⋯ menu, the details panel's Edit / ⋯ / Close, copy link, remove time zone, close buttons in popovers) shares one style with Connect. On hover: light grey fill #f1f1f1 and the icon darkens to #161616, with a 120ms fade. Keyboard focus: 2px brand green outline. Each has a tooltip with its action ("Previous week", "Next week", "More options", "Edit", "Close", "Copy link · meet.google.com/…", "Remove"): a dark pill (#1f2421, white 12px text, 6px radius), 6px below the button, shown after 350ms, and right-aligned for buttons at the right edge. Full spec in the Connect tab (Chat header › Tooltips).

**Primary buttons (hover and pressed):** primary buttons (New, Create, Save, and Send in Connect) don't switch to a second, hard-coded green on hover. A black overlay sits on top of the brand colour: 12% on hover, 20% while pressed, with a 120ms fade (e.g. `box-shadow: inset 0 0 0 999px rgba(0,0,0,.12)`, or a pseudo-element with the same fill). This way it works for any brand colour a business picks, with no extra colour token to define. Keyboard focus: 2px outline in the brand colour, 2px away from the button.

Today's date circle and the selected-card ring use #2f6a4a. Toasts and the hover tooltip stay dark (#1f2421).

**Calendar colours**

| Calendar | Name | Card fill | Card text | Left bar, dot, checkbox |
| --- | --- | --- | --- | --- |
| Setmore | Moss | #ebf1e6 | #2b4421 | #4f7f3f |
| Google Calendar | Lake | #e7eff5 | #1f3e55 | #3d76a0 |
| Shared calendars (e.g. Design team) | Clay | #f6ebe4 | #5c2e17 | #b8653e |

The three bar colours were checked for colour-blind separation and contrast on white. They are deliberately muted, so cards always keep their title and people as text and never rely on colour alone. Status text such as "Starts in 11 min" uses #9a4a26.

**Card left bar:** meeting cards have a 4px corner radius (not 8px), so the coloured bar on the left only rounds slightly at the top and bottom. The bar is its own 3px-wide element, flush with the card's left edge and full height, clipped by the card's corners (overflow hidden). Don't draw it with an inset shadow: that makes a curved crescent along its inner edge. Card text starts 11px from the left so it clears the bar.

**Type scale.** 14px is the default size: body text, names, menu items, inputs, buttons and card titles. Only five sizes are used:

| Size | Used for |
| --- | --- |
| 12px | Secondary info: times on cards (the AM / PM part), labels, captions, helper text, timestamps |
| 14px (default) | Body text, card titles, names, menus, inputs, buttons, chips, hour labels |
| 16px | Section titles and emphasis: panel and dialog titles, date numbers in day headers |
| 18px | Page titles: the date title in the toolbar, page headers |
| 24–32px | Display only: onboarding headings and empty-state titles |

Exception: counts in small badges (unread count, +2 handle) stay at 10–11px so they fit their pill. Line height is about 1.4× (20px for 14px text).

**Avatars**

The letter avatars in the mockups are placeholders. When a person has a profile photo (their AnywhereWorks profile, or the Google account for guests), show the photo in the same circle and size. When there is no photo, show the first letter of their name on their colour circle, exactly as in the mockups (two initials for the current user, e.g. ML). This applies everywhere an avatar appears: event cards, the hover card, the details panel, Team day column headers, the Calendars list and the sidebar profile.

**Time format**

Times are written with no space before AM / PM, and AM / PM is set slightly smaller than the number: 9AM, 10:30 – 11:30AM, 12PM.

- Hour labels beside the grid: number 14px, AM / PM 12px (regular weight). Extra time zone columns use the same sizes.
- Everywhere else (event cards, hover card, details panel, New dialog, the new-event slot, reschedule suggestions, time zone search and toasts): the number keeps the size of the text around it and AM / PM is about 2px smaller (0.86em, the same 14 : 12 ratio). This keeps card times smaller than the card title and lets short 15-minute cards fit.
- The current-time pill keeps "9:34" with no AM / PM.

**Dates and times follow each person's region.** The mockups show the US format (12-hour, "Oct 15, 2026"). In the product, dates and times are not hard-coded: they follow the person's language and region, e.g. "15 Oct 2026" and 24-hour "15:30" in the UK. The AM / PM style above applies only in 12-hour regions. This covers the date title, day headers, date picker, cards, hover card, details panel and New dialog. Full rule, examples and how to build it: Date format in the Connect updates tab.

## Open questions to engineers

- [ ] Reschedule suggestions (engineering): we can compute free times for people inside the company. For guests outside it (other companies, customers), we need to know how availability is set up and what we can technically read before we decide the design.
- [ ] Accept / Decline on Google events (engineering): do responses sync back to Google Calendar through the current integration?
- [ ] Request access: is there an existing way to message all account admins in Connect?
- [ ] Team day: does today's Calendar already have a staff side-by-side view we can build on? Who can see other staff calendars (admins only, or everyone)?
- [ ] Time zone for new people (engineering): today every new person is set to UK time by default, but staff can be anywhere in the world. What can we use to set it correctly from the start, for example the time zone of their browser or device when they first sign in, the business's address, or a prompt to confirm it during setup? And can we flag existing accounts that are still on the UK default?
- [ ] Time clock: should it only show for people set up as hourly staff, with salaried staff not seeing it at all? Is that technically possible? Where do the clock-in / clock-out records go today (timesheets, payroll export)?
- [ ] Private meetings: when a meeting comes from Google Calendar and is marked private or "busy" there, can we read that and show it as private here? And who, if anyone, can see the details of someone else's private meeting (for example account admins)?

---

## Implementation review (staging)

<https://canary---frontoffice-alpha-udsx3bgn2q-uc.a.run.app/calendar?date=2026-11-21>

Issues found while reviewing the new Calendar on staging, each with what staging does today, what the design expects, and the fix.

### 1. Work week grid: background, hour height and where it opens

Found 21 Oct. In Work week there is a lot of unused grey space and the grid doesn't follow the design. Expected behaviour:

- **Background:** working days are white (#ffffff). Only days off (e.g. Sat and Sun in Week view) use #fafafa. In Work week every column is a working day, so the whole grid is white. Never tint all columns grey.
- **Lines:** hour lines and day dividers are 1px #f0f0f0. No half-hour lines.
- **Hour height:** 80px per hour when the whole working day fits on screen, so a 30-minute meeting (40px) fits its title and time on two lines. On smaller screens (see issue 2) the hour height shrinks so the full working day stays visible, down to a minimum of 48px per hour; below that, the grid keeps 48px and scrolls. Height = available grid height ÷ number of working hours, between 48px and 80px. A 15-minute card is always at least 18px tall and shows one line.
- **Where it opens:** the grid still covers all 24 hours, but opens scrolled to the working hours. When there is room, the top edge sits 1 hour before they start (working hours from 9AM → the top is 8AM, as in the mockups); when space is tight, the working hours alone fill the view. If today's current time is below the visible area, scroll so the current-time line is in view instead. Earlier and later hours are reached by scrolling.
- **New-event slot:** clicking an empty time shows the green placeholder from the mockup ("New event" with the time, e.g. 12:00 – 12:30PM), not a black outlined box, and uses the time format below (2:30AM, not 2:30 AM).
- **Responsive:** the grid must fit every screen with no wasted space and no sideways page scroll. Day columns share the full width left after the sidebar and hours column, so there is never an empty grey area on the right. Test on desktop, laptop, tablet and phone:
  - Wide screens (1280px and up): all working days side by side.
  - Laptops (1024–1279px): same view, the sidebar collapses to icons to give the days more room.
  - Tablets (768–1023px): 3 days at a time, swipe or use the arrows to move.
  - Phones (under 768px): Day view by default with a strip of dates on top to swipe between days; the toolbar keeps Today, the date and New, and the rest moves into the ⋯ menu.
  - At every size, cards keep their title and time readable and never overflow their column.

**Staging today (21 Oct):** every column grey, all 24 hours squeezed on screen, opens at 12AM, black "2:30 AM" box.

> 🖼 Screenshot: Staging Work week: grey grid from 12AM to 11PM with short hour rows, squashed cards and a black outlined 2:30 AM box (see the PDF version or `screens/`)

**Design:** white grid, 80px hours, opens at 8AM.

> 🖼 Screenshot: Mockup Work week: white columns, 80px hour rows starting at 8AM, cards with title, time and people (see the PDF version or `screens/`)

Board: [Calendar · Work week](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

### 2. Working hours cut off on smaller screens

Found 21 Oct on a 13-inch MacBook Air. The grid shows only about 9AM to 4PM, so the start and end of the working day sit outside the view. Expected behaviour:

- When a person's working hours are 8AM to 5PM, the full 8AM to 5PM range is visible on load.
- The grid fits the working hours to the available height, instead of a fixed hour height that pushes them out of view.
- Hours outside working hours stay reachable by scrolling.

> 🖼 Screenshot: Team day on a 13-inch MacBook Air: the grid shows 9AM to 4PM only, so 8AM and 4PM to 5PM are out of view (see the PDF version or `screens/`)

### 3. Toolbar: date title sits too high, and Today becomes a ghost button

Found 21 Oct. The date title ("October 2026") sits higher than Today and the arrows. Expected behaviour:

- **Alignment:** Today, the arrows and the date title share one centre line. The toolbar row centres its items vertically and the title has no extra top margin or baseline offset.
- **Today as a ghost button** (design change, also updated in the mockups and the Toolbar section): no border, like the < > arrows. 32px high, 8px radius, 14px medium text, light grey (#f1f1f1) background on hover.
- **Date title size:** 18px semibold (line height 24px), not the \~30px on staging. It only needs to read as the title; at 30px it outweighs the 14px buttons beside it.

**Staging today:**

> 🖼 Screenshot: Staging toolbar: Today in an outlined pill, and the October 2026 title sitting higher than the buttons (see the PDF version or `screens/`)

**Design:**

> 🖼 Screenshot: Mockup toolbar: Today as a ghost button, arrows and the 18px date title all centred on one line (see the PDF version or `screens/`)

Board: [Calendar · Work week](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

### 4. New dialog always opens under the New button

Found 21 Oct. Clicking **New** opens the dialog under the button, which is right. Clicking an empty time on the calendar also opens it under the New button, far from the slot that was picked. Expected behaviour:

- **From the New button:** unchanged, the dialog opens under the button, set to today at the next free half hour.
- **From a time slot:** the dialog opens next to the slot that was clicked, with the green "New event" placeholder in that slot and the same day and time in the dialog (e.g. "Wed 30 Sep · 2 – 2:30PM").
- **Side:** for days in the left half of the grid it opens to the right of the column; for days in the right half, to the left. It never covers the slot itself.
- **Height:** the top lines up with the slot, but the whole dialog stays on screen: near the bottom it moves up, near the top it moves down.
- Clicking a time snaps to the half hour. Clicking an existing card opens that meeting instead.

**Design:** a slot on Wednesday opens to the right; a slot on Friday opens to the left.

> 🖼 Screenshot: New dialog opened from a Wednesday 2PM slot: the green New event placeholder in Wednesday's column and the dialog to its right (see the PDF version or `screens/`)

> 🖼 Screenshot: New dialog opened from a Friday 3:30PM slot: the placeholder in Friday's column and the dialog to its left (see the PDF version or `screens/`)

Board: [Calendar · New from a time slot](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) (click any empty slot to try it)

### 5. Date picker colours and weekday letters

Found 21 Oct. The date picker should use the brand colours and make the weekdays easier to read. Expected behaviour:

- The selected date is a brand green circle (#2f6a4a) with a white number.
- Hovering a date shows the light green shade (#e8efe9) with a dark green number (#1f4a33).
- The weekday letters (M T W T F S S) are bold.

Full spec and screenshot under **Date picker** in the Toolbar section. Board: [Calendar · Date picker](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

### 6. Meeting card left bar curls around the corners

Found 21 Oct. The coloured bar on the left of each meeting card is drawn as a left border (or inset shadow) on a rounded card, so it follows the 8px corners and wraps around the top and bottom. Expected behaviour:

- Reduce the card corner radius from 8px to 4px.
- Draw the bar as its own element: 3px wide, flush left, full height, in the calendar or person colour, clipped by the card's corners. Its inner edge stays straight.
- Works the same on short 15-minute cards.

**Design:**

> 🖼 Screenshot: Two meeting cards with a 4px corner radius and a straight 3px colour bar flush on the left edge (see the PDF version or `screens/`)

Spec: **Card left bar** under Visual system.

### 7. Day headers sit in a separate row above the time zone label

Found 21 Oct. On staging the day headers ("19 Mon", "20 Tue"…) are in their own row, and the "+ EDT" label sits in a second row underneath, so the header is two rows tall and the labels don't line up. The day headers are also shifted right of their columns and still show the event count. Expected behaviour:

- **One header row:** "+ EDT" (above the hours column) and every day header share the same row, 58px tall, all vertically centred on one line.
- **Aligned with the grid:** each day header sits exactly above its column, starting 12px in from the column's left divider; the dividers in the header continue the grid's column lines.
- **Content:** date number (16px semibold) then weekday (14px), no event count (see Day headers). Today's number in the green circle.
- The header row stays pinned when scrolling, as in the mockups.

**Staging today:**

> 🖼 Screenshot: Staging: day headers in a row above, "+ EDT" in a second row below, headers offset from their columns and still showing event counts (see the PDF version or `screens/`)

**Design:**

> 🖼 Screenshot: Mockup: + EDT and the day headers 28 Mon, 29 Tue, 30 Wed, 1 Thu on one centred row, each above its column (see the PDF version or `screens/`)

Board: [Calendar · Work week](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

### 8. Edit button in the details panel closes the panel and does nothing

Found 21 Oct. In the meeting details panel, clicking the pencil (Edit) closes the panel and no edit view opens, so there is no way to change the meeting from here. Expected behaviour:

- **Edit never closes the panel.** Clicking it opens the edit form with every field filled in from the meeting: title, date and time, guests, location, Google Meet switch and notes.
- The edit form uses the same fields and layout as the New dialog, titled "Edit event" (or "Edit appointment" for a booking), with **Save** as the primary button and **Cancel** next to it.
- **Save** updates the meeting, goes back to the details panel showing the changes, and shows a toast: "Changes saved". **Cancel** (or Esc) goes back to the details panel with nothing changed.
- If the user isn't allowed to edit this meeting (for example someone else organized it and editing isn't permitted), hide the pencil instead of showing a button that does nothing.
- Edit history should appear in the History tab.

**Staging today:**

> 🖼 Screenshot: Staging details panel for "@Marine Lasserre" with the Edit tooltip on the pencil; clicking it closes the panel (see the PDF version or `screens/`)

**Design:** the edit form inside the details panel, with Cancel and Save pinned at the bottom.

> 🖼 Screenshot: Edit event in the side panel: Title, When, Guests as removable chips, Location, Google Meet and Private switches, Notes for guests, and Cancel / Save at the bottom (see the PDF version or `screens/`)

Board: [Calendar · Edit event](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) (also: open any meeting and click the pencil)

### 9. Organizer shown twice in the details panel

Found 21 Oct. The people list already labels the organizer ("Sebastian Witman · Organizer"), and the footer repeats it ("Organized by Sebastian Witman"). Expected behaviour:

- Remove the "Organized by …" footer line. The organizer stays first in the people list with the "Organizer" label.
- Keep the other footer lines (reminder, "Booked from Web App", Booking ID).

**Staging today:**

> 🖼 Screenshot: Staging details panel: Sebastian Witman listed as Organizer in the people list, then repeated as Organized by Sebastian Witman in the footer (see the PDF version or `screens/`)

### 10. Time zones capped at 3

Found 22 Oct. You can only add 3 extra time zones. Teams spread across many countries need more. Expected behaviour:

- Allow up to **9** extra time zones (10 columns with your own). "Add a time zone" disappears once 9 are added, and the popover note reads "Up to 9 extra time zones."
- Each extra zone keeps its 56px column. When they don't all fit next to the week, the hour columns scroll sideways together with the grid, and day columns never get narrower than 120px. The quick show / hide handle collapses them all to your own zone in one click.

Board: [Calendar · Time zones](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) (the popover now allows 9).

### 11. Create button missing in the New dialog

Found 22 Oct. When you start a new meeting, the Create button isn't there. It only appears after switching to the Service tab (or another tab) and back. Expected behaviour:

- The Create button is always visible at the bottom of the New dialog as soon as it opens, on every tab (Event, Service, Reminder), as in the mockups. It's the primary button ("Create"; "Save" for a reminder).
- If required fields are missing, Create stays visible and clickable, and shows what's missing next to the field, rather than being hidden.

Board: [Calendar · New](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

### 12. Chosen view isn't remembered

Found 22 Oct. Picking Day, Week, Work week, Month or Team day works, but leaving the Calendar page and coming back always resets it to Week. Expected behaviour:

- Remember the last view per person (saved to their account, not just the browser, so it follows them across devices), together with Working days and the time zones shown.
- Opening Calendar shows that view on today's date. A link to a specific date or view (e.g. from a notification) can override it once without changing the saved choice.

### 13. Time zone error looks like a toast

Found 22 Oct. Changing the time zone opens an error message styled like a toast. Screenshot to come. Expected behaviour (to confirm once we have the screenshot):

- Errors are never shown as toasts: toasts (dark, bottom centre) are only for confirmations like "Changes saved". An error inside the Time zones popover shows inline, under the field that failed, in red text with a short fix ("Couldn’t add Paris. Try again.").
- If the action can't be completed at all, keep the popover open and keep what the person typed.

### New design changes to build

These aren't staging bugs: they're design changes and new features added during the review. Each one is fully specified in the section linked, with screenshots, and is on the canvas.

1. **No event count in day headers.** Day headers show only the date number and weekday ("28 Mon"); remove "3 events". See Event cards and current time (Day headers).
2. **No "(you)" in Team day headers.** Your column is first and reads just "Marine". "(you)" stays in people lists (details panel, Calendars list). See Team day.
3. **Rename your own time zone.** The Time zones popover starts with "Your time zone" and a name field ("EDT (add a name)"); the name replaces "EDT" above your hours. See Toolbar › More time zones.
4. **Quick show / hide for extra time zones.** A small round handle on the divider between the hours and the first day: ‹ hides the extra zones, "+2 ›" brings them back. Same setting as the popover switch. See Toolbar › More time zones.
5. **Private meetings.** A "Private" switch in New and Edit. The owner sees the meeting with a lock, and "Private" instead of "Just you". Everyone else sees only a grey "Busy" block with the time (no lock, no details), which can't be opened. See Private meetings.
6. **Edit inside the details panel.** The pencil turns the panel into an "Edit event" form (same fields as New, including Private) with Cancel / Save. See issue 8 above.
7. **New dialog next to the clicked slot,** the New button still opens it under the button. See issue 4 above and New appointment.
8. **Toolbar:** Today as a ghost button, date title 18px semibold, and the date picker with a green selected date, light green hover and bold weekday letters. See issues 3 and 5 and Toolbar, calendars chip and ⋯ menu.
9. **Meeting cards:** 4px corner radius and a straight 3px bar flush on the left. See issue 6 and Visual system.
10. **Details panel:** no "Organized by" footer line. See issue 9.
11. **No meeting URL under Join.** In the details panel and hover card, remove the "meet.google.com/…" line under Join Google Meet. The copy button's tooltip shows the URL, and clicking it shows a "Link copied" toast. See Meeting details.
12. **No time zone after meeting times.** The details panel and hover card show times in your own time zone with no "EDT" ("Friday 2 Oct · 9:45AM – 10:15AM"). See Meeting details.
13. **Lighter response buttons.** Accept / Decline / Reschedule, and Reschedule / Cancel event for your own meetings, become ghost buttons with a small icon. No grey box and no outlined pills. See Meeting details.
14. **No calendar name as the panel title.** The details panel header keeps only Edit, ⋯ and Close. "From Google Calendar" or a shared calendar's name shows as a small line under the time, and only for synced or shared meetings. See Meeting details.
15. **Video camera icon.** Cards, the Join chip, the hover card and the details panel use an outline video camera instead of the play-button icon, matching Connect. See Event cards and current time.
16. **Hover and tooltips on icon buttons.** Every icon-only button gets the grey hover fill and a dark tooltip naming its action, the same as in Connect. Primary buttons darken with a 12% black overlay on hover (20% pressed), so it works with any brand colour. See Visual system.

Boards: [canvas](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) · Calendar · Time zones, New from a time slot, Date picker, Edit event, Private event, Team day.
