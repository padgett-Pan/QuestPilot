"use client";

import { ReactNode, useEffect, useState } from "react";

export function SplitText({ children, className = "" }: { children: string; className?: string }) {
  return <span className={`split-text ${className}`}>{children.split(" ").map((word, i) => <span key={`${word}-${i}`} style={{ animationDelay: `${i * 70}ms` }}>{word}{i < children.split(" ").length - 1 ? " " : ""}</span>)}</span>;
}

export function GradientText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`gradient-text ${className}`}>{children}</span>;
}

export function SoftAurora() {
  return <div aria-hidden="true" className="soft-aurora"><span /><span /><span /></div>;
}

export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <article className={`spotlight-card ${className}`}>{children}</article>;
}

export function AnimatedContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`animated-content ${className}`}>{children}</div>;
}

export function AnimatedList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`animated-list ${className}`}>{children}</div>;
}

export function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const animate = (time: number) => {
      const progress = Math.min((time - start) / 900, 1);
      setValue(Math.round(end * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end]);
  return <>{value}{suffix}</>;
}

export function PillNav({ items }: { items: { label: string; href: string; active?: boolean }[] }) {
  return <nav className="pill-nav" aria-label="主导航">{items.map((item) => <a key={`${item.href}-${item.label}`} className={item.active ? "active" : ""} href={item.href}>{item.label}</a>)}</nav>;
}

export function Stepper({ steps, active = 1 }: { steps: string[]; active?: number }) {
  return <div className="stepper">{steps.map((step, index) => <div key={step} className={`step ${index <= active ? "done" : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>)}</div>;
}
