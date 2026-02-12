import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { InvoicePreview } from "@/features/invoices/components/invoice-preview";

const AdminInvoicePreviewPage = async () => {
  const { user } = await getAuthOrRedirect();
  if (!isSuperAdmin(user)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Preview
        </p>
        <Button asChild className="rounded-full bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/admin/invoices/">Back To Invoice</Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Invoice Preview
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Preview the current invoice layout with dummy data.
        </p>
      </div>
      <InvoicePreview
        invoiceNumber="INV-2026-001"
        status="DRAFT"
        issueDate="Feb 07, 2026"
        dueDate="Feb 20, 2026"
        clientName="Samuel Oghogho"
        clientEmail="sam@example.com"
        clientPhone="+234 9157360689"
        clientAddress="1, Fola Agoro Street Off Bajulaye Road, Somulu, Lagos"
        subtotal="NGN 250,000.00"
        tax="NGN 0.00"
        discount="NGN 0.00"
        total="NGN 250,000.00"
        notes="Please settle within 7 business days."
        terms="Payment confirms acceptance of services rendered."
        items={[
          {
            description: "Specialist Consultation",
            quantity: 1,
            unitPrice: "NGN 150,000.00",
            amount: "NGN 150,000.00",
          },
          {
            description: "Laboratory Diagnostics",
            quantity: 1,
            unitPrice: "NGN 100,000.00",
            amount: "NGN 100,000.00",
          },
        ]}
      />
    </div>
  );
};

export default AdminInvoicePreviewPage;
