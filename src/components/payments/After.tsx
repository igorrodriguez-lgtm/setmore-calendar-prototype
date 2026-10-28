"use client";

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  Lock,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { BALANCE, CHECKOUT, money } from "./data";
import { AfterHistory, AppShell, ProviderLogo } from "./shared";
import { type AccountState, usePrototype } from "./state";

/**
 * AFTER: the improved Payments page. No landing pages, one connect step with Stripe's embedded onboarding,
 * a clear success moment, status and balance in one band, a checklist with one obvious next action, a calm
 * switch from another provider, settings behind a segmented control, and every payment-link status shown.
 */
type Dialog = null | { kind: "connect"; mode: "new" | "switch"; step: "embed" | "loading" | "others" | "confirm" };

export function AfterView({ state }: { state: AccountState }) {
  const { finishConnect, justConnected, dismissConnected } = usePrototype();
  const [dialog, setDialog] = useState<Dialog>(
    state === "connecting" ? { kind: "connect", mode: "new", step: "loading" } : null,
  );
  const [settings, setSettings] = useState(false);
  const openConnect = (mode: "new" | "switch") => setDialog({ kind: "connect", mode, step: "embed" });

  const page = settings ? (
    <SettingsPage onBack={() => setSettings(false)} provider={state === "other" ? "square" : state === "cash" ? "cash" : "stripe"} />
  ) : (
    <div className="a-page">
      <div className="a-head">
        <h1>Payments</h1>
        {state !== "empty" && state !== "connecting" && (
          <button type="button" className="a-btn quiet" onClick={() => setSettings(true)}>
            <Settings aria-hidden /> Payment settings
          </button>
        )}
      </div>
      {(state === "empty" || state === "connecting") && <Start onConnect={() => openConnect("new")} onOthers={() => setDialog({ kind: "connect", mode: "new", step: "others" })} />}
      {state === "cash" && <CashState onConnect={() => openConnect("new")} onManage={() => setSettings(true)} />}
      {state === "setup" && <SetupState justConnected={justConnected} onDismiss={dismissConnected} onManage={() => setSettings(true)} />}
      {state === "full" && <FullState onManage={() => setSettings(true)} />}
      {state === "other" && <OtherState onSwitch={() => openConnect("switch")} onManage={() => setSettings(true)} />}
      {state !== "empty" && state !== "connecting" && <AfterHistory hasStripe={state === "setup" || state === "full"} />}
    </div>
  );

  return (
    <div className="pp-after">
      <AppShell>{page}</AppShell>
      {dialog?.kind === "connect" && (
        <ConnectDialog
          mode={dialog.mode}
          step={dialog.step}
          setStep={(step) => setDialog({ ...dialog, step })}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null);
            finishConnect("setup");
          }}
        />
      )}
    </div>
  );
}

/* ---------- Empty: straight into setup ---------- */

function CheckoutPreview() {
  const { service, fee, promo, depositRate } = CHECKOUT;
  const total = service.total + fee - promo.off;
  const deposit = Math.round(total * depositRate * 100) / 100;
  return (
    <div className="a-card a-receipt" aria-label="What your customer sees">
      <span className="a-eyebrow">What your customer sees</span>
      <strong>{service.name}</strong>
      <span className="a-muted">{service.when}</span>
      <div className="line"><span>Service</span><span className="pp-num">{money(service.total)}</span></div>
      <div className="line"><span>Booking fee</span><span className="pp-num">{money(fee)}</span></div>
      <div className="line"><span>Promo {promo.code}</span><span className="pp-num">−{money(promo.off)}</span></div>
      <div className="total"><span>Total</span><span className="pp-num">{money(total)}</span></div>
      <div className="line"><span>Deposit today (25%)</span><span className="pp-num">{money(deposit)}</span></div>
      <div className="line a-muted"><span>Due at the appointment</span><span className="pp-num">{money(total - deposit)}</span></div>
      <span className="a-btn primary" style={{ justifyContent: "center", marginTop: 4 }} aria-hidden>
        Pay {money(deposit)} deposit
      </span>
    </div>
  );
}

function Start({ onConnect, onOthers }: { onConnect: () => void; onOthers: () => void }) {
  return (
    <div className="a-start">
      <div className="a-card a-start-main">
        <span className="a-badge ok" style={{ justifySelf: "start" }}>About 3 minutes</span>
        <div style={{ display: "grid", gap: 6 }}>
          <h2>Take payments when customers book</h2>
          <p className="a-muted">Connect Stripe once and your Booking Page can take card payments, deposits and Apple&nbsp;Pay.</p>
        </div>
        <ul className="a-benefits">
          <li><ShieldCheck aria-hidden /> Deposits or full payment at booking</li>
          <li><Lock aria-hidden /> Card on file to cover no-shows</li>
          <li><Zap aria-hidden /> Payouts to your bank, instantly when you need them</li>
        </ul>
        <div className="a-actions" style={{ alignItems: "center" }}>
          <button type="button" className="a-btn primary lg" onClick={onConnect}>
            <ProviderLogo id="stripe" /> Connect Stripe <span className="a-badge" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>Recommended</span>
          </button>
          <button type="button" className="a-link" onClick={onOthers}>Use another provider</button>
        </div>
      </div>
      <CheckoutPreview />
    </div>
  );
}

function ConnectDialog({
  mode,
  step,
  setStep,
  onClose,
  onDone,
}: {
  mode: "new" | "switch";
  step: "embed" | "loading" | "others" | "confirm";
  setStep: (s: "embed" | "loading" | "others" | "confirm") => void;
  onClose: () => void;
  onDone: () => void;
}) {
  const title = step === "others" ? "Use another provider" : step === "confirm" ? "Switch to Stripe?" : mode === "switch" ? "Set up Stripe" : "Connect Stripe";
  return (
    <div className="a-scrim" role="dialog" aria-modal="true" aria-label={title}>
      <div className="a-dialog">
        <div className="a-dialog-head">
          <div style={{ display: "grid", gap: 4 }}>
            <h3>{title}</h3>
            {step === "embed" || step === "loading" ? (
              <span className="a-muted">
                {mode === "switch" ? "Square keeps working while you set this up. You'll confirm the switch at the end." : "Deposits, card on file and no-show protection, turned on as soon as you're connected."}
              </span>
            ) : null}
          </div>
          <button type="button" className="a-x" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="a-dialog-body">
          {(step === "embed" || step === "loading") && (
            <div className="a-embed" aria-label="Stripe onboarding (embedded)">
              {step === "loading" ? (
                <div>
                  <strong style={{ color: "var(--text-strong)" }}>Connecting to Stripe…</strong>
                  <div className="bar" />
                  <button type="button" className="a-link" style={{ marginTop: 14 }} onClick={() => (mode === "switch" ? setStep("confirm") : onDone())}>
                    Skip ahead (prototype)
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10, width: "min(320px, 100%)", textAlign: "left" }}>
                  <span className="a-eyebrow">Stripe · embedded onboarding</span>
                  <label style={{ display: "grid", gap: 4, color: "var(--text-strong)" }}>
                    Business email
                    <input type="email" defaultValue="owner@example.com" style={{ height: 36, border: "1px solid var(--border)", borderRadius: 10, padding: "0 10px", font: "inherit" }} />
                  </label>
                  <button type="button" className="a-btn primary" style={{ justifyContent: "center" }} onClick={() => setStep("loading")}>
                    Continue
                  </button>
                </div>
              )}
            </div>
          )}
          {step === "others" && (
            <>
              <p className="a-muted">Deposits work with every provider. Payment links, instant payouts and card readers need Stripe.</p>
              <div className="a-provider-list">
                {(["square", "paypal", "lawpay"] as const).map((id) => (
                  <button key={id} type="button" onClick={onClose}>
                    <ProviderLogo id={id} />
                    <span style={{ flex: 1, fontWeight: 500 }}>{{ square: "Square", paypal: "PayPal", lawpay: "LawPay" }[id]}</span>
                    <ArrowRight size={16} aria-hidden />
                  </button>
                ))}
              </div>
            </>
          )}
          {step === "confirm" && (
            <div style={{ display: "grid", gap: 12 }}>
              <p>Stripe is ready. Switching now:</p>
              <ul className="a-benefits">
                <li><Check aria-hidden /> New bookings are paid through Stripe</li>
                <li><Check aria-hidden /> Your Square payments stay in Payments history</li>
                <li><Check aria-hidden /> Square is disconnected; you can reconnect it any time</li>
              </ul>
            </div>
          )}
        </div>
        <div className="a-dialog-foot">
          {step === "others" ? (
            <button type="button" className="a-link" onClick={() => setStep("embed")}>Back to Stripe</button>
          ) : step === "confirm" ? (
            <button type="button" className="a-btn quiet" onClick={onClose}>Keep Square for now</button>
          ) : mode === "new" ? (
            <button type="button" className="a-link" onClick={() => setStep("others")}>Use another provider</button>
          ) : (
            <span className="a-muted" style={{ fontSize: 13 }}>Nothing changes until you confirm.</span>
          )}
          {step === "confirm" ? (
            <button type="button" className="a-btn primary" onClick={onDone}>Switch to Stripe</button>
          ) : (
            <button type="button" className="a-btn quiet" onClick={onClose}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Overview band: status + balance + key actions ---------- */

function Overview({
  provider,
  facts,
  onManage,
  payoutPrimary,
}: {
  provider: "stripe" | "square" | "cash";
  facts: string[];
  onManage: () => void;
  payoutPrimary: boolean;
}) {
  const name = { stripe: "Stripe", square: "Square", cash: "Cash" }[provider];
  return (
    <div className="a-card a-overview">
      <div>
        <span className="a-eyebrow">Payment setup</span>
        <div className="a-provider-row">
          <ProviderLogo id={provider} />
          <div className="grow"><strong>{name}</strong> <span className="a-badge ok"><Check size={12} aria-hidden /> Connected</span></div>
          <button type="button" className="a-btn" onClick={onManage}>Manage</button>
        </div>
        <div className="a-facts">
          {facts.map((f) => <span key={f}><Check aria-hidden /> {f}</span>)}
        </div>
      </div>
      {provider === "stripe" ? (
        <div>
          <span className="a-eyebrow">Balance</span>
          <div className="pp-spread" style={{ alignItems: "end" }}>
            <span className="a-money pp-num">{money(BALANCE.available)}</span>
            <span className="a-muted">available</span>
          </div>
          <div className="a-kv"><span className="a-muted">Next payout · {BALANCE.payoutDate}</span><span className="pp-num">{money(BALANCE.upcoming)}</span></div>
          <div className="a-actions">
            <button type="button" className={`a-btn ${payoutPrimary ? "primary" : ""}`}><Zap aria-hidden /> Pay out instantly</button>
            <button type="button" className="a-btn quiet">View payouts</button>
          </div>
        </div>
      ) : (
        <div>
          <span className="a-eyebrow">Balance</span>
          <p className="a-muted">
            {provider === "cash" ? "Cash goes straight to you, so there's nothing to pay out." : "Square shows your balance and payouts in its own dashboard."}
          </p>
          <span className="a-muted" style={{ fontSize: 13 }}>Instant payouts come with Stripe.</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Connected states ---------- */

const STEPS = [
  { id: "connect", label: "Connect Stripe", action: "" },
  { id: "pay", label: "Choose how customers pay", action: "" },
  { id: "noshow", label: "Protect against no-shows with a card on file", action: "Turn on card on file" },
  { id: "charges", label: "Add booking fees or discounts", action: "Add a fee or discount" },
  { id: "tips", label: "Let customers add a tip", action: "Turn on tips" },
];

function SetupState({ justConnected, onDismiss, onManage }: { justConnected: boolean; onDismiss: () => void; onManage: () => void }) {
  const [done, setDone] = useState<string[]>(["connect", "pay"]);
  const next = STEPS.find((s) => !done.includes(s.id));
  return (
    <>
      {justConnected && (
        <div className="a-card a-success" role="status">
          <span className="seal"><Check size={20} aria-hidden /></span>
          <div>
            <strong style={{ fontSize: 16 }}>Stripe is connected. You can take payments now.</strong>
            <div className="a-live">
              <span className="a-badge ok">Card payments on your Booking Page</span>
              <span className="a-badge ok">Full payment at booking</span>
              <span className="a-badge ok">Payouts to •••• 4242</span>
            </div>
          </div>
          <button type="button" className="a-x" aria-label="Dismiss" onClick={onDismiss}><X size={18} /></button>
        </div>
      )}
      <div className="a-guide">
        <div className="a-card a-guide-main">
          <div className="pp-spread">
            <div style={{ display: "grid", gap: 4 }}>
              <h2>Finish setting up</h2>
              <span className="a-muted">{done.length} of {STEPS.length} done{next ? ` · next: ${next.label.toLowerCase()}` : ""}</span>
            </div>
            <span className="a-muted pp-num">{Math.round((done.length / STEPS.length) * 100)}%</span>
          </div>
          <div className="a-meter" aria-hidden><i style={{ width: `${(done.length / STEPS.length) * 100}%` }} /></div>
          <ol className="a-steps">
            {STEPS.map((s) => {
              const isDone = done.includes(s.id);
              const isNext = next?.id === s.id;
              return (
                <li key={s.id} className={`a-step ${isDone ? "done" : ""} ${isNext ? "next" : ""}`}>
                  <span className="tick" aria-hidden>{isDone ? <Check /> : null}</span>
                  <span className="label">{s.label}</span>
                  {isDone ? (
                    <span className="a-muted" style={{ fontSize: 13 }}>Done</span>
                  ) : (
                    <button type="button" className={`a-btn ${isNext ? "primary" : "quiet"}`} onClick={() => setDone([...done, s.id])}>
                      {isNext ? s.action : "Set up"}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
        <aside className="a-aside" aria-label="Card reader">
          <span className="a-eyebrow">Optional</span>
          <strong>Take cards at the front desk</strong>
          <span className="a-muted">Pair a Stripe reader and in-person payments land in the same history.</span>
          <button type="button" className="a-btn quiet" style={{ justifySelf: "start", paddingLeft: 0 }}><Smartphone aria-hidden /> Pair a reader</button>
        </aside>
      </div>
      <Overview provider="stripe" facts={["Full payment at booking", "No fees or discounts yet"]} onManage={onManage} payoutPrimary={false} />
    </>
  );
}

function FullState({ onManage }: { onManage: () => void }) {
  return (
    <Overview
      provider="stripe"
      facts={["Deposit 25% at booking", "Card on file for no-shows", "Booking fee $8.50", "Tips on"]}
      onManage={onManage}
      payoutPrimary
    />
  );
}

function CashState({ onConnect, onManage }: { onConnect: () => void; onManage: () => void }) {
  return (
    <>
      <Overview provider="cash" facts={["Record cash against appointments", "Cash shows in Payments history"]} onManage={onManage} payoutPrimary={false} />
      <div className="a-card" style={{ padding: 24, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 16, alignItems: "center" }}>
        <div style={{ display: "grid", gap: 4 }}>
          <h2>Take card payments too</h2>
          <span className="a-muted">Customers pay a deposit or in full when they book, and no-shows are covered by a card on file.</span>
        </div>
        <div className="a-actions" style={{ alignItems: "center" }}>
          <button type="button" className="a-link" onClick={onConnect}>Use another provider</button>
          <button type="button" className="a-btn primary" onClick={onConnect}>Connect Stripe</button>
        </div>
      </div>
    </>
  );
}

function OtherState({ onSwitch, onManage }: { onSwitch: () => void; onManage: () => void }) {
  return (
    <>
      <Overview provider="square" facts={["Deposit 25% at booking", "No fees or discounts yet"]} onManage={onManage} payoutPrimary={false} />
      <div className="a-card" style={{ padding: 24, display: "grid", gridTemplateColumns: "auto minmax(0,1fr) auto", gap: 16, alignItems: "center" }}>
        <Sparkles size={22} aria-hidden style={{ color: "var(--brand)" }} />
        <div style={{ display: "grid", gap: 4 }}>
          <strong style={{ fontSize: 16 }}>Get payment links, instant payouts and card readers with Stripe</strong>
          <span className="a-muted">Square keeps working while you set Stripe up. Your history stays, and you confirm the switch at the end.</span>
        </div>
        <button type="button" className="a-btn" onClick={onSwitch}>Set up Stripe</button>
      </div>
    </>
  );
}

/* ---------- Settings: segmented control (alternative: a full page per section) ---------- */

const SECTIONS = ["Booking Page", "No-shows", "Fees & discounts", "Tips", "Card readers", "Provider"] as const;

function SettingsPage({ onBack, provider }: { onBack: () => void; provider: "stripe" | "square" | "cash" }) {
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Booking Page");
  const [online, setOnline] = useState(true);
  const [card, setCard] = useState(true);
  return (
    <div className="a-page">
      <div style={{ display: "grid", gap: 12 }}>
        <button type="button" className="a-btn quiet" style={{ justifySelf: "start", paddingLeft: 4 }} onClick={onBack}><ArrowLeft aria-hidden /> Payments</button>
        <div className="a-head"><h1>Payment settings</h1></div>
        <div className="a-seg" role="group" aria-label="Settings section">
          {SECTIONS.map((s) => (
            <button key={s} type="button" aria-pressed={section === s} onClick={() => setSection(s)}>{s}</button>
          ))}
        </div>
      </div>
      <div className="a-card" style={{ padding: 24, display: "grid", gap: 18, maxWidth: 720 }}>
        {section === "Booking Page" && (
          <>
            <div className="pp-spread">
              <div style={{ display: "grid", gap: 2 }}><strong>Take payments on your Booking Page</strong><span className="a-muted">Card, Apple Pay and Google Pay.</span></div>
              <button type="button" role="switch" aria-checked={online} aria-label="Take payments on your Booking Page" className="a-switch" onClick={() => setOnline(!online)} />
            </div>
            <div className="a-choice" role="radiogroup" aria-label="When customers book">
              {[["full", "Full payment", "Customers pay the whole amount when they book."], ["deposit", "Deposit", "Customers pay 25% now and the rest at the appointment."], ["later", "Pay now or later", "Customers choose."]].map(([id, t, d], i) => (
                <label key={id}><input type="radio" name="pay-when" defaultChecked={i === 0} disabled={!online} /><span><strong>{t}</strong><br /><span className="a-muted">{d}</span></span></label>
              ))}
            </div>
          </>
        )}
        {section === "No-shows" && (
          <div className="pp-spread">
            <div style={{ display: "grid", gap: 2 }}><strong>Save a card on file</strong><span className="a-muted">Charge a no-show or late-cancellation fee you set.</span></div>
            <button type="button" role="switch" aria-checked={card} aria-label="Save a card on file" className="a-switch" onClick={() => setCard(!card)} />
          </div>
        )}
        {section === "Provider" && (
          <div className="a-provider-row">
            <ProviderLogo id={provider} />
            <div className="grow"><strong>{{ stripe: "Stripe", square: "Square", cash: "Cash" }[provider]}</strong> <span className="a-badge ok">Connected</span></div>
            <button type="button" className="a-btn quiet">Disconnect</button>
          </div>
        )}
        {(section === "Fees & discounts" || section === "Tips" || section === "Card readers") && (
          <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
            {section === "Card readers" ? <Smartphone aria-hidden /> : section === "Tips" ? <Wallet aria-hidden /> : <Banknote aria-hidden />}
            <strong>{section === "Fees & discounts" ? "No fees or discounts yet" : section === "Tips" ? "Tips are off" : "No readers paired"}</strong>
            <button type="button" className="a-btn">{section === "Fees & discounts" ? "Add a fee or discount" : section === "Tips" ? "Turn on tips" : "Pair a reader"}</button>
          </div>
        )}
      </div>
      <p className="a-muted" style={{ fontSize: 13 }}>Alternative to explore: one full page per section instead of the segmented control.</p>
    </div>
  );
}
