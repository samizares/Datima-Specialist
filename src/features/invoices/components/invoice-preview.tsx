import Image from "next/image";

type InvoicePreviewItem = {
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
};

type InvoicePreviewProps = {
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone: string;
  clientAddress: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  notes?: string | null;
  terms?: string | null;
  items: InvoicePreviewItem[];
};

export const InvoicePreview = ({
  invoiceNumber,
  status,
  issueDate,
  dueDate,
  clientName,
  clientEmail,
  clientPhone,
  clientAddress,
  subtotal,
  tax,
  discount,
  total,
  notes,
  terms,
  items,
}: InvoicePreviewProps) => {
  return (
    <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-28">
            <Image
              src="/assets/Datima-enhance-logo.png"
              alt="Datima Specialist Clinics"
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Datima</p>
            <p className="text-lg font-semibold text-slate-900">Specialist Clinics</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-500">Invoice #{invoiceNumber}</p>
          <p className="text-xs text-slate-400">Status: {status}</p>
          <p className="text-xs text-slate-400">Issue: {issueDate}</p>
          <p className="text-xs text-slate-400">Due: {dueDate}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Billed To</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{clientName}</p>
          {clientEmail ? <p className="text-xs text-slate-500">{clientEmail}</p> : null}
          <p className="text-xs text-slate-500">{clientPhone}</p>
          <p className="text-xs text-slate-500">{clientAddress}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold uppercase text-slate-400">Datima Contact</p>
          <p className="mt-2 text-xs text-slate-500">
            1, Fola Agoro Street Off Bajulaye Road, Somulu, Lagos
          </p>
          <p className="text-xs text-slate-500">care@datimaspecialistclinics.com</p>
          <p className="text-xs text-slate-500">+234 9157360689, +234 9093933524</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={`${item.description}-${idx}`} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-700">{item.description}</td>
                <td className="px-4 py-3 text-slate-500">{item.quantity}</td>
                <td className="px-4 py-3 text-slate-500">{item.unitPrice}</td>
                <td className="px-4 py-3 text-right text-slate-700">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col items-end gap-2 text-sm">
        <div className="flex w-full max-w-xs items-center justify-between text-slate-500">
          <span>Subtotal</span>
          <span>{subtotal}</span>
        </div>
        <div className="flex w-full max-w-xs items-center justify-between text-slate-500">
          <span>Tax</span>
          <span>{tax}</span>
        </div>
        <div className="flex w-full max-w-xs items-center justify-between text-slate-500">
          <span>Discount</span>
          <span>{discount}</span>
        </div>
        <div className="flex w-full max-w-xs items-center justify-between text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{total}</span>
        </div>
      </div>

      {(notes || terms) && (
        <div className="mt-6 space-y-2 text-sm text-slate-500">
          {notes ? <p>Notes: {notes}</p> : null}
          {terms ? <p>Terms: {terms}</p> : null}
        </div>
      )}
    </div>
  );
};
