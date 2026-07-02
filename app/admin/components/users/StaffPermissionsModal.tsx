

import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { User } from "@/admin/types/user";
import {
  MODULES,
  ACTIONS,
  DEFAULT_MANAGER_PERMISSIONS,
  DEFAULT_STAFF_PERMISSIONS,
  PERMISSION_TEMPLATES,
} from "./constants";

interface StaffPermissionsModalProps {
  user: User | null;
  editRole: "manager" | "staff";
  editPermissions: string[];
  isOwner: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (role: "manager" | "staff") => void;
  onPermissionsChange: (perms: string[]) => void;
  onSave: () => void;
}

export function StaffPermissionsModal({
  user,
  editRole,
  editPermissions,
  isOwner,
  isLoading,
  onOpenChange,
  onRoleChange,
  onPermissionsChange,
  onSave,
}: StaffPermissionsModalProps) {
  if (!user) return null;

  return (
    <BaseCrudModal
      open={!!user}
      onOpenChange={onOpenChange}
      title="Staff permissions"
      description={`Set access permissions for the account ${user.name}.`}
      size="lg"
      primaryActionText="Confirm"
      secondaryActionText="Cancel"
      onPrimaryAction={onSave}
      isLoading={isLoading}
    >
      <div className="space-y-4 my-2">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-ink block">{"Role"}</Label>
          <div className="flex flex-col space-y-2">
            <label
              className={`flex items-start space-x-3 p-3 rounded-sm border cursor-pointer transition-colors ${editRole === "staff" ? "bg-surface-soft border-brand" : "bg-surface border-border hover:bg-surface-hover"} ${!isOwner ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  value="staff"
                  className="w-4 h-4 text-brand focus:ring-brand border-input"
                  checked={editRole === "staff"}
                  onChange={() => {
                    if (!isOwner) return;
                    onRoleChange("staff");
                    onPermissionsChange(DEFAULT_STAFF_PERMISSIONS);
                  }}
                  disabled={!isOwner}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-ink">{"Staff"}</span>
                <span className="text-xs text-ink-muted">{`Execution role. Can only perform granted actions.
                  Cannot manage staff.`}</span>
              </div>
            </label>

            {isOwner && (
              <label
                className={`flex items-start space-x-3 p-3 rounded-sm border cursor-pointer transition-colors ${editRole === "manager" ? "bg-surface-soft border-brand" : "bg-surface border-border hover:bg-surface-hover"}`}
              >
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    value="manager"
                    className="w-4 h-4 text-brand focus:ring-brand border-input"
                    checked={editRole === "manager"}
                    onChange={() => {
                      onRoleChange("manager");
                      onPermissionsChange(DEFAULT_MANAGER_PERMISSIONS);
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-ink">{"Manager"}</span>
                  <span className="text-xs text-ink-muted">{"Operations role. Can create and assign permissions to staff."}</span>
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border mt-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-semibold text-ink">{"Permission template"}</Label>
            <Select
              onValueChange={(value) => {
                if (value !== "custom") {
                  onPermissionsChange(PERMISSION_TEMPLATES[value] || []);
                }
              }}
              value={
                editRole === "manager"
                  ? JSON.stringify(editPermissions) ===
                    JSON.stringify(DEFAULT_MANAGER_PERMISSIONS)
                    ? "store_manager"
                    : "custom"
                  : JSON.stringify(editPermissions) ===
                      JSON.stringify(DEFAULT_STAFF_PERMISSIONS)
                    ? "sales"
                    : JSON.stringify(editPermissions) ===
                        JSON.stringify(PERMISSION_TEMPLATES.inventory)
                      ? "inventory"
                      : JSON.stringify(editPermissions) ===
                          JSON.stringify(PERMISSION_TEMPLATES.marketing)
                        ? "marketing"
                        : "custom"
              }
            >
              <SelectTrigger className="w-50 h-8 text-xs bg-surface border-input focus:ring-brand">
                <SelectValue placeholder="-- Custom permissions --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{"-- Custom permissions --"}</SelectItem>
                {editRole === "manager" ? (
                  <SelectItem value="store_manager">{"Store Manager"}</SelectItem>
                ) : (
                  <>
                    <SelectItem value="sales">{"Sales Staff"}</SelectItem>
                    <SelectItem value="inventory">{"Inventory Staff"}</SelectItem>
                    <SelectItem value="marketing">{"Marketing Staff"}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto border border-border rounded-sm mt-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-soft border-b border-border">
                <tr>
                  <th className="px-3 py-2 font-semibold text-ink text-xs w-48">{"Feature"}</th>
                  {ACTIONS.map((action) => (
                    <th
                      key={action.id}
                      className="px-3 py-2 font-semibold text-ink text-xs text-center w-16"
                    >
                      {action.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.filter((m) => m.allowedRoles.includes(editRole)).map(
                  (module) => (
                    <tr
                      key={module.id}
                      className="border-b border-border last:border-0 hover:bg-surface-hover/50"
                    >
                      <td className="px-3 py-2 font-medium text-ink text-xs border-r border-border bg-surface-soft/30">
                        {module.label}
                      </td>
                      {ACTIONS.map((action) => {
                        const permId = `${module.id}.${action.id}`;
                        const isAvailable = module.actions.includes(action.id);
                        return (
                          <td
                            key={action.id}
                            className="px-3 py-2 text-center align-middle"
                          >
                            {isAvailable ? (
                              <Checkbox
                                id={`edit-perm-${permId}`}
                                checked={editPermissions.includes(permId)}
                                onCheckedChange={(checked) => {
                                  onPermissionsChange(
                                    checked
                                      ? [...editPermissions, permId]
                                      : editPermissions.filter(
                                          (v) => v !== permId,
                                        ),
                                  );
                                }}
                                className="data-[state=checked]:bg-brand data-[state=checked]:border-brand mx-auto block"
                              />
                            ) : (
                              <span className="text-ink-muted/30 block text-center">
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BaseCrudModal>
  );
}
