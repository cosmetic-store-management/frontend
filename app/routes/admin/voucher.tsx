import { VoucherPage } from "@/admin/pages/VoucherPage";

export function meta() {
  return [
    { title: "Voucher Management - GlowUp Admin" },
    { name: "description", content: "Manage system vouchers" },
  ];
}

export default function VoucherRoute() {
  return <VoucherPage />;
}
