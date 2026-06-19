import { VoucherPage } from "@/admin/pages/VoucherPage";

export function meta() {
  return [
    { title: "Quản lý Mã giảm giá - GlowUp Admin" },
    { name: "description", content: "Quản lý mã giảm giá hệ thống" },
  ];
}

export default function VoucherRoute() {
  return <VoucherPage />;
}
