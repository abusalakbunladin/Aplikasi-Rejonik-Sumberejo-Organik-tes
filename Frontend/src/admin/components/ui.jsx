import { cx } from "../utils.js";

// Panel form yang bisa dibuka/tutup, dipakai untuk semua form "tambah data".
export function FormPanel({ title, open, onToggle, children }) {
  return (
    <div className="mb-5 rounded-lg border border-quaternary/15 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-primary"
      >
        <span>{title}</span>
        <span className="text-xl leading-none text-secondary">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="border-t border-quaternary/15 p-4">{children}</div>}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-accentThrd">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "rounded-lg border border-quaternary/25 bg-white px-3 py-2 text-sm text-accentThrd outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

export function Input(props) {
  return <input {...props} className={cx(inputClass, props.className)} />;
}

export function Select(props) {
  return <select {...props} className={cx(inputClass, props.className)} />;
}

export function Textarea(props) {
  return <textarea {...props} className={cx(inputClass, props.className)} />;
}

export function Button({ variant = "primary", className, ...props }) {
  const gaya = {
    primary: "bg-primary text-white hover:bg-secondary",
    accent: "bg-accent text-accentThrd hover:bg-accentScnd",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-primary border border-primary/30 hover:bg-primary/5",
  }[variant];

  return (
    <button
      {...props}
      className={cx(
        "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50",
        gaya,
        className,
      )}
    />
  );
}

// Pesan sukses/gagal setelah submit form.
export function Notice({ type = "error", children }) {
  if (!children) return null;
  const gaya =
    type === "success" ? "bg-secondary/10 text-secondary" : "bg-red-50 text-red-600";
  return <p className={cx("mb-3 rounded-lg px-3 py-2 text-sm", gaya)}>{children}</p>;
}
