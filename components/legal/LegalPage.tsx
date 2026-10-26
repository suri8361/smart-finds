import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LEGAL_LAST_UPDATED } from "@/lib/config/site";

export interface LegalPageProps {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  breadcrumbLabel?: string;
  showUpdated?: boolean;
  children: ReactNode;
}

/** Shared layout for the plain-text trust/legal pages — same type scale as the About page. */
export function LegalPage({ eyebrow = "Legal", title, intro, breadcrumbLabel, showUpdated = true, children }: LegalPageProps) {
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: breadcrumbLabel ?? title }]} />
      <p className="mt-8 text-eyebrow font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
      <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-foreground">{title}</h1>
      {showUpdated ? <p className="mt-2 text-sm text-foreground/50">Last updated {LEGAL_LAST_UPDATED}</p> : null}
      {intro ? <div className="mt-6 text-base text-foreground/80">{intro}</div> : null}
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </Container>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-h3 font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-3 text-base leading-relaxed text-foreground/75 [&_a]:text-brand-700 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </section>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-base leading-relaxed text-foreground/85">
      {children}
    </div>
  );
}
