import { useMemo, useState } from "react";

// 👉 Change this to your WhatsApp number: country code + number, no "+" or spaces.
const WHATSAPP_NUMBER = "254712782669";

// Layout legend: D = driver, S = passenger seat, . = empty space / aisle.
// Seat numbers are generated automatically. Add or edit vehicles here.
const VEHICLES = [
  { id: "car5", name: "5 seater", kind: "Saloon / SUV", cols: 3, rows: ["D.S", "SSS", "S.."] },
  { id: "van11", name: "11 seater", kind: "Mini van", cols: 5, rows: ["D...S", "SS.SS", "SS.SS", "S...S"] },
  { id: "van14", name: "14 seater", kind: "Matatu", cols: 5, rows: ["D...S", "SS.SS", "SS.SS", "SSSSS"] },
  { id: "bus32", name: "32 seater", kind: "Coach", cols: 5, rows: ["D....", ...Array(8).fill("SS.SS")] },
];

const TIMES = ["05:00", "06:30", "08:00", "09:30", "11:00", "13:00", "15:00", "17:00", "20:00", "22:00"];
const TOWNS = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Nyeri", "Garissa", "Malindi", "Kitale", "Thika"];

function buildSeats(vehicle) {
  let n = 0;
  return vehicle.rows.map((row) =>
    [...row].map((c) => (c === "S" ? { type: "seat", no: ++n } : { type: c === "D" ? "driver" : "gap" }))
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sun text-ink">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="13" rx="3" /><path d="M3 11h18M7 17v2M17 17v2" /><circle cx="7.5" cy="14" r=".5" /><circle cx="16.5" cy="14" r=".5" />
        </svg>
      </div>
      <span className="font-display text-2xl font-extrabold tracking-tight">DirashTravel</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none focus:ring-4 focus:ring-sun/30";

function Seat({ no, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Seat ${no}${selected ? ", selected" : ""}`}
      className={`group relative mx-auto flex h-11 w-11 items-center justify-center rounded-t-xl rounded-b-md border-2 text-sm font-bold transition sm:h-12 sm:w-12 ${
        selected
          ? "border-sun-deep bg-sun text-ink shadow-md scale-105"
          : "border-ink/25 bg-white text-ink/70 hover:border-ink hover:text-ink"
      } focus:outline-none focus-visible:ring-4 focus-visible:ring-sun/50`}
    >
      {no}
      <span className={`absolute -bottom-1.5 h-1.5 w-7 rounded-b-full ${selected ? "bg-sun-deep" : "bg-ink/20"}`} />
    </button>
  );
}

export default function App() {
  const [vehicleId, setVehicleId] = useState("van14");
  const [passengers, setPassengers] = useState(1);
  const [seats, setSeats] = useState([]);
  const [hint, setHint] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", from: "Nairobi", to: "", date: "", time: "08:00" });
  const [errors, setErrors] = useState("");

  const vehicle = VEHICLES.find((v) => v.id === vehicleId);
  const grid = useMemo(() => buildSeats(vehicle), [vehicle]);
  const capacity = grid.flat().filter((c) => c.type === "seat").length;
  const today = new Date().toISOString().split("T")[0];

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function chooseVehicle(id) {
    setVehicleId(id);
    setSeats([]);
    setHint("");
    const cap = VEHICLES.find((v) => v.id === id).rows.join("").replace(/[^S]/g, "").length;
    setPassengers((p) => Math.min(p, cap));
  }

  function changePassengers(next) {
    const n = Math.max(1, Math.min(capacity, next));
    setPassengers(n);
    setSeats((s) => s.slice(0, n));
    setHint("");
  }

  function toggleSeat(no) {
    setHint("");
    if (seats.includes(no)) return setSeats(seats.filter((s) => s !== no));
    if (seats.length < passengers) return setSeats([...seats, no].sort((a, b) => a - b));
    if (passengers === 1) return setSeats([no]); // single passenger: just swap the seat
    setHint(`You're booking for ${passengers} passengers. Tap a selected seat to release it, or add more passengers.`);
  }

  function book(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.to.trim() || !form.date)
      return setErrors("Fill in your name, phone, destination and travel date.");
    if (form.from.trim().toLowerCase() === form.to.trim().toLowerCase())
      return setErrors("Pick a destination different from where you're leaving.");
    if (seats.length !== passengers)
      return setErrors(`Choose ${passengers} seat${passengers > 1 ? "s" : ""} (${seats.length} selected).`);
    setErrors("");

    const msg = [
      "*DirashTravel booking request*",
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Route: ${form.from.trim()} to ${form.to.trim()}`,
      `Date: ${form.date}`,
      `Departure: ${form.time}`,
      `Vehicle: ${vehicle.name} (${vehicle.kind})`,
      `Passengers: ${passengers}`,
      `Seat${seats.length > 1 ? "s" : ""}: ${seats.join(", ")}`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  return (
    <div className="min-h-screen">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 pb-16 pt-6 sm:pb-20">
          <div className="text-white"><Logo /></div>
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Pick your seat. We'll hold it for you on WhatsApp.
            </h1>
            <p className="mt-3 text-lg text-white/70">Choose your trip, your vehicle and your exact seat in under a minute.</p>
          </div>
        </div>
      </header>

      <form onSubmit={book} className="mx-auto -mt-10 grid max-w-6xl gap-6 px-5 pb-16 lg:grid-cols-[1fr_1.05fr]">
        {/* LEFT: trip + vehicle + passenger */}
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-lg shadow-ink/5">
            <h2 className="font-display text-xl font-bold">Trip details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Leaving from">
                <input list="towns" className={inputCls} value={form.from} onChange={set("from")} placeholder="Nairobi" />
              </Field>
              <Field label="Going to">
                <input list="towns" className={inputCls} value={form.to} onChange={set("to")} placeholder="Mombasa" />
              </Field>
              <Field label="Travel date">
                <input type="date" min={today} className={inputCls} value={form.date} onChange={set("date")} />
              </Field>
              <Field label="Departure time">
                <select className={inputCls} value={form.time} onChange={set("time")}>
                  {TIMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Your name">
                <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Full name" autoComplete="name" />
              </Field>
              <Field label="Phone number">
                <input type="tel" className={inputCls} value={form.phone} onChange={set("phone")} placeholder="07xx xxx xxx" autoComplete="tel" />
              </Field>
            </div>
            <datalist id="towns">{TOWNS.map((t) => <option key={t} value={t} />)}</datalist>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-lg shadow-ink/5">
            <h2 className="font-display text-xl font-bold">Vehicle</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {VEHICLES.map((v) => {
                const active = v.id === vehicleId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => chooseVehicle(v.id)}
                    aria-pressed={active}
                    className={`rounded-2xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sun/50 ${
                      active ? "border-ink bg-ink text-white" : "border-ink/10 hover:border-ink/40"
                    }`}
                  >
                    <div className="font-display text-lg font-bold">{v.name}</div>
                    <div className={`text-sm ${active ? "text-white/70" : "text-ink/60"}`}>{v.kind}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-mist p-4">
              <div>
                <div className="font-medium">Passengers</div>
                <div className="text-sm text-ink/60">You'll pick one seat per passenger</div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => changePassengers(passengers - 1)} disabled={passengers <= 1}
                  aria-label="Fewer passengers"
                  className="h-10 w-10 rounded-full bg-white text-xl font-bold shadow disabled:opacity-30">−</button>
                <span className="w-6 text-center font-display text-2xl font-bold">{passengers}</span>
                <button type="button" onClick={() => changePassengers(passengers + 1)} disabled={passengers >= capacity}
                  aria-label="More passengers"
                  className="h-10 w-10 rounded-full bg-ink text-xl font-bold text-white shadow disabled:opacity-30">+</button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: seat map + summary */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-3xl bg-white p-6 shadow-lg shadow-ink/5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold">Choose your seat{passengers > 1 ? "s" : ""}</h2>
              <span className="text-sm font-medium text-ink/60">{seats.length} of {passengers} chosen</span>
            </div>

            <div className="mx-auto mt-5 max-w-sm rounded-t-[3rem] rounded-b-2xl border-4 border-ink/15 bg-mist px-5 pb-6 pt-8">
              <div className="mb-5 h-2 rounded-full bg-ink/10" aria-hidden />
              <div className="grid gap-x-2 gap-y-4" style={{ gridTemplateColumns: `repeat(${vehicle.cols}, minmax(0, 1fr))` }}>
                {grid.flat().map((c, i) =>
                  c.type === "seat" ? (
                    <Seat key={i} no={c.no} selected={seats.includes(c.no)} onClick={() => toggleSeat(c.no)} />
                  ) : c.type === "driver" ? (
                    <div key={i} className="mx-auto grid h-11 w-11 place-items-center rounded-full border-2 border-dashed border-ink/30 text-ink/40 sm:h-12 sm:w-12" title="Driver" aria-label="Driver">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M3 12h7M14 12h7M12 14v7" /></svg>
                    </div>
                  ) : <div key={i} />
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-center gap-5 text-sm text-ink/70">
              <span className="flex items-center gap-2"><i className="h-4 w-4 rounded border-2 border-ink/25 bg-white" />Available</span>
              <span className="flex items-center gap-2"><i className="h-4 w-4 rounded border-2 border-sun-deep bg-sun" />Yours</span>
            </div>
            {hint && <p role="status" className="mt-4 rounded-xl bg-sun/20 p-3 text-sm">{hint}</p>}
          </section>

          <section className="rounded-3xl bg-ink p-6 text-white shadow-lg shadow-ink/10">
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-white/60">Route</dt>
              <dd className="text-right font-medium">{form.from || "—"} to {form.to || "—"}</dd>
              <dt className="text-white/60">When</dt>
              <dd className="text-right font-medium">{form.date || "—"} at {form.time}</dd>
              <dt className="text-white/60">Vehicle</dt>
              <dd className="text-right font-medium">{vehicle.name}</dd>
              <dt className="text-white/60">Seats</dt>
              <dd className="text-right font-medium">{seats.length ? seats.join(", ") : "None yet"}</dd>
            </dl>
            {errors && <p role="alert" className="mt-4 rounded-xl bg-white/10 p-3 text-sm text-sun">{errors}</p>}
            <button type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sun px-5 py-3.5 font-display text-lg font-bold text-ink transition hover:bg-sun-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50">
              Book on WhatsApp
            </button>
            <p className="mt-3 text-center text-xs text-white/50">Your booking opens as a ready-to-send WhatsApp message.</p>
          </section>
        </div>
      </form>
    </div>
  );
}
