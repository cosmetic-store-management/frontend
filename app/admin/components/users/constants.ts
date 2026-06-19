export interface PermissionModule {
  id: string;
  label: string;
  actions: string[];
  allowedRoles: string[];
}

export const ACTIONS = [
  { id: "view", label: "Xem" },
  { id: "create", label: "Thêm" },
  { id: "edit", label: "Sửa" },
  { id: "delete", label: "Xóa" },
];

export const MODULES: PermissionModule[] = [
  { id: "products", label: "Quản lý Kho hàng & Sản phẩm", actions: ["view", "create", "edit", "delete"], allowedRoles: ["manager", "staff"] },
  { id: "orders", label: "Quản lý Đơn hàng & Bán hàng", actions: ["view", "create", "edit", "delete"], allowedRoles: ["manager", "staff"] },
  { id: "customers", label: "Quản lý Khách hàng", actions: ["view", "create", "edit", "delete"], allowedRoles: ["manager", "staff"] },
  { id: "marketing", label: "Quản lý Marketing & CSKH", actions: ["view", "create", "edit", "delete"], allowedRoles: ["manager", "staff"] },
  { id: "reports", label: "Quản lý Báo cáo Doanh thu", actions: ["view"], allowedRoles: ["manager", "staff"] },
  
  // Đặc quyền Hệ thống (Chỉ cấp Quản lý mới được phép cấp quyền Nhân sự)
  { id: "users", label: "Quản lý Tài khoản Nhân sự", actions: ["view", "create", "edit", "delete"], allowedRoles: ["manager"] },
  
  // Tài chính và Cài đặt là đặc quyền tuyệt đối của Owner, không ai được cấp
  { id: "finance", label: "Quản lý Báo cáo Tài chính", actions: ["view"], allowedRoles: [] },
  { id: "settings", label: "Quản lý Cấu hình Hệ thống", actions: ["view", "edit"], allowedRoles: [] },
];

export const PERMISSION_TEMPLATES: Record<string, string[]> = {
  "sales": [
    "orders.view", "orders.create", "orders.edit", 
    "customers.view", "customers.create", 
    "products.view"
  ],
  "inventory": [
    "products.view", "products.create", "products.edit"
  ],
  "marketing": [
    "marketing.view", "marketing.create", "marketing.edit", 
    "customers.view", "products.view"
  ],
  "store_manager": [
    "products.view", "products.create", "products.edit", "products.delete",
    "orders.view", "orders.create", "orders.edit", "orders.delete",
    "customers.view", "customers.create", "customers.edit", "customers.delete",
    "marketing.view", "marketing.create", "marketing.edit", "marketing.delete",
    "reports.view"
  ]
};

export const DEFAULT_MANAGER_PERMISSIONS = PERMISSION_TEMPLATES.store_manager;
export const DEFAULT_STAFF_PERMISSIONS = PERMISSION_TEMPLATES.sales;
