"use client";

import {
  ArrowRight,
  Ban,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Heart,
  Landmark,
  Link2,
  ListChecks,
  Lock,
  Pencil,
  Percent,
  ReceiptText,
  Smartphone,
  Tag,
  User,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { BALANCE, CHECKOUT, money } from "./data";
import { AppShell, BeforeHistory, ProviderLogo } from "./shared";
import { type AccountState, type BeforeOption, type Pane, usePane, usePrototype } from "./state";

/**
 * BEFORE: the current Figma, "Payments settings - layout Quick fix to accomodate new features"
 * (UtCq0DJzu3NNekq8doDXu4, node 1:23021), including its flaws on purpose: two landing pages before any
 * connect step, a provider modal before Stripe, 12px body text, the "Bookinfg fee" typo and a checkout total
 * that doesn't match its lines, the "Stipe" typo, and a forced "disconnect" modal before switching.
 */
export function BeforeView({ state, option }: { state: AccountState; option: BeforeOption }) {
  const pane = usePane(state === "connecting" ? "onboarding" : "landing");
  const { finishConnect, justConnected, dismissConnected } = usePrototype();
  const inConnectFlow = pane.flow === "choose" || pane.flow === "provider-modal" || pane.flow === "onboarding";

  let body: React.ReactNode;
  if (inConnectFlow || state === "connecting") body = <ChooseProvider pane={pane} />;
  else if (state === "empty") body = pane.flow === "landing-2" ? <Landing2 pane={pane} /> : <Landing pane={pane} />;
  else if (state === "cash") body = <Cash pane={pane} />;
  else if (state === "other") body = <OtherProvider pane={pane} />;
  else if (state === "full") body = <StripeFull pane={pane} />;
  else body = <StripeOption option={option} pane={pane} />;

  return (
    <div className="pp-before">
      <AppShell>{body}</AppShell>
      {(pane.flow === "provider-modal") && <ProviderModal pane={pane} />}
      {(pane.flow === "onboarding" || (state === "connecting" && !inConnectFlow)) && (
        <Onboarding onClose={() => pane.setFlow("choose")} onDone={() => { pane.setFlow("done"); finishConnect("setup"); }} />
      )}
      {justConnected && state === "setup" && <AllSet onClose={dismissConnected} onManage={() => { dismissConnected(); pane.setSettingsOpen(true); }} />}
      {pane.dialog === "disconnect" && (
        <div className="b-scrim" role="dialog" aria-modal="true" aria-label="Disconnect Square">
          <div className="b-small">
            <button type="button" className="b-x" aria-label="Close" onClick={() => pane.setDialog(null)}><X size={14} /></button>
            <h3>Disconnect Square?</h3>
            <p className="b-sub">
              To use Stipe you need to disconnect Square first. Customers won't be able to pay online until Stripe is set up.
            </p>
            <div className="pp-row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="b-btn ghost" onClick={() => pane.setDialog(null)}>Cancel</button>
              <button type="button" className="b-btn primary" onClick={() => { pane.setDialog(null); pane.setFlow("choose"); }}>
                Yes, disconnect Square
              </button>
            </div>
          </div>
        </div>
      )}
      {pane.settingsOpen && <SettingsSlideout onClose={() => pane.setSettingsOpen(false)} />}
    </div>
  );
}

/* ---------- Empty: two landing pages ---------- */

function CheckoutArt({ withLink }: { withLink: boolean }) {
  const { service, fee, promo } = CHECKOUT;
  return (
    <div className="b-art" aria-hidden>
      {withLink && (
        <div className="b-float" style={{ left: "-4%", top: "-4%" }}>
          <Link2 size={14} /> <div>Payment link sent<small>$45.00 · Anna K.</small></div>
        </div>
      )}
      <div className="b-float" style={{ right: "-5%", top: "4%" }}>
        <Smartphone size={14} /> <div>Tap to pay<small>At the front desk</small></div>
      </div>
      <div className="b-checkout">
        <strong>{service.name}</strong>
        <span className="b-sub">{service.when}</span>
        <div className="line"><span>Service total</span><span>{money(service.total)}</span></div>
        {/* Kept from Figma: the "Bookinfg" typo, and a deposit that doesn't follow from the lines above. */}
        <div className="line"><span>Bookinfg fee</span><span>{money(fee)}</span></div>
        <div className="line"><span>{promo.code}</span><span>−{money(promo.off)}</span></div>
        <div className="total"><span>Deposit to pay now</span><span>$18.00</span></div>
        <div className="pay">Pay &amp; confirm</div>
      </div>
      <div className="b-float" style={{ left: "-3%", bottom: "14%" }}>
        <CheckCircle2 size={14} /> <div>Deposit received<small>$18.00 · booking confirmed</small></div>
      </div>
      {withLink && (
        <div className="b-float" style={{ right: "-4%", bottom: "2%" }}>
          <Clock size={14} /> <div>Payout on its way<small>$3,240.50 to your bank</small></div>
        </div>
      )}
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Ban; title: string; text: string }) {
  return (
    <div className="b-feature">
      <span className="ico"><Icon size={14} /></span>
      <div><strong>{title}</strong><span>{text}</span></div>
    </div>
  );
}

function Landing({ pane }: { pane: Pane }) {
  return (
    <div className="b-landing">
      <div>
        <h1>Time is money</h1>
        <p className="lead">Connect your go-to payment app for secure, easy payments, online and in person.</p>
        <div className="b-features">
          <Feature icon={Ban} title="Fewer no-shows" text="Take a deposit or the full amount through your Booking Page." />
          <Feature icon={CreditCard} title="Every way to pay" text="Accept cards, digital wallets and cash, with fees and discounts built in." />
          <Feature icon={ListChecks} title="Super simple" text="Track every sale, refund and payout from one place." />
        </div>
        <button type="button" className="b-btn primary" onClick={() => pane.setFlow("landing-2")}>Connect payments</button>
      </div>
      <CheckoutArt withLink />
    </div>
  );
}

function Landing2({ pane }: { pane: Pane }) {
  return (
    <div className="b-landing">
      <div>
        <h1>Get paid your way.</h1>
        <p className="lead">Connect payments to give customers more ways to pay.</p>
        <div className="b-features">
          <Feature icon={Wallet} title="Get paid online" text="Accept cards, Apple Pay and Google Pay when customers book." />
          <Feature icon={CreditCard} title="Take deposits & upfront payments" text="Secure bookings and reduce the risk of no-shows." />
          <Feature icon={Link2} title="Share payment links" text="Get paid anywhere — by text, email or social." />
          <Feature icon={ReceiptText} title="Track every payment" text="Keep sales, refunds and payouts together in one place." />
        </div>
        <button type="button" className="b-btn primary" onClick={() => pane.setFlow("choose")}>Connect payments</button>
      </div>
      <CheckoutArt withLink={false} />
    </div>
  );
}

/* ---------- Choose provider + modal + Stripe onboarding ---------- */

function ChooseProvider({ pane }: { pane: Pane }) {
  const [picked, setPicked] = useState<"stripe" | "square" | "paypal" | "lawpay">("stripe");
  const rows: [string, string, string][] = [
    ["Deposits & upfront payments", "✓", "✓"],
    ["Charges & reductions", "✓", "✓"],
    ["Payment links", "✓", "–"],
    ["Instant payouts", "✓", "–"],
    ["Tips at checkout", "Soon", "–"],
    ["Card readers", "Soon", "–"],
    ["Hold card for no-show", "Soon", "–"],
  ];
  const names = { stripe: "Stripe", square: "Square", paypal: "PayPal", lawpay: "LawPay" } as const;
  return (
    <>
      <div className="b-header">
        <h1>
          <button type="button" className="b-btn ghost" style={{ padding: 0, fontSize: 16, fontWeight: 600 }} onClick={() => pane.setFlow("landing-2")}>
            ‹ Choose provider
          </button>
        </h1>
      </div>
      <div className="b-choose">
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "24px 0 16px" }}>Which payment provider do you want to use?</h2>
          <div role="radiogroup" aria-label="Payment provider">
            {(Object.keys(names) as (keyof typeof names)[]).map((id) => (
              <button key={id} type="button" role="radio" aria-checked={picked === id} className="b-radio" onClick={() => setPicked(id)}>
                <span className="b-dot" />
                <ProviderLogo id={id} />
                <span style={{ flex: 1 }}>{names[id]}</span>
                {id === "stripe" && <span className="b-badge">Recommended</span>}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button type="button" className="b-btn primary" onClick={() => pane.setFlow("provider-modal")}>
              Connect to {names[picked]}
            </button>
          </div>
        </div>
        <table className="b-compare">
          <thead><tr><th>Compare</th><th>Stripe</th><th>Others</th></tr></thead>
          <tbody>
            {rows.map(([f, a, b]) => (
              <tr key={f}><td>{f}</td><td>{a === "Soon" ? <span className="b-badge">Soon</span> : a}</td><td>{b}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProviderModal({ pane }: { pane: Pane }) {
  return (
    <div className="b-scrim" role="dialog" aria-modal="true" aria-label="Stripe">
      <div className="b-modal">
        <div className="b-modal-head">
          <ProviderLogo id="stripe" />
          <div><strong style={{ fontSize: 15 }}>Stripe</strong><div className="b-sub">Collect credit and debit card payments easily at the point of booking.</div></div>
          <button type="button" className="b-x" aria-label="Close" onClick={() => pane.setFlow("choose")}><X size={14} /></button>
        </div>
        <div className="b-modal-body">
          <div>
            <div className="b-tabs"><button type="button" aria-selected="true">About</button><button type="button">Instructions</button></div>
            <p className="b-sub" style={{ color: "#333" }}>
              Create an all-in-one online booking and payment system with Setmore and Stripe. Customers can pay in advance for
              appointments through your Booking Page, and you can accept payments in-person through your calendar.
            </p>
            <div style={{ height: 160, marginTop: 16, borderRadius: 6, background: "#635bff" }} aria-hidden />
          </div>
          <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
            <button type="button" className="b-btn primary" onClick={() => pane.setFlow("onboarding")}>Connect</button>
            <strong style={{ marginTop: 8 }}>Have a question?</strong>
            <span className="b-sub">Support article</span>
            <span className="b-sub">Chat with us</span>
            <span className="b-sub">Call us</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Onboarding({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  return (
    <div className="b-scrim" role="dialog" aria-modal="true" aria-label="Stripe – Connect with Setmore">
      <div className="b-onboard">
        <div className="bar">Stripe – Connect with Setmore</div>
        <div className="cols">
          <div className="left">
            <span>Setmore</span>
            <h3>Setmore partners with Stripe for secure payments.</h3>
            <button type="button" onClick={onClose} style={{ background: "none", border: 0, color: "#fff", textAlign: "left", cursor: "pointer", padding: 0 }}>
              ← Return to Setmore
            </button>
          </div>
          <div className="right">
            <h3 style={{ fontSize: 20, color: "#2b3a4a" }}>Get started with Stripe</h3>
            <p className="b-sub">If you're completing this form on behalf of a business, it must be completed by the business owner.</p>
            <label style={{ display: "grid", gap: 4, fontWeight: 500 }}>
              Email address
              <input type="email" defaultValue="owner@example.com" />
            </label>
            <button type="button" className="go" onClick={onDone}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllSet({ onClose, onManage }: { onClose: () => void; onManage: () => void }) {
  return (
    <div className="b-scrim" role="dialog" aria-modal="true" aria-label="You're all set to take payments">
      <div className="b-small">
        <button type="button" className="b-x" aria-label="Close" onClick={onClose}><X size={14} /></button>
        <h3>You're all set to take payments</h3>
        <p className="b-sub">Full payment is now required when customers book on your Booking Page. Change this any time in Payment settings</p>
        <div className="pp-row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="b-btn ghost" onClick={onManage}>Manage settings</button>
          <button type="button" className="b-btn primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Cash only (Figma: Option C, online payments banner, preferred) ---------- */

function Cash({ pane }: { pane: Pane }) {
  return (
    <>
      <div className="b-header"><h1>Payments</h1></div>
      <section className="b-section">
        <div className="b-card" style={{ padding: 28, display: "grid", gridTemplateColumns: "1fr 260px", gap: 24, alignItems: "center" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <span className="b-eyebrow">Online payments</span>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Get paid before they walk in.</h2>
            <p className="b-sub">Connect an online payment provider to take upfront payments, deposits and promo codes straight from your Booking Page.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "8px 0" }}>
              <span className="pp-row"><Landmark className="b-icon" /> Straight to your bank</span>
              <span className="pp-row"><Ban className="b-icon" /> Fewer no shows</span>
              <span className="pp-row"><Tag className="b-icon" /> Fill not-so busy days with promos</span>
              <span className="pp-row"><Link2 className="b-icon" /> Get paid faster</span>
            </div>
            <div className="pp-row">
              <button type="button" className="b-btn primary" onClick={() => pane.setFlow("choose")}>Connect a payment provider</button>
              <span className="b-sub">Works with</span> <ProviderLogo id="stripe" /><ProviderLogo id="square" /><ProviderLogo id="paypal" /><ProviderLogo id="lawpay" />
            </div>
          </div>
          <div className="b-card" style={{ padding: 14, display: "grid", gap: 6 }} aria-hidden>
            <strong>{CHECKOUT.service.name}</strong>
            <div className="b-kv"><span>Service total</span><b>{money(80)}</b></div>
            <div className="b-kv"><span>HAIR20</span><b>−$17.00</b></div>
            <div className="b-kv"><span>Deposit</span><b>$20.00</b></div>
            <div className="b-btn primary" style={{ textAlign: "center" }}>Pay &amp; confirm</div>
          </div>
        </div>
      </section>
      <section className="b-section">
        <h2>Your payment setup</h2>
        <div className="b-card b-setup">
          <div className="b-setup-head">
            <span className="pp-row"><ProviderLogo id="cash" /> <strong style={{ fontSize: 14 }}>Cash</strong> <span className="b-badge">Connected</span></span>
            <button type="button" className="b-btn" onClick={() => pane.setSettingsOpen(true)}>Manage</button>
          </div>
          <div style={{ padding: 16, display: "grid", gap: 8 }}>
            <span className="pp-row"><CheckCircle2 className="b-icon" /> Record cash payments against appointments</span>
            <span className="pp-row"><CheckCircle2 className="b-icon" /> See cash payments in Payments history</span>
          </div>
        </div>
      </section>
      <BeforeHistory />
    </>
  );
}

/* ---------- Stripe connected: the Figma options ---------- */

function Payouts({ stacked = false }: { stacked?: boolean }) {
  return (
    <section className="b-section">
      <h2>Instant payouts</h2>
      <div className="b-payouts" style={stacked ? { gridTemplateColumns: "minmax(0, 430px)" } : undefined}>
        <div style={{ display: "grid", gap: 12 }}>
          {!stacked && (
            <div className="b-promo">
              <div>
                <span className="b-eyebrow">Instant payouts</span>
                <div className="title">Your money. <em>In minutes</em></div>
                <div className="b-checks">
                  <span><CheckCircle2 size={12} /> Access funds faster</span>
                  <span><CheckCircle2 size={12} /> Available on demand</span>
                  <span><CheckCircle2 size={12} /> Safe and secure</span>
                </div>
              </div>
              <span className="pp-row" aria-hidden><ProviderLogo id="stripe" /> <ArrowRight size={16} /> <Landmark size={22} /></span>
            </div>
          )}
          <div className="b-card pp-spread" style={{ padding: 18 }}>
            <div>
              <strong style={{ fontSize: 13 }}>Improve your cash flow</strong>
              <p className="b-sub" style={{ maxWidth: 380 }}>With Instant Payouts, get access to balance within minutes - even weekends and holidays. You currently have {money(BALANCE.available)} available.</p>
            </div>
            <button type="button" className="b-btn primary">Payout Instantly</button>
          </div>
        </div>
        <div className="b-card b-balance">
          <div style={{ display: "grid", gap: 8 }}>
            <span className="b-sub">Total balance</span>
            <span className="big pp-num">{money(BALANCE.available)}</span>
            <div className="b-kv"><span>Upcoming payout (estimated)</span><b>{money(BALANCE.upcoming)}</b></div>
            <div className="b-kv"><span>Scheduled for</span><b>{BALANCE.payoutDate} <u>Update</u></b></div>
          </div>
          <button type="button" className="b-btn">See details</button>
        </div>
      </div>
    </section>
  );
}

function SetupCard({ pane, rows, wide = false }: { pane: Pane; rows: [typeof Calendar, string, string][]; wide?: boolean }) {
  return (
    <div className="b-card b-setup" style={wide ? { width: 395 } : undefined}>
      <div className="b-setup-head">
        <span className="pp-row"><ProviderLogo id="stripe" /> <strong style={{ fontSize: 14 }}>Stripe</strong> <span className="b-badge">Connected</span></span>
        <button type="button" className="b-btn" onClick={() => pane.setSettingsOpen(true)}>{wide ? "Manage payments" : "Manage"}</button>
      </div>
      {rows.map(([Icon, title, sub]) => (
        <div className="b-setup-row" key={title}>
          <Icon className="b-icon" />
          <div style={{ flex: 1 }}><strong>{title}</strong><span className="b-sub">{sub}</span></div>
          {!wide && <Pencil className="b-icon" />}
        </div>
      ))}
    </div>
  );
}

function GuideCard({ pane, open }: { pane: Pane; open: boolean }) {
  const [expanded, setExpanded] = useState(open);
  const items: [typeof Heart, string, string, boolean, string][] = [
    [Heart, "Collect tips at checkout", "+$390/mo · 48 paid bookings × ~$8 tip", false, "Enable"],
    [CreditCard, "Card on file for no-show fees", "$320 lost last month · 6 no-shows", true, "Enable"],
    [Smartphone, "Pair a Stripe reader", "28 payments · recorded by hand last month", true, "Pair"],
    [Percent, "Promo code for quiet slots", "+$210/mo · Tue–Wed mornings 40% booked", false, "Create promo code"],
  ];
  return (
    <div className="b-card">
      <div className="b-guide-head">
        <ProviderLogo id="stripe" />
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 13 }}>Earn upto <span style={{ color: "#2a8a5a" }}>$920</span> more each month.</strong>
          <div className="b-sub">Unlock ways to get paid. 4 payment features aren't on yet.</div>
        </div>
        <button type="button" className="b-btn ghost" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          2 of 6 completed {expanded ? "⌃" : "⌄"}
          <div className="b-progress" style={{ marginTop: 6 }}><i style={{ width: "33%" }} /></div>
        </button>
        <button type="button" className="b-btn" onClick={() => pane.setSettingsOpen(true)}>Manage payments</button>
      </div>
      {expanded &&
        items.map(([Icon, label, chip, warn, action]) => (
          <div className="b-guide-row" key={label}>
            <Icon className="b-icon" />
            <span>{label}</span>
            <span className={`b-chip ${warn ? "warn" : ""}`}>{chip}</span>
            <button type="button" className="b-btn">{action}</button>
          </div>
        ))}
    </div>
  );
}

function StripeOption({ option, pane }: { option: BeforeOption; pane: Pane }) {
  const head = <div className="b-header"><h1>Payments</h1></div>;
  if (option === "a") {
    return (
      <>
        {head}
        <section className="b-section">
          <h2>Your payment setup (or) Payment preference</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="b-card" style={{ padding: 16, display: "grid", gap: 10 }}>
              <span className="pp-row"><ProviderLogo id="stripe" /> <strong>Stripe</strong> <span className="b-badge">Connected</span></span>
              <span className="pp-row"><CheckCircle2 className="b-icon" style={{ color: "#2a8a5a" }} /> All clients are asked to <b>pay 25% deposit upfront.</b></span>
              {["Add charges & discounts", "Save cards for later", "Let customers add a tip", "Pair your Stripe reader - to accept payments in person"].map((t) => (
                <span key={t} className="pp-row b-sub"><span className="b-dot" style={{ width: 12, height: 12, borderRadius: 6, border: "1.5px solid #ccc", display: "inline-block" }} /> {t}</span>
              ))}
              <button type="button" className="b-btn" style={{ justifySelf: "start" }} onClick={() => pane.setSettingsOpen(true)}><Pencil size={12} /> Edit</button>
            </div>
            <div className="b-reader">
              <div style={{ display: "grid", gap: 8 }}>
                <span className="b-badge new" style={{ justifySelf: "start" }}>New</span>
                <strong style={{ fontSize: 18 }}>Take payments with a Stripe reader</strong>
                <p className="b-sub">Pair your Stripe reader to collect payments and keep track of them alongside your bookings.</p>
                <button type="button" className="b-btn" style={{ justifySelf: "start" }}>Pair reader</button>
              </div>
              <div className="ph" aria-hidden />
            </div>
          </div>
        </section>
        <Payouts />
        <section className="b-section">
          <div className="pp-spread"><h2>Revenue Insights</h2><span className="b-btn">This week (17 – 23 Apr) ⌄</span></div>
          <div className="b-insights">
            {[["Payment volume", "$1532.32", ".5%"], ["Successful Payments", "50", "1.2%"], ["Average payments", "$124.32", "1.1%"], ["Refunds", "$125.25", ".5%"]].map(([t, v, d]) => (
              <div className="b-card b-insight" key={t}><span className="b-sub">{t}</span><div className="big">{v}</div><span className="b-sub">↗ {d} from last week</span></div>
            ))}
          </div>
        </section>
        <BeforeHistory />
      </>
    );
  }
  if (option === "b" || option === "b-open") {
    return (
      <>
        {head}
        <section className="b-section"><h2>Your payment setup</h2><GuideCard pane={pane} open={option === "b-open"} /></section>
        <Payouts />
        <BeforeHistory />
      </>
    );
  }
  if (option === "c-live") {
    return (
      <>
        {head}
        <section className="b-section">
          <h2>Your payment setup (or) Payment preference</h2>
          <SetupCard pane={pane} wide rows={[[Calendar, "Take upfront payments", "Off · All customers pay at store"], [Zap, "Charges and reductions", "None added"], [Tag, "Promo codes on quite slots", "None added"]]} />
        </section>
        <Payouts />
        <BeforeHistory />
      </>
    );
  }
  return (
    <>
      {head}
      <section className="b-section">
        <h2>Your payment setup (or) Payment preference</h2>
        <div style={{ display: "grid", gridTemplateColumns: "360px 474px 320px", gap: 12, alignItems: "stretch", overflowX: "auto" }}>
          <SetupCard pane={pane} rows={[[Calendar, "Take upfront payments", "Full payment · All customers pay 100% at the booking"], [Zap, "Charges and reductions", "None added"]]} />
          <div className="b-reader" style={{ gridTemplateColumns: "1fr 110px" }}>
            <div style={{ display: "grid", gap: 6 }}>
              <span className="b-badge new" style={{ justifySelf: "start" }}>New</span>
              <strong style={{ fontSize: 15 }}>Take payments with a Stripe reader</strong>
              <button type="button" className="b-btn" style={{ justifySelf: "start" }}>Pair reader</button>
            </div>
            <div className="ph" style={{ height: 150 }} aria-hidden />
          </div>
          <div className="b-card" style={{ padding: 16, display: "grid", gap: 6 }}>
            <div className="pp-spread"><span className="b-sub">No-shows</span><span className="b-badge warn">Unprotected</span></div>
            <div><strong style={{ fontSize: 22 }}>$320</strong> <span className="b-sub">lost in the last 4 weeks</span></div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }} aria-hidden>
              {[24, 2, 46, 24, 24, 46, 2, 70].map((h, i) => <span key={i} style={{ flex: 1, height: h * 0.8, background: i < 4 ? "#ddd" : "#666", borderRadius: 2 }} />)}
            </div>
            <p className="b-sub">Turn on full payment or deposits to keep part of it to cover no-show loss.</p>
          </div>
        </div>
      </section>
      <Payouts />
      <BeforeHistory />
    </>
  );
}

function StripeFull({ pane }: { pane: Pane }) {
  return (
    <>
      <div className="b-header">
        <h1>Payments</h1>
        <button type="button" className="b-btn" onClick={() => pane.setSettingsOpen(true)}>⚙ Settings</button>
      </div>
      <Payouts />
      <BeforeHistory />
    </>
  );
}

/* ---------- Square / PayPal / LawPay: nudge to switch ---------- */

function OtherProvider({ pane }: { pane: Pane }) {
  return (
    <>
      <div className="b-header"><h1>Payments</h1></div>
      <section className="b-section">
        <div className="b-nudge">
          <div>
            <strong>Get instant payouts, payment links and card readers with Stipe</strong>
            <div className="b-sub">These features are only available when Stripe is your payment provider.</div>
          </div>
          <button type="button" className="b-btn primary" onClick={() => pane.setDialog("disconnect")}>Switch to Stripe</button>
        </div>
      </section>
      <section className="b-section">
        <h2>Your payment setup (or) Payment preference</h2>
        <div className="b-card b-setup">
          <div className="b-setup-head">
            <span className="pp-row"><ProviderLogo id="square" /> <strong style={{ fontSize: 14 }}>Square</strong> <span className="b-badge">Connected</span></span>
            <button type="button" className="b-btn" onClick={() => pane.setSettingsOpen(true)}>Manage</button>
          </div>
          <div className="b-setup-row"><Calendar className="b-icon" /><div style={{ flex: 1 }}><strong>Take upfront payments</strong><span className="b-sub">Deposit · 25% at the booking</span></div><Pencil className="b-icon" /></div>
          <div className="b-setup-row"><Zap className="b-icon" /><div style={{ flex: 1 }}><strong>Charges and reductions</strong><span className="b-sub">None added</span></div><Pencil className="b-icon" /></div>
        </div>
      </section>
      <BeforeHistory />
    </>
  );
}

/* ---------- Inside pages: slide-out with a sidebar ---------- */

function SettingsSlideout({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState("Booking Page");
  const nav: [typeof User, string][] = [[User, "Booking Page"], [Heart, "Tipping"], [Smartphone, "Paired readers"], [Zap, "Charges & Reductions"], [Banknote, "Providers"]];
  return (
    <div className="b-scrim" style={{ placeItems: "stretch" }} role="dialog" aria-modal="true" aria-label="Payment settings">
      <div className="b-sheet">
        <div className="b-sheet-head">Payment settings <button type="button" className="b-x" style={{ position: "static" }} aria-label="Close" onClick={onClose}><X size={16} /></button></div>
        <div className="b-sheet-body">
          <div className="b-side">
            {nav.map(([Icon, label]) => (
              <button key={label} type="button" aria-current={page === label} onClick={() => setPage(label)}><Icon size={14} /> {label}</button>
            ))}
          </div>
          <div className="b-sheet-main">
            <div><strong style={{ fontSize: 14 }}>{page === "Booking Page" ? "Booking Page payments" : page}</strong><div className="b-sub">Choose what clients pay when they book online.</div></div>
            {page === "Booking Page" ? (
              <>
                <div className="b-card" style={{ padding: 14, display: "grid", gap: 12 }}>
                  <div className="pp-spread"><span className="pp-row"><CreditCard className="b-icon" /> <span><strong>Accept online payments</strong><div className="b-sub">Let customers pay by card, Apple Pay or Google Pay when booking.</div></span></span><span className="b-toggle on" /></div>
                  <strong>When customers book, they can</strong>
                  <div className="b-opt on"><span className="b-dot" style={{ border: "4px solid #111", width: 14, height: 14, borderRadius: 7 }} /> Pay in full</div>
                  <div className="b-opt"><span className="b-dot" style={{ border: "1.5px solid #bbb", width: 14, height: 14, borderRadius: 7 }} /> Pay a deposit</div>
                  <div className="b-opt"><span className="b-dot" style={{ border: "1.5px solid #bbb", width: 14, height: 14, borderRadius: 7 }} /> Choose to pay now or later</div>
                </div>
                <strong>Protect against no-shows</strong>
                <div className="b-card pp-spread" style={{ padding: 14 }}><span className="pp-row"><Lock className="b-icon" /> <span><strong>Save card on file</strong><div className="b-sub">Securely save customers cards for future payments and applicable no-show or late-cancellation fees.</div></span></span><span className="b-toggle on" /></div>
              </>
            ) : (
              <div className="b-card" style={{ padding: 24 }}><span className="b-sub">{page} settings</span></div>
            )}
          </div>
        </div>
        <div className="b-sheet-foot"><button type="button" className="b-btn ghost" onClick={onClose}>Close</button><button type="button" className="b-btn" disabled style={{ opacity: .5 }}>Save changes</button></div>
      </div>
    </div>
  );
}
