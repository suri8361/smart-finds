"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Container } from "@/components/ui/Container";

type Status = "idle" | "sending" | "success" | "error";

/**
 * Home page "join the chat" box. Submissions go to Netlify Forms (form "join-chat"):
 * with the Next.js runtime v5 the form is declared in public/__forms.html and this
 * component POSTs url-encoded data to that static file. Emails are not stored anywhere else.
 */
export function JoinChat() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      if (!response.ok) throw new Error(`Form submit failed: ${response.status}`);
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="join-chat" className="py-12 sm:py-16">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-linear-to-br from-brand-50 via-surface-muted to-surface px-6 py-8 shadow-card sm:px-12 sm:py-10 dark:from-surface-muted dark:via-surface dark:to-surface">
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-brand-200/30 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-brand-600 shadow-card">
                <Bell className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-h3 font-semibold tracking-tight text-foreground">
                  Get deals the moment I post them!
                </h2>
                <p className="mt-1.5 max-w-md text-sm text-foreground/70 sm:text-base">
                  Enter your email to join my Smart Finds chat.
                </p>
              </div>
            </div>

            <div className="w-full lg:max-w-md">
              {status === "success" ? (
                <p role="status" className="rounded-xl bg-surface px-5 py-4 text-center text-base font-medium text-brand-700 shadow-card">
                  Thanks! I&apos;ll add you soon 💛
                </p>
              ) : (
                <form name="join-chat" onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <input type="hidden" name="form-name" value="join-chat" />
                  <p className="hidden" aria-hidden="true">
                    <label>
                      Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
                    </label>
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label htmlFor="join-chat-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="join-chat-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@gmail.com"
                      className="h-12 w-full min-w-0 rounded-md sm:flex-1 border border-border bg-surface px-4 text-base text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-brand-600 px-8 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
                    >
                      {status === "sending" ? "Joining…" : "Join"}
                    </button>
                  </div>
                  <p className="text-xs text-foreground/60">You&apos;ll need a Google (Gmail) account to join.</p>
                  {status === "error" ? (
                    <p role="alert" className="text-sm font-medium text-danger">
                      Sorry, that didn&apos;t go through. Please try again in a moment.
                    </p>
                  ) : null}
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
