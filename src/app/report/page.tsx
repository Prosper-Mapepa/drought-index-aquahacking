import { Suspense } from "react";
import ReportContent from "./ReportContent";

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Loading...</div>}>
      <ReportContent />
    </Suspense>
  );
}
