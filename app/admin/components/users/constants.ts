export interface PermissionModule {
  id: string;
  label: string;
  actions: string[];
  allowedRoles: string[];
}

export const ACTIONS = [
  { id: "view", label: "View" },
  { id: "create", label: "Create" },
  { id: "edit", label: "Edit" },
  { id: "delete", label: "Delete" },
];

export const MODULES: PermissionModule[] = [
  {
    id: "products",
    label: "Inventory and Product Management",
    actions: ["view", "create", "edit", "delete"],
    allowedRoles: ["manager", "staff"],
  },
  {
    id: "orders",
    label: "Order and Sales Management",
    actions: ["view", "create", "edit", "delete"],
    allowedRoles: ["manager", "staff"],
  },
  {
    id: "customers",
    label: "Customer Management",
    actions: ["view", "create", "edit", "delete"],
    allowedRoles: ["manager", "staff"],
  },
  {
    id: "marketing",
    label: "Marketing and Customer Care",
    actions: ["view", "create", "edit", "delete"],
    allowedRoles: ["manager", "staff"],
  },
  {
    id: "reports",
    label: "Sales Reports Management",
    actions: ["view"],
    allowedRoles: ["manager", "staff"],
  },
  {
    id: "users",
    label: "Staff Accounts Management",
    actions: ["view", "create", "edit", "delete"],
    allowedRoles: ["manager"],
  },
  {
    id: "finance",
    label: "Financial Reports Management",
    actions: ["view"],
    allowedRoles: [],
  },
  {
    id: "settings",
    label: "System Settings Management",
    actions: ["view", "edit"],
    allowedRoles: [],
  },
];

export const PERMISSION_TEMPLATES: Record<string, string[]> = {
  sales: [
    "orders.view",
    "orders.create",
    "orders.edit",
    "customers.view",
    "customers.create",
    "products.view",
  ],
  inventory: ["products.view", "products.create", "products.edit"],
  marketing: [
    "marketing.view",
    "marketing.create",
    "marketing.edit",
    "customers.view",
    "products.view",
  ],
  store_manager: [
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "orders.view",
    "orders.create",
    "orders.edit",
    "orders.delete",
    "customers.view",
    "customers.create",
    "customers.edit",
    "customers.delete",
    "marketing.view",
    "marketing.create",
    "marketing.edit",
    "marketing.delete",
    "reports.view",
  ],
};

export const DEFAULT_MANAGER_PERMISSIONS = PERMISSION_TEMPLATES.store_manager;
export const DEFAULT_STAFF_PERMISSIONS = PERMISSION_TEMPLATES.sales;

export function backendToUiPermissions(backendPerms: string[]): string[] {
  const uiPerms: string[] = [];
  backendPerms.forEach((perm) => {
    if (perm === "products.view") uiPerms.push("products.view");
    else if (perm === "products.manage") {
      uiPerms.push("products.create", "products.edit", "products.delete");
    } else if (perm === "orders.view") uiPerms.push("orders.view");
    else if (perm === "orders.manage") {
      uiPerms.push("orders.edit", "orders.delete");
    } else if (perm === "pos.access") uiPerms.push("orders.create");
    else if (perm === "customers.view") uiPerms.push("customers.view");
    else if (perm === "customers.manage") {
      uiPerms.push("customers.create", "customers.edit", "customers.delete");
    } else if (perm === "vouchers.view") uiPerms.push("marketing.view");
    else if (perm === "vouchers.manage") {
      uiPerms.push("marketing.create", "marketing.delete");
    } else if (perm === "reviews.manage") uiPerms.push("marketing.edit");
    else if (perm === "reports.view") uiPerms.push("reports.view");
  });
  return Array.from(new Set(uiPerms));
}

export function uiToBackendPermissions(uiPerms: string[]): string[] {
  const backendPerms: string[] = [];
  uiPerms.forEach((perm) => {
    if (perm === "products.view") backendPerms.push("products.view");
    else if (
      perm === "products.create" ||
      perm === "products.edit" ||
      perm === "products.delete"
    ) {
      backendPerms.push("products.manage");
    } else if (perm === "orders.view") backendPerms.push("orders.view");
    else if (perm === "orders.create") backendPerms.push("pos.access");
    else if (perm === "orders.edit" || perm === "orders.delete") {
      backendPerms.push("orders.manage");
    } else if (perm === "customers.view") backendPerms.push("customers.view");
    else if (
      perm === "customers.create" ||
      perm === "customers.edit" ||
      perm === "customers.delete"
    ) {
      backendPerms.push("customers.manage");
    } else if (perm === "marketing.view") backendPerms.push("vouchers.view");
    else if (perm === "marketing.create" || perm === "marketing.delete") {
      backendPerms.push("vouchers.manage");
    } else if (perm === "marketing.edit") backendPerms.push("reviews.manage");
    else if (perm === "reports.view") backendPerms.push("reports.view");
  });
  return Array.from(new Set(backendPerms));
}
