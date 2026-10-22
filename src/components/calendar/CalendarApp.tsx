"use client";

import { useEffect, useState } from "react";
import { KitProvider, KitToggle, useKit, useKitName } from "../kit";
import { NewCalendarApp } from "../new-ui/NewCalendarApp";
import { CalendarProvider, useCalendar } from "./state/store";
import { AppNav } from "./shell/AppNav";
import { CalendarPanel } from "./shell/CalendarPanel";
import { Header, PanelLabel } from "./shell/Header";
import { TimeGrid } from "./views/TimeGrid";
import { MonthView } from "./views/MonthView";
import { AgendaView } from "./views/AgendaView";
import { AppointmentComposer } from "./booking/AppointmentForm";
import { AppointmentPopover } from "./booking/AppointmentPopover";

export function CalendarApp() {
  // Dates and time zones differ between server and browser, so render only in the browser.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;
  return (
    <KitProvider>
      <CalendarProvider>
        <ShellForKit />
        <KitToggle />
      </CalendarProvider>
    </KitProvider>
  );
}

/** shadcn, EDS and Test share one calendar; New is the separate light-refresh calendar. */
function ShellForKit() {
  return useKitName() === "new" ? <NewCalendarApp /> : <Shell />;
}

/** True below `px` wide. */
function useNarrow(px: number) {
  const [narrow, setNarrow] = useState(() => window.innerWidth < px);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px - 1}px)`);
    const update = () => setNarrow(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [px]);
  return narrow;
}

function Shell() {
  const store = useCalendar();
  const isCompact = useNarrow(730);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-primary">
      <AppNav isCompact={isCompact} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header data-print-hide className="flex h-[50px] shrink-0 items-center gap-2 pl-2.5 pr-2">
          <div className={store.isPanelOpen ? "w-[150px] shrink-0" : "shrink-0"}>
            <PanelLabel />
          </div>
          <Header />
        </header>
        <div className="flex min-h-0 flex-1">
          {store.isPanelOpen && <CalendarPanel />}
          <main className="flex min-w-0 flex-1 flex-col" aria-label="Calendar">
            <CurrentView />
          </main>
        </div>
      </div>

      <AppointmentPopover />
      <AppointmentComposer />
      <DeleteConfirm />
      <AddCustomerModal />
      <Toast />
    </div>
  );
}

function CurrentView() {
  const { view } = useCalendar();
  if (view === "month") return <MonthView />;
  if (view === "agenda") return <AgendaView />;
  return <TimeGrid />;
}

function DeleteConfirm() {
  const { AlertModal } = useKit();
  const store = useCalendar();
  const event = store.events.find((e) => e.id === store.pendingDelete);
  const recurring = event && event.repeat.type !== "none";
  return (
    <AlertModal
      open={Boolean(event)}
      title="Delete appointment?"
      description={recurring ? `“${event!.title}” and all its repeats will be removed.` : `“${event?.title ?? ""}” will be removed from the calendar.`}
      onClose={() => store.setPendingDelete(null)}
      cancelButtonProps={{ label: "Cancel", onClick: () => store.setPendingDelete(null) }}
      confirmButtonProps={{ label: "Delete", onClick: () => event && store.deleteEvent(event.id) }}
    />
  );
}

function AddCustomerModal() {
  const { Modal, ModalHeader, ModalContent, ModalFooter, Field, TextInput, Button } = useKit();
  const store = useCalendar();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const close = () => {
    store.setAddingCustomer(false);
    setForm({ name: "", email: "", phone: "" });
  };
  if (!store.isAddingCustomer) return null;
  return (
    <Modal open onClose={close} titleId="add-customer-title" size={400} closeButtonProps={{ label: "Close", onClick: close }}>
      <ModalHeader>
        <h2 id="add-customer-title" className="text-heading-16 font-stronger">
          Add customer
        </h2>
      </ModalHeader>
      <ModalContent>
        <div className="flex flex-col gap-3">
          <Field label="Name">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </Field>
          <Field label="Email" secondaryLabel="(Optional)">
            <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone" secondaryLabel="(Optional)">
            <TextInput type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="neutralTertiary" onClick={close}>
          Cancel
        </Button>
        <Button
          isDisabled={!form.name.trim()}
          onClick={() => {
            store.addCustomer({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
            close();
          }}
        >
          Add customer
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function Toast() {
  const { Snackbar } = useKit();
  const store = useCalendar();
  return <Snackbar open={Boolean(store.toast)} onClose={() => store.showToast("")} title={store.toast ?? ""} placement="bottom-start" />;
}
