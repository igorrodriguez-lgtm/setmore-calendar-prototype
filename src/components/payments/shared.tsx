"use client";

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Cog,
  Compass,
  Contact,
  CreditCard,
  LayoutGrid,
  ListChecks,
  MessageCircle,
  Phone,
  Share,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { type LinkStatus, LINKS, money, SALES, TRANSACTIONS } from "./data";
import { BEFORE_OPTIONS, STATES, usePrototype } from "./state";

/** Setmore's left navigation, as in every Figma frame. Payments is the current page. */
export function AppShell({ children, payments = true }: { children: ReactNode; payments?: boolean }) {
  const items = [
    { icon: Calendar, label: "Calendar" },
    { icon: ListChecks, label: "Services" },
    { icon: MessageCircle, label: "Connect" },
    { icon: Contact, label: "Customers" },
    ...(payments ? [{ icon: CreditCard, label: "Payments", current: true }] : []),
    { icon: LayoutGrid, label: "Integrations" },
    { icon: Phone, label: "Phone" },
    { icon: Cog, label: "Settings" },
  ];
  return (
    <div className="pp-app">
      <nav className="pp-nav" aria-label="Main">
        <div>
          <div className="pp-logo">
            setmore <Compass size={14} aria-hidden />
          </div>
          <ul>
            {items.map(({ icon: Icon, label, current }) => (
              <li key={label} aria-current={current ? "page" : undefined}>
                <Icon aria-hidden /> {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="pp-nav-foot">
          <div className="pp-share">
            <Share size={14} aria-hidden />
            <div>
              Share your Booking Page<small>anywhere.setmore.com</small>
            </div>
          </div>
          <div className="pp-getpro">Get Pro</div>
          <div style={{ padding: "6px 8px" }}>AnywhereWorks</div>
        </div>
      </nav>
      <main className="pp-main">{children}</main>
    </div>
  );
}

export function ProviderLogo({ id }: { id: "stripe" | "square" | "paypal" | "lawpay" | "cash" }) {
  const letter = { stripe: "S", square: "■", paypal: "P", lawpay: "LAW PAY", cash: "$" }[id];
  return (
    <span className={`pp-logo-tile ${id}`} aria-hidden>
      {letter}
    </span>
  );
}

/* ---------------- Payments history ---------------- */

/** Before: Sales and Transactions only, Figma's columns and chips. */
export function BeforeHistory() {
  const [tab, setTab] = useState<"sales" | "tx">("sales");
  return (
    <section className="b-section">
      <h2>Payments history</h2>
      <div>
        <div className="b-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "sales"} onClick={() => setTab("sales")} type="button">
            Sales
          </button>
          <button role="tab" aria-selected={tab === "tx"} onClick={() => setTab("tx")} type="button">
            Transactions
          </button>
        </div>
        <div className="b-chips">
          <span className="on">Date: Last 7 days ×</span>
          <span>+ Customer</span>
          {tab === "sales" ? <span>+ Booking ID</span> : <span>+ Type</span>}
          <span>+ {tab === "sales" ? "Status" : "Method"}</span>
        </div>
        <table className="b-table">
          <thead>
            {tab === "sales" ? (
              <tr>
                <th>Sale created on ⌃</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Value</th>
                <th>Booking ID</th>
                <th>Receipt</th>
                <th />
              </tr>
            ) : (
              <tr>
                <th>Payment date ⌃</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th />
              </tr>
            )}
          </thead>
          <tbody>
            {tab === "sales"
              ? SALES.map((s) => (
                  <tr key={s.created}>
                    <td>{s.created}</td>
                    <td>{s.customer}</td>
                    <td>{s.status}</td>
                    <td>{money(s.value)}</td>
                    <td>{s.bookingId ?? "----"}</td>
                    <td>
                      <u>View</u>
                    </td>
                    <td>⋮</td>
                  </tr>
                ))
              : TRANSACTIONS.map((t) => (
                  <tr key={t.date}>
                    <td>{t.date}</td>
                    <td>{t.customer}</td>
                    <td>{money(t.amount)}</td>
                    <td>{t.type}</td>
                    <td>{t.method}</td>
                    <td>⋮</td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div className="b-foot">
          <span className="b-btn">↓ Export detailed report</span>
          <span>Showing 1 to 10 out of 300 ‹ ›</span>
        </div>
      </div>
    </section>
  );
}

const LINK_TONE: Record<LinkStatus, string> = {
  Paid: "ok",
  Pending: "info",
  Deactivated: "",
  Expired: "warn",
  Failed: "bad",
  Refunded: "",
};

/** After: a third tab for payment links, every status shown (deactivated ones included), softer table. */
export function AfterHistory({ hasStripe }: { hasStripe: boolean }) {
  const [tab, setTab] = useState<"sales" | "tx" | "links">("sales");
  const [status, setStatus] = useState<LinkStatus | "All">("All");
  const shownLinks = status === "All" ? LINKS : LINKS.filter((l) => l.status === status);
  return (
    <section className="a-section">
      <div className="pp-spread" style={{ flexWrap: "wrap" }}>
        <h2>Payments history</h2>
        <div className="a-tabs" role="tablist" aria-label="History">
          <button role="tab" type="button" aria-selected={tab === "sales"} onClick={() => setTab("sales")}>
            Sales
          </button>
          <button role="tab" type="button" aria-selected={tab === "tx"} onClick={() => setTab("tx")}>
            Transactions
          </button>
          <button role="tab" type="button" aria-selected={tab === "links"} onClick={() => setTab("links")}>
            Payment links
          </button>
        </div>
      </div>
      <div className="a-card" style={{ padding: 16, display: "grid", gap: 12 }}>
        {tab === "links" && !hasStripe ? (
          <div style={{ padding: "32px 8px", textAlign: "center", display: "grid", gap: 6 }}>
            <strong>Payment links need Stripe</strong>
            <span className="a-muted">Connect Stripe to send a link by text or email and see here when it's paid.</span>
          </div>
        ) : (
          <>
            <div className="a-filters">
              <button type="button" aria-pressed="true">
                Last 7 days <ChevronDown size={14} aria-hidden />
              </button>
              {tab === "links" ? (
                (["All", "Paid", "Pending", "Deactivated", "Expired", "Failed", "Refunded"] as const).map((s) => (
                  <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
                    {s}
                  </button>
                ))
              ) : (
                <>
                  <button type="button" aria-pressed="false">Customer</button>
                  <button type="button" aria-pressed="false">{tab === "sales" ? "Status" : "Method"}</button>
                </>
              )}
            </div>
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  {tab === "sales" && (
                    <tr>
                      <th>Created</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Value</th>
                      <th>Booking</th>
                      <th>Receipt</th>
                    </tr>
                  )}
                  {tab === "tx" && (
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Method</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  )}
                  {tab === "links" && (
                    <tr>
                      <th>Created</th>
                      <th>Link</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                      <th>Note</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {tab === "sales" &&
                    SALES.map((s) => (
                      <tr key={s.created}>
                        <td>{s.created}</td>
                        <td>{s.customer}</td>
                        <td>
                          <span className={`a-badge ${s.status === "Paid" ? "ok" : s.status === "Deposit" ? "info" : "warn"}`}>
                            {s.status === "Deposit" ? "Deposit paid" : s.status}
                          </span>
                        </td>
                        <td className="pp-num" style={{ textAlign: "right" }}>{money(s.value)}</td>
                        <td>{s.bookingId ?? <span className="a-muted">Quick payment</span>}</td>
                        <td>
                          <button type="button" className="a-link">View</button>
                        </td>
                      </tr>
                    ))}
                  {tab === "tx" &&
                    TRANSACTIONS.map((t) => (
                      <tr key={t.date}>
                        <td>{t.date}</td>
                        <td>{t.customer}</td>
                        <td>{t.type}</td>
                        <td>{t.method}</td>
                        <td className="pp-num" style={{ textAlign: "right", color: t.amount < 0 ? "var(--danger)" : undefined }}>
                          {money(t.amount)}
                        </td>
                      </tr>
                    ))}
                  {tab === "links" &&
                    shownLinks.map((l) => (
                      <tr key={l.url} className={l.status === "Deactivated" || l.status === "Expired" ? "dim" : undefined}>
                        <td>{l.created}</td>
                        <td className="url" title={l.url}>{l.url}</td>
                        <td>{l.customer}</td>
                        <td>
                          <span className={`a-badge ${LINK_TONE[l.status]}`}>{l.status}</span>
                        </td>
                        <td className="pp-num" style={{ textAlign: "right" }}>{money(l.amount)}</td>
                        <td>{l.note ? <button type="button" className="a-link">View</button> : <span className="a-muted">—</span>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="pp-spread a-muted" style={{ fontSize: 13 }}>
              <button type="button" className="a-btn quiet">Export</button>
              <span>1–{tab === "links" ? shownLinks.length : 5} of {tab === "links" ? shownLinks.length : 300}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ---------------- Dev panel ---------------- */

export function DevPanel() {
  const p = usePrototype();
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <div className="pp-dev closed">
        <header>
          <span>Prototype · {p.version === "before" ? "Before" : "After"}</span>
          <button type="button" className="icon" aria-label="Open prototype panel" onClick={() => setOpen(true)}>
            <ChevronUp size={16} />
          </button>
        </header>
      </div>
    );
  }
  return (
    <aside className="pp-dev" aria-label="Prototype controls">
      <header>
        <span>Prototype controls</span>
        <button type="button" className="icon" aria-label="Minimise prototype panel" onClick={() => setOpen(false)}>
          <ChevronDown size={16} />
        </button>
      </header>
      <div className="seg" role="group" aria-label="Version">
        <button type="button" aria-pressed={p.version === "before"} onClick={() => p.setVersion("before")}>
          Before
        </button>
        <button type="button" aria-pressed={p.version === "after"} onClick={() => p.setVersion("after")}>
          After
        </button>
      </div>
      <div className="label">Account state</div>
      <div className="states" role="group" aria-label="Account state">
        {STATES.map((s) => (
          <button key={s.id} type="button" aria-pressed={p.state === s.id} onClick={() => p.setState(s.id)}>
            <span>{s.label}</span>
            <small>{s.hint}</small>
          </button>
        ))}
      </div>
      <label className="line">
        Before: Figma option
        <select value={p.option} onChange={(e) => p.setOption(e.target.value as typeof p.option)}>
          {BEFORE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="line">
        Side by side
        <input type="checkbox" checked={p.compare} onChange={(e) => p.setCompare(e.target.checked)} />
      </label>
    </aside>
  );
}
