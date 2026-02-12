import { notFound } from "next/navigation";
import { getInvoiceById } from "@/features/invoices/queries/get-invoice";
import { InvoicePreview } from "@/features/invoices/components/invoice-preview";

type AdminInvoiceDetailPageProps = {
  params: Promise<{ invoiceId: string }>;
};

const AdminInvoiceDetailPage = async ({ params }: AdminInvoiceDetailPageProps) => {
  const { invoiceId } = await params;
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Invoice
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          {invoice.invoiceNumber}
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Review invoice details.
        </p>
      </div>
      <InvoicePreview
        invoiceNumber={invoice.invoiceNumber}
        status={invoice.status}
        issueDate={invoice.issueDate.toDateString()}
        dueDate={invoice.dueDate.toDateString()}
        clientName={`${invoice.client.firstName} ${invoice.client.lastName}`}
        clientEmail={invoice.client.email}
        clientPhone={invoice.client.telephone}
        clientAddress={invoice.client.address}
        subtotal={`${invoice.currency} ${invoice.subtotal.toFixed(2)}`}
        tax={`${invoice.currency} ${invoice.tax.toFixed(2)}`}
        discount={`${invoice.currency} ${invoice.discount.toFixed(2)}`}
        total={`${invoice.currency} ${invoice.total.toFixed(2)}`}
        notes={invoice.notes}
        terms={invoice.terms}
        items={invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: `${invoice.currency} ${item.unitPrice.toFixed(2)}`,
          amount: `${invoice.currency} ${item.amount.toFixed(2)}`,
        }))}
      />
    </div>
  );
};

export default AdminInvoiceDetailPage;
