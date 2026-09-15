export type EnvironmentIconName = "meeting" | "community" | "review" | "video";

type EnvironmentIconProps = { name: EnvironmentIconName };

export default function EnvironmentIcon({ name }: EnvironmentIconProps) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "meeting") {
    return <svg {...common}><rect x="2.5" y="6" width="13" height="12" rx="2" /><path d="m15.5 10 5-3v10l-5-3Z" /><circle cx="9" cy="11" r="1.7" /><path d="M5.5 16c.7-1.4 2-2.2 3.5-2.2s2.8.8 3.5 2.2" /></svg>;
  }

  if (name === "community") {
    return <svg {...common}><circle cx="8" cy="8.5" r="2.6" /><circle cx="16" cy="8.5" r="2.6" /><path d="M3.5 18c0-2.4 2-3.6 4.5-3.6s4.5 1.2 4.5 3.6M12 18c.3-2.2 2-3.4 4-3.4s4 1.2 4 3.4" /></svg>;
  }

  if (name === "review") {
    return <svg {...common}><path d="M21 12c0 3.9-4 7-9 7-1.4 0-2.7-.2-3.9-.7L3 20l1.4-4.2A6 6 0 0 1 3 12c0-3.9 4-7 9-7s9 3.1 9 7Z" /><path d="m8.5 12.2 2.5 2.4 4.5-5" /></svg>;
  }

  return <svg {...common}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m10.5 9.5 5 2.5-5 2.5Z" /><path d="M3 9h18" opacity=".5" /></svg>;
}
