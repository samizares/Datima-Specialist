import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";
import { InvoicesTable } from "@/features/invoices/components/invoices-table";
import { getInvoices } from "@/features/invoices/queries/get-invoices";

const AdminInvoicesPage = async () => {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return null;
  }

  const [invoices, clients] = await Promise.all([
    getInvoices(),
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);

  const rows = invoices.map((invoice) => ({
    id: invoice.id,
    clientId: invoice.clientId,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    total: invoice.total.toFixed(2),
    currency: invoice.currency,
    clientName: `${invoice.client.firstName} ${invoice.client.lastName}`,
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: item.unitPrice.toFixed(2),
    })),
    tax: invoice.tax.toFixed(2),
    discount: invoice.discount.toFixed(2),
    notes: invoice.notes ?? "",
    terms: invoice.terms ?? "",
  }));

  const clientOptions = clients.map((client) => ({
    id: client.id,
    name: `${client.firstName} ${client.lastName}`,
    email: client.email,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Billing
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          Invoices
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create, send, and manage patient billing invoices.
        </p>
      </div>
      <InvoicesTable invoices={rows} clients={clientOptions} canPreview={isSuperAdmin(user)} />
    </div>
  );
};

export default AdminInvoicesPage;
