# Connect updates: Dev spec

## Date format

Use one date format across Connect, taken from the Earth Design System (EDS).

| Version | Format | Example |
| --- | --- | --- |
| Existing Connect | DD MON YYYY | 15 Oct 2026 |
| New Connect | MON D, YYYY | Oct 15, 2026 |

- **Dates follow each person's country.** Don't hard-code one pattern: format dates and times from the person's language and region, so an American sees "Oct 15, 2026", a British user "15 Oct 2026", a French user "15 oct. 2026". The browser's date formatting (Intl.DateTimeFormat, "medium" date style) does this for every country.
- **Where the region comes from:** the person's own language and region setting in their profile, defaulting to their browser's language on first sign-in. Not the business address: staff of the same business can live in different countries.
- **Time follows the same rule:** 12-hour with AM / PM where that's the norm (US, Australia, India…), 24-hour elsewhere (UK, France, Germany…). Our AM / PM style (no space, AM / PM slightly smaller) applies only to 12-hour regions.
- **Recent days stay relative:** "Today" and "Yesterday" in the person's language, the weekday for the last 7 days ("Wed"), then the short date ("Oct 15" / "15 Oct"), and the year only for dates from another year.
- **People can override it:** a "Date and time format" option in profile settings (e.g. 24-hour clock in the US).
- **Same rule in Calendar** (date title, day headers, date picker, details panel) so the whole app agrees.

| Region | Date | Short date | Time |
| --- | --- | --- | --- |
| United States | Oct 15, 2026 | Oct 15 | 3:30PM |
| United Kingdom | 15 Oct 2026 | 15 Oct | 15:30 |
| Australia, India | 15 Oct 2026 | 15 Oct | 3:30PM |
| France | 15 oct. 2026 | 15 oct. | 15:30 |
| Spain | 15 oct 2026 | 15 oct | 15:30 |
| Germany | 15.10.2026 | 15. Okt. | 15:30 |
| Brazil | 15 de out. de 2026 | 15 de out. | 15:30 |
| Japan | 2026/10/15 | 10月15日 | 15:30 |

### How to implement it

The formats in the table are **not hard-coded**. Nobody writes "MON D, YYYY" or "DD MON YYYY" anywhere in the code. The app asks the browser to format each date for the person's region, and the browser already knows the right pattern, month names and AM / PM or 24-hour rule for every country. Adding a new country needs no code change.

1. **Store times in UTC.** Every message and meeting time is saved as a UTC timestamp. Formatting happens only when it's shown.
2. **Keep the person's settings on their profile:** `locale` (e.g. "en-US", "fr-FR"), `timeZone` (e.g. "America/New\_York") and an optional `hourCycle` override ("h12" or "h23"). On first sign-in, fill them from the browser: `navigator.language` and `Intl.DateTimeFormat().resolvedOptions().timeZone`. Fall back to "en-US" if nothing is set.
3. **Format with the built-in `Intl.DateTimeFormat`.** Use one shared helper so every screen gets the same result:
   - full date: `{ dateStyle: 'medium' }` → "Oct 15, 2026" / "15 Oct 2026"
   - short date: `{ month: 'short', day: 'numeric' }` → "Oct 15" / "15 Oct"
   - weekday: `{ weekday: 'short' }` → "Wed" / "mer."
   - time: `{ timeStyle: 'short', hourCycle }` → "3:30 PM" / "15:30"
4. **"Today" and "Yesterday" in the person's language:** `Intl.RelativeTimeFormat(locale, { numeric: 'auto' })` gives "today", "yesterday", "aujourd'hui", "hier" (capitalise the first letter).
5. **Our AM / PM style:** use `formatToParts()` on the time. Drop the space before the `dayPeriod` part and wrap the `dayPeriod` part in a slightly smaller span (about 2px smaller). In 24-hour regions there is no `dayPeriod` part, so nothing changes.
6. **Same helper everywhere:** Connect, Calendar, notifications and emails, so a date never looks different from one screen to the next. Create each formatter once per locale and reuse it, rather than on every render.
7. **Test** with at least en-US, en-GB, fr-FR, de-DE and ja-JP, and with a 24-hour override on en-US.

```js
const fmt = (date, locale, opts) => new Intl.DateTimeFormat(locale, { timeZone, ...opts }).format(date);
fmt(d, 'en-US', { dateStyle: 'medium' }); // "Oct 15, 2026"
fmt(d, 'en-GB', { dateStyle: 'medium' }); // "15 Oct 2026"
fmt(d, 'fr-FR', { timeStyle: 'short' });  // "15:30"
```

## Shared with Calendar

The Connect mockups now follow the rules we set on Calendar, so both screens look and behave the same.

- **Time format:** no space before AM / PM, and AM / PM about 2px smaller than the number: "7:39AM", "12:15PM". Applies to the conversation list, message times, and the status lines ("At lunch · until 11:50AM", "You'll switch back to Available at 11:50AM.").
- **Date format:** follows the person's region (see Date format above). The mockups show the US version on the day separators: "Sep 28, 2026". "Today" and weekday names ("Wed") stay for recent days in the list; older ones read "Sep 25".
- **One green primary per view:** Send is the primary button. "New message" becomes a tonal button (light green #e8efe9, dark green text #1f4a33).
- **Unread badge** on Connect in the sidebar: brand green (#2f6a4a) with white text, instead of black.
- **Avatars:** letters are placeholders; show the person's photo when they have one (same rule as Calendar).
- **Sidebar:** same as Calendar, including the Time clock with Clock in / Clock out.
- **Brand colour:** the green in Connect (Send, unread badge, tonal buttons, focus outlines) comes from the business's brand colour tokens (`--brand`, `--brand-tonal`, `--brand-on-tonal`), never fixed hex values. See Visual system › Brand colour in the Calendar tab.

> 🖼 Screenshot: Connect with the 14px type scale: conversation list, open chat with message times in the compact format, and the Time clock in the sidebar (see the PDF version or `screens/`)

Board: [Connect · Audit fixes (light refresh)](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

## Link cards

When someone shares a link, the message shows a card under the text instead of the long URL. There are two sizes, picked automatically from what the link gives us.

**Size:** both cards fill the width of the message column, up to 520px, and shrink with the screen down to 260px. Below that (phones), they take the full message width. Titles and meta lines truncate on one line; the open icon and Request access button never shrink.

- **Compact card** (no preview image available, e.g. a Claude artifact, a website, or a doc you can't open): white, 1px #e2e2e2 border, 12px radius, 10px padding. On the left, a 36px tile with the site's icon (its favicon, e.g. the Claude logo for claude.ai). Then the title (14px semibold, one line, truncated) and a meta line (12px grey): the domain ("claude.ai") or, for Google files, the app and last edit. External-link icon on the right.
- **Preview card** (the link has a preview image, e.g. a Google Doc you can open): same width and border, with the preview image on top (12:5 ratio, so 216px tall at full width and shorter on narrow screens; cropped from the top, on a light grey #f1f3f4 background), then the same title row underneath with a smaller 32px icon tile.
- **Google files:** the icon tile is the file type's icon (Docs, Sheets, Slides). Title, access and last edit come from the Google Drive integration.
- **You have access:** clicking anywhere on the card, or the external-link icon, opens the link in a new tab.
- **No access:** no preview is available, so it's always a compact card. The meta line reads "Google Docs · No access yet" and a ghost "Request access" button with a lock (no fill, no border, #4a4a4a text) replaces the open icon. After clicking, it turns into a lighter grey "Requested" (#6b6b6b) and the meta line reads "Access requested from Naresh".
- **Where the URL goes:** a link at the end of a message, or on its own, is replaced by the card. A link in the middle of a sentence stays as text (brand green, underlined) and the card still shows below. One card per message; if there are several links, only the first gets a card.
- **Fallback:** if the page can't be read (no title, private page), show a compact card with the domain as the title and a generic globe icon.
- **Conversation list:** the preview shows the title, not the URL ("Naresh: Customer research notes").
- The chat opens scrolled to the latest message.

> 🖼 Screenshot: Link cards at 1440px wide: the cards are 520px wide, with the Google Doc preview card on top, then the Customer research notes card with a ghost Request access button, and the claude.ai card (see the PDF version or `screens/`)

> 🖼 Screenshot: The same chat at 1024px wide: the cards shrink to the narrower message column and the titles truncate (see the PDF version or `screens/`)

Board: [Connect · Link cards](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) (click Request access to see the requested state)

## Chat header

No "Details" chip in the header. Clicking the avatar or the name opens and closes the details panel on the right: "About Naresh" in a one-to-one chat, the member list ("53 people") in a group.

- Avatar + name + status line form one button: 14px radius, transparent at rest, light grey (#f1f1f1) on hover and while the panel is open. Tooltip: "Show details" / "Hide details".
- The header keeps only the video call, search and ⋯ icons on the right, all ghost icon buttons in grey (#4a4a4a), 34px square with 2px between them. The call icon is an outline video camera (rounded body + lens), not a play button. All header icons use the same grey and the same stroke weight (about 1px at 17–18px), so none looks bolder than the others.
- The » button at the top of the panel still closes it.

> 🖼 Screenshot: Group chat with the details panel open: the Shoulders of GIANTS avatar and name highlighted in light grey, the member list on the right, ghost icon buttons for new message, collapse, video, search and more (see the PDF version or `screens/`)

Board: [Connect · Details panel open](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889)

## New message

"New message" is a ghost icon button (pencil-on-square, 17px, grey #4a4a4a, 34px square) next to the Connect title, with the tooltip "New message". It's no longer a tonal button, because most people start a conversation another way: they search for the person in the search field, or pick someone from their recent conversations. The icon button stays for group messages and for people you haven't talked to yet.

**New message flow** (clicking the pencil):

- The chat area turns into a "New message" view, and a "New message" draft row appears selected at the top of the conversation list (its second line lists the people picked so far, or "Choose people"). × in the header discards the draft.
- **To field:** type a name. Matches show in a dropdown under the field, matched letters in bold, each person with avatar, presence dot, job title and status ("Product manager · Away · At lunch"). With nothing typed it shows "Recent": the 5 people you talk to most. First result is highlighted: Enter adds it, arrow keys move. Picked people become chips with ×; Backspace in an empty field removes the last chip. No match: "No one in your team matches …".
- **One person you already talk to:** "You already have a conversation with Naresh. Your message will be added to it." with an "Open conversation" link. Sending adds the message to that conversation; no duplicate chat is created.
- **Two or more people = a group:** an optional "Group name" field appears under To, and the empty area shows "Start a group with Naresh and Xenia" with their avatars and "Everyone you add can see the messages and files shared here. You can add more people later." Without a name, the group is named after its members ("Naresh, Xenia").
- The message box placeholder follows the recipients ("Message Naresh, Xenia"); Send stays disabled until at least one person is picked and something is typed. After sending, the draft becomes the real conversation at the top of the list.
- Searching a person who has no conversation yet and picking them also opens this view with them already in To.

> 🖼 Screenshot: New message: the To field with "na" typed and a dropdown listing Naresh (Product manager · Away · At lunch) highlighted and Nadia Romero, plus a New message draft row at the top of the conversation list (see the PDF version or `screens/`)

> 🖼 Screenshot: New group: Naresh and Xenia as chips in To, an optional Group name field, and the empty state "Start a group with Naresh and Xenia" (see the PDF version or `screens/`)

Boards: [Connect · New message](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) and Connect · New group.

The collapse buttons (« on the conversation list, » on the details panel, and "Show conversations" when the list is closed) are ghost icon buttons too: no border, 34px, grey #4a4a4a. Every icon button in Connect now uses this one style, and icon buttons sitting next to each other always have 2px between them (new message + collapse, and video + search + ⋯).

**Hover and focus:** on hover, an icon button gets a light grey fill (#f1f1f1, 8px radius, the full 34px square) and the icon darkens to #161616, with a 120ms fade. Keyboard focus shows a 2px brand green (#2f6a4a) outline. The avatar + name button in the chat header gets the same grey fill on hover.

**Tooltips:** every icon-only button has a tooltip naming its action ("New message", "Hide conversations", "Video call", "Search", "More options", "Hide details", "Open in a new tab", "Send"). Dark pill (#1f2421, white 12px medium text, 6px radius, 5 × 8px padding), 6px below the button, centred on it; right-aligned to the button when the button sits at the right edge, so it never goes off screen. It appears after a 350ms hover delay, and right away on keyboard focus. Use the custom tooltip instead of the browser's title tooltip, and keep the same text as the button's aria-label. Same style in Calendar.

**Send button hover:** the round primary Send button darkens with a black overlay on top of the brand colour (12% on hover, 20% pressed) instead of a second hard-coded green, so it works with any brand colour. Same rule for every primary button (see Visual system in the Calendar tab).

## Status (presence)

Presence follows the Microsoft Teams model, which people already know: one colour per availability level, and a small glyph in the dot for the detail. Colour is never the only signal: the glyph and the status text always come with it.

| Dot | Statuses | Set by |
| --- | --- | --- |
| Green with a check (#2e9e5b) | Available | Person, or automatic when they're active |
| Solid red, no glyph (#c4314b) | Busy, In a meeting, On a call, With a client | Busy: person. The other three are automatic |
| Red with a white bar | Do not disturb | Person only. Mutes notifications. The bar is reserved for this |
| Amber with a clock (#e3a21a) | Away (with an optional note such as "At lunch") | Person, or Away when idle |
| Purple with a left arrow (#9a5cb4) | Out of office (replaces "On vacation") | Person (pick dates) or automatic from an Out of office event in the calendar |
| Grey ring with an × (#8a8a8a) | Offline | Automatic when signed out everywhere, or "appear offline" |

- **Automatic statuses:** In a meeting (a calendar event is happening), On a call (in a Connect or Meet call), and **With a client** (a Setmore appointment where they're the staff member is happening). These last until the event ends, then the person goes back to their previous status. They don't appear in the status menu and there's no explanation text in the UI: this is logic for the backend. A manual status the person set wins over an automatic one (e.g. Do not disturb during a meeting stays Do not disturb), except Available, which an automatic status overrides while the event lasts.
- **With a client** never shows the customer's name or the service, only "With a client", so customer details stay private. Hovering the dot can show the end time ("With a client · until 3:30PM").
- **Status menu:** six choices, one per colour: Available, Busy, Do not disturb, Away, Out of office, Offline (appear offline), each with its default duration on the right and "Back to Available" options below. Lunch, breaks and "be right back" are not separate statuses: when Away is picked, an optional note field appears ("What are you up to?") with quick picks At lunch, Be right back and On a break, and people can type their own. The note replaces the status text everywhere ("Away · At lunch" in lists and the members panel; "At lunch · until 11:50AM" under your name). The dot stays the amber clock.
- **Dot sizes:** 16–18px on avatars with a 2–2.5px ring in the background colour around it; 20px in the status menu. Never use these presence colours for anything else (not for calendar colours or tags).
- **These colours don't change with the brand colour.**

> 🖼 Screenshot: Status menu with six statuses (Available, Busy, Do not disturb, Away, Out of office, Offline); Away is selected and shows an optional note field with At lunch, Be right back and On a break quick picks above the Back to Available options (see the PDF version or `screens/`)

> 🖼 Screenshot: Members panel: Xenia With a client, Michael On a call and Santhosh In a meeting in solid red, Tracy and Alicia Available in green with a check, Naresh Away · At lunch in amber with a clock, Sri Out of office in purple with an arrow (see the PDF version or `screens/`)

Boards: [Connect · Status with duration](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) and Connect · Details panel open.

## Search

The search field at the top of the conversation list searches people, groups and messages at once (placeholder "Search people and messages").

- **While typing,** the list is replaced by results; the field gets a 1.5px brand outline and a × to clear. Esc or × clears it and brings the list back.
- **Results are grouped:** People (max 4: name starts with the text, presence dot and status), Groups (name contains the text, with member count), then Messages (newest first: conversation name and date, then "Sender: …snippet" with the match in bold and a few words before it so the match is always visible).
- **Clicking a result:** a person opens your conversation with them, or a new message to them if you've never talked; a group opens it; a message opens the conversation scrolled to that message, briefly highlighted.
- **No results:** "No results for “invoice”" with "Check the spelling, or try a first name or a word from the message."
- Matching ignores upper / lower case and accents; people match from the first letter of the first or last name.

> 🖼 Screenshot: Search for "book": a Groups section with BookingPage 2.0 and a Messages section with five results, "book" in bold in each snippet (see the PDF version or `screens/`)

> 🖼 Screenshot: No results for "invoice" with a short hint (see the PDF version or `screens/`)

Boards: [Connect · Search results](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889) and Connect · No search results.

## Unread and read

- **In the conversation list:** a conversation with unread messages shows a brand-colour count pill on the right of its second line ("3", capped at 99+), and the last message in darker, medium-weight text. Opening it clears the count.
- **"New" line:** when you open a conversation with unread messages, a thin line in the brand colour (\`--brand\`) labelled "New" sits above the first message you haven't read. It stays until you leave the conversation, so you can see where you stopped. If the first unread message is far up, the chat opens at the New line instead of the bottom.
- **Read receipts:** only under your own latest message, and only while it's the last message in the chat. One-to-one: "✓ Sent" until the other person has seen it, then "👁 Seen" (hover shows the time: "Seen by Tracy at 3:40PM"). Groups: "Seen by Xenia, Tomek and 4 others" (hover lists everyone). 12px grey, no colour, so it never competes with the messages.
- Someone with "Do not disturb" or Out of office still gets the message; the receipt just stays "Sent".

> 🖼 Screenshot: Shoulders of GIANTS opened with a brand green New line above the unread messages; in the list, Xenia (1) and BookingPage 2.0 (2) show unread count pills and darker last-message text (see the PDF version or `screens/`)

> 🖼 Screenshot: Read receipts: "Seen" under Marine's image to Tracy, and "Sent" under Marine's last message to Naresh, who hasn't read it yet (see the PDF version or `screens/`)

Boards: [Connect · Unread and read](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889), and the receipts on Connect · Fixed and Connect · Link cards.

## Message actions

**Hover toolbar.** Hovering a message gives it a light grey background (#f7f7f7, 12px radius) and shows a small floating toolbar on its top-right corner (white, 12px radius, light shadow): three quick reactions (👍 ❤️ 😂), Add reaction (opens the emoji picker), a divider, Reply, and ⋯ More. All are 32px ghost icon buttons with tooltips. On touch screens, a long press opens the same actions as a bottom sheet. Keyboard: focusing a message shows the toolbar too.

**Reactions.** Pills under the message: emoji + count, 28px tall. Your own reactions have the tonal fill and a brand outline; clicking a pill adds or removes your reaction. Hovering a pill shows who reacted ("Tracy and you reacted with thumbs up"). A small ☺ button at the end of the row adds another one. Reactions don't trigger notifications, except to the author of the message (bundled, not one per reaction).

**⋯ menu.** Reply, Copy text, Copy link to message, then (on your own messages only) Edit message and Delete message, the last one in red. The message keeps its grey background while the menu is open.

**Reply.** Reply puts a quote bar above the message box (brand-colour left border, "Replying to Tracy" + one line of the message, × to cancel). The sent message carries a small quote (grey left border, author + one line) above its text; clicking it scrolls to the original and briefly highlights it. Replies stay in the main chat: no separate threads, which keeps conversations simple for small teams.

**Edit.** Edit turns the text into an editable box with a brand outline, "Esc to cancel · Enter to save", and Cancel / Save. After saving, an "Edited" label appears next to the time (hover: when it was edited). You can edit your own messages any time; people see the latest version.

**Delete.** Delete asks first: "Delete this message?", "It will be removed for everyone in this conversation. This can’t be undone.", a preview of the message, then Cancel and a red Delete button. A deleted message is replaced by a grey italic "This message was deleted" line (with a small bin icon), keeping the author and time so replies to it still make sense. Its reactions are removed.

> 🖼 Screenshot: Hover toolbar on Tracy's message with quick reactions, add reaction, reply and more; below it the 👍 2 (yours, highlighted) and ❤️ 2 reaction pills; above, Marine's reply with a quote of Tracy's question and an Edited label (see the PDF version or `screens/`)

> 🖼 Screenshot: More menu open on Marine's own message: Reply, Copy text, Copy link to message, Edit message, and Delete message in red (see the PDF version or `screens/`)

> 🖼 Screenshot: Replying: a quote bar above the message box reading Replying to Tracy, with an × (see the PDF version or `screens/`)

> 🖼 Screenshot: Editing a message in place: brand outlined box with the text, Esc to cancel · Enter to save, Cancel and Save (see the PDF version or `screens/`)

> 🖼 Screenshot: Delete confirmation dialog: Delete this message? with a preview, Cancel and a red Delete button (see the PDF version or `screens/`)

> 🖼 Screenshot: A deleted message: This message was deleted, in grey italics, under Marine 12:14PM (see the PDF version or `screens/`)

Boards: [Connect · Message hover and reactions](https://claude.ai/artifact/VZt3Q6uS4RwmgHfbc9q889), Message menu, Reply to a message, Edit a message, Delete a message, Deleted message. Everything is clickable on the boards (hover any message in Tracy's chat).

## Unread count in the browser tab

The browser tab title shows an unread count, e.g. "(226) Calendar · Setmore". At that size it never goes to zero, reads as noise, and on Calendar it looks like it's about the calendar. Keep the count, but make it mean "something needs you".

- **What counts:** direct messages and @mentions of the person only. Messages in group chats where they aren't mentioned don't count. Muted chats never count.
- **Cap at 99+:** from 100 unread, the title shows "(99+)", e.g. "(99+) Calendar · Setmore".
- **Nothing to read, no number:** when the count is 0 the title is just "Calendar · Setmore".
- **Every page:** the count shows on every page of the app (Calendar, Connect, services…) because it's the same tab. It updates as soon as a message arrives or is read, wherever the person is.
- The number matches the badge next to Connect in the sidebar, which uses the same rule and the same 99+ cap.

**Tab title format:** count first, then the page, then the tool name: "(3) Calendar · Setmore", "Connect · Setmore", "(99+) Services · Setmore".

- The count comes first so it stays visible when tabs get narrow; "Setmore" comes last and can be cut off, since the tree icon already identifies the tab.
- "Setmore" is the tool name and stays the same for every business. The business name (e.g. "Chic Hair", or "AnywhereWorks" for us) is shown in the sidebar, not in the tab.

**Staging today:**

> 🖼 Screenshot: Chrome tab reading (226) Calendar · Setmore while on the Calendar page (see the PDF version or `screens/`)
