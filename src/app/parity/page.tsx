"use client";

// Every kit component in its common states, for pixel-comparing the three kits (?kit=eds|shadcn|test).
// Not linked from the app; used to prove the kits render identically.
import { useEffect, useState } from "react";
import { KitProvider, useKit } from "@/components/kit";
import type { ButtonSize, ButtonVariant } from "@/components/kit/types";
import { swatchHex } from "@/components/calendar/booking/AppointmentForm";
import { eventSwatches } from "@/components/calendar/model/mock";

const VARIANTS: ButtonVariant[] = [
  "accentPrimary",
  "accentSecondary",
  "criticalPrimary",
  "criticalSecondary",
  "criticalTertiary",
  "neutralPrimary",
  "neutralSecondary",
  "neutralSecondaryIntense",
  "neutralTertiary",
];
const SIZES: ButtonSize[] = ["small", "standard", "large", "xLarge"];

function Gallery() {
  const k = useKit();
  const [text, setText] = useState("Jordan Hale");
  const [checked, setChecked] = useState(true);
  return (
    <main className="flex flex-col gap-6 p-6 text-primary">
      <section data-part="buttons" className="flex flex-col gap-2">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-2">
            {VARIANTS.map((variant) => (
              <k.Button key={variant} variant={variant} size={size} iconStart={k.icons.add}>
                Button
              </k.Button>
            ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          {SIZES.map((size) =>
            ["neutralTertiary", "neutralSecondary", "accentPrimary"].map((variant) => (
              <k.IconButton key={size + variant} aria-label="Add" icon={k.icons.add} size={size} variant={variant as ButtonVariant} />
            ))
          )}
          <k.Button isDisabled>Disabled</k.Button>
          <k.Button variant="neutralSecondary" isDisabled>
            Disabled
          </k.Button>
        </div>
      </section>

      <section data-part="avatars" className="flex items-center gap-3">
        {(["16", "20", "24", "32", "40"] as const).map((size) => (
          <k.Avatar key={size} name="Maya Okafor" size={size} />
        ))}
      </section>

      <section data-part="checks" className="flex w-[420px] flex-col gap-2">
        <k.Checkbox label="Checked" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <k.Checkbox label="Unchecked" checked={false} />
        <k.Checkbox label="Disabled" checked isDisabled />
        <k.Toggle label="Hide weekends" checked={checked} onChange={(e) => setChecked(e.target.checked)} togglePosition="end" />
        <k.Toggle label="Off" checked={false} togglePosition="end" />
        <k.Toggle label="Start" checked isDisabled />
      </section>

      <section data-part="fields" className="flex w-[420px] flex-col gap-3">
        <k.Field label="Customer" description="Who the booking is for">
          <k.TextInput value={text} onChange={(e) => setText(e.target.value)} placeholder="Name" />
        </k.Field>
        <k.Field label="Empty">
          <k.TextInput placeholder="Placeholder" />
        </k.Field>
        <k.Field label="Error" status="error" fieldMessage="This is required">
          <k.TextInput placeholder="Placeholder" />
        </k.Field>
        <k.Field label="Search" labelVisibility="hidden">
          <k.SearchInput placeholder="Search" />
        </k.Field>
        <k.Field label="Notes">
          <k.Textarea placeholder="Add notes" row={3} />
        </k.Field>
        <k.Field label="Repeat">
          <k.SelectMenu>
            <k.SelectMenuTrigger>Does not repeat</k.SelectMenuTrigger>
            <k.SelectMenuPopover>
              <k.SelectMenuListbox>
                <k.SelectMenuItem isSelected>Does not repeat</k.SelectMenuItem>
              </k.SelectMenuListbox>
            </k.SelectMenuPopover>
          </k.SelectMenu>
        </k.Field>
      </section>

      <section data-part="tabs" className="w-[420px]">
        <k.Tabs defaultValue="event">
          <k.TabList>
            <k.TabItem value="booking">Booking</k.TabItem>
            <k.TabItem value="event">Event</k.TabItem>
            <k.TabItem value="class">Class</k.TabItem>
          </k.TabList>
        </k.Tabs>
      </section>

      <section data-part="swatches">
        <k.ColorSwatches colors={["blue", "green", "orange", "purple", "red", "teal"]} value="blue" ariaLabelPrefix="Colour" />
      </section>

      <section data-part="calendar" className="w-[300px]">
        <k.Calendar value={new Date(2026, 9, 22)} visibleMonth={new Date(2026, 9, 1)} weekStartsOn={1} />
      </section>

      <section data-part="loading" className="flex items-center gap-4">
        <k.Loading size="24" />
        <k.Placeholder lines={2} avatar className="w-[200px]" />
      </section>

      <Pickers />
    </main>
  );
}

export default function ParityPage() {
  // Browser-only: the components read the current date, which can't be prerendered.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <KitProvider>{mounted && <Gallery />}</KitProvider>;
}

type Option = { id: string; value: string; subtitle: string };
const OPTIONS: Option[] = [
  { id: "a", value: "Consultation", subtitle: "30 mins" },
  { id: "b", value: "Follow-up", subtitle: "15 mins" },
  { id: "c", value: "Workshop", subtitle: "60 mins" },
];

/** The pickers as the calendar uses them: date chips, subtle time pickers, swatches, comboboxes. */
function Pickers() {
  const k = useKit();
  const [term, setTerm] = useState("");
  const [picked, setPicked] = useState<Option | undefined>(OPTIONS[0]);
  const day = new Date(2026, 9, 22, 10, 0);
  const filtered = OPTIONS.filter((o) => o.value.toLowerCase().includes(term.trim().toLowerCase()));
  const combo = (id: string, selected: Option | undefined, placeholder: string) => (
    <div data-part={id} className="w-[360px]">
      <k.Field label={placeholder} labelVisibility="hidden">
        <k.Combobox
          options={filtered}
          selectedKey="value"
          selectedOption={selected}
          onSelectionChange={(o: Option | undefined) => {
            setTerm("");
            if (o && selected) setPicked(o);
          }}
          inputValue={term || selected?.value || ""}
          onInputChange={setTerm}
          onClose={() => setTerm("")}
          menuTrigger="focus"
          popoverMatchReferenceWidth
        >
          <k.ComboboxTextInput placeholder={placeholder} />
          <k.ComboboxPopover>
            <k.ComboboxListbox options={filtered} noResultsFallback={<span className="text-body-12 text-secondary">No matching results</span>}>
              {(item: Option) => (
                <k.ComboboxItem option={item}>
                  <span className="block truncate text-body-12">{item.value}</span>
                  <span className="block truncate text-body-10 text-secondary">{item.subtitle}</span>
                </k.ComboboxItem>
              )}
            </k.ComboboxListbox>
          </k.ComboboxPopover>
        </k.Combobox>
      </k.Field>
    </div>
  );
  return (
    <>
      <section data-part="datepicker" className="flex items-center gap-4">
        <k.InlineField label="Date" labelVisibility="hidden" className="shrink-0">
          <k.DatePicker
            placeholder="Date"
            trigger={({ triggerProps }) => (
              <button {...triggerProps} type="button" className="h-7 rounded-6px border border-[transparent] px-1.5 text-body-12 hover:border-input focus-visible:focus-ring">
                Thu, 22 Oct
              </button>
            )}
            calendar={({ close }) => <k.Calendar value={day} weekStartsOn={1} hasTodayButton={false} onValueChange={(d?: Date) => close(d)} />}
          />
        </k.InlineField>
        <k.TimePicker label="Start time" variant="subtle" interval={30} defaultValue={day} onSelect={() => {}} />
        <span aria-hidden>–</span>
        <k.TimePicker label="End time" variant="subtle" interval={30} defaultValue={new Date(2026, 9, 22, 11, 0)} onSelect={() => {}} />
        <k.TimePicker label="Standard time" interval={30} defaultValue={day} onSelect={() => {}} />
      </section>

      <section data-part="swatches2" className="w-fit">
        <k.ColorSwatches colors={eventSwatches.map((c) => swatchHex[c])} value={swatchHex.blue} size="20" rows={2} ariaLabelPrefix="Event colour" />
      </section>

      <section data-part="calendar2" className="w-fit">
        <k.Calendar value={new Date(2026, 9, 15)} visibleMonth={new Date(2026, 9, 1)} weekStartsOn={1} hasTodayButton={false} />
      </section>

      {combo("combo-selected", picked, "Select a service")}
      {combo("combo-empty", undefined, "Add guest(s)")}
    </>
  );
}
