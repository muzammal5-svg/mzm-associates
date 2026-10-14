"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLoader } from "@/components/ui/LoadingSpinner";

function UpdateHearingRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const caseId = params.get("caseId");
    const target = caseId
      ? `/cases/running?updateCaseId=${encodeURIComponent(caseId)}`
      : "/cases/running";
    router.replace(target);
  }, [params, router]);

  return <PageLoader />;
}

export default function NewHearingRedirectPage() {
  return <Suspense fallback={<PageLoader />}><UpdateHearingRedirect /></Suspense>;
}
