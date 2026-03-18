"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Issue detail has moved to /projects/[id]/issues/[issueId]
// This page exists only for backwards compatibility and should not be linked to directly.
export default function LegacyIssuePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/issues");
  }, [router]);

  return null;
}
