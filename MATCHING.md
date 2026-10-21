# Setmore calendar rebuild: what doesn't match yet

A running list, updated at the end of each stage. "Live" means go.setmore.com/calendar as captured in the reference screenshots.

## Stage 1 (header, menus, Week/Day/Team grid, booking form, appointment popover)

### Not verified against live
- **Drag to resize** (bottom edge) and **drag to move**. They follow the spec's description: 15-minute snaps, no visible handles. Nobody checked them on live.
- **Print calendar** calls the browser's print dialog, with the side panels hidden.
- **Hide weekends** removes Saturday and Sunday from Week view.
- **Repeat → Custom** sets "every 2 weeks". Live has a custom-repeat dialog that wasn't captured.
- **One-time Meeting** (Share menu) copies a made-up link.

### Known differences
- **Academy icon.** EDS has no graduation-cap icon, so the EDS version uses `ClassBookingIcon`.
- **Service and guest pickers in shadcn** open shadcn's standard combobox: a button that opens a searchable list. EDS and live use an inline text field.
- **Time pickers in shadcn** use shadcn's Select. shadcn has no time picker.
- **Colour swatches in shadcn** are plain radio buttons styled with the shadcn theme. shadcn has no swatch component.
- **Avatars** show initials, because the prototype has no photos. EDS avatars are grey, as EDS draws them; shadcn avatars get a light tint.
- **Skeletons.** EDS has no Skeleton component, so the EDS version shows its `Loading` spinner where the shadcn version shows `Skeleton` bars.
- **Loading states, keyboard shortcuts, small-screen layouts and the full keyboard pass** come in Stage 3. Below 730px the left menu already shrinks to icons.

### Issues found in EDS itself (worth reporting to the EDS team)
- **`Avatar` with `status`** passes an internal `hasSymbol` prop to the DOM, which makes React warn in the console (eds-core 1.48.0, `avatar-status-badge`).
- **The EDS Tailwind preset turns every `text-[…]` class into a colour**, even `text-[length:10px]`. Setmore's grid needs 9px and 11px text, which isn't on EDS's type scale (body-8/10/12…), so the prototype adds an `fs-*` font-size utility.
- **The EDS preset and shadcn's Tailwind theme use the same class names** (`bg-primary`, `bg-accent`, `border-input`, `text-secondary`…) with different meanings. The prototype keeps them apart with two Tailwind configs; shadcn's is scoped to `html[data-kit="shadcn"]`.
- **`usePopover` doesn't follow scrolling ancestors** (`ancestorScroll: false`). A popover anchored inside the scrolling grid won't move with it.
- **`usePopover` flips but doesn't shift**, so a popover opened near the bottom of the screen runs off it. The prototype measures the panel and nudges it back on screen. It also sits on EDS's own popover layer (z-10), so pickers opened from inside it (guest list, service list) stack on top.
- **`TimePicker` reads `defaultValue` only once.** The form remounts it with a `key` whenever the time changes elsewhere.

## Stage 2 (Month, Agenda, Team)

### Not verified against live
- **Clicking an empty Month cell** opens the Event form at 9–10 AM for that day; clicking the day number opens Day view. The spec doesn't say what live does here.
- **The "N more" cut-off** follows the cell height (taller screens show more rows). Live's exact rule wasn't captured; the screenshots show 4–6 rows.
- **The Agenda title range** ("Mar 2025 - Mar 2028") copies the live screenshot: about 19 months back to 17 months ahead. The list itself starts at the current week and loads 3 more months at a time as you scroll.
- **Team and Day with several people** share one layout: a column per checked person, with avatar headings once there's more than one.

### Known differences
- **Agenda only lists the selected person's appointments.** Live also shows events where you're a guest on someone else's calendar, and the prototype has no guest-of-staff data.
