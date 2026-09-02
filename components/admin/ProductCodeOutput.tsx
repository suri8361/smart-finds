"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ProductCodeOutput({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be denied by the browser — the code is still selectable/copyable by hand.
    }
  }

  return (
    <div className="relative">
      <Button type="button" size="sm" variant="secondary" onClick={handleCopy} className="absolute right-3 top-3">
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre className="overflow-x-auto rounded-xl border border-border bg-foreground p-4 pr-24 text-xs text-background">
        <code>{code}</code>
      </pre>
    </div>
  );
}
