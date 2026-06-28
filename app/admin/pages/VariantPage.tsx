import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import {
  useVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "../hooks/useVariant";
import type { AttributeOption } from "@/services/attribute.service";
import { PageHeader } from "../components/PageHeader";

export function VariantPage() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<AttributeOption | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [valuesInput, setValuesInput] = useState("");

  // Fetch data
  const { data: attributes = [], isLoading } = useVariants();

  // Mutations
  const createMutation = useCreateVariant();
  const updateMutation = useUpdateVariant();
  const deleteMutation = useDeleteVariant();

  const filteredAttributes = attributes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setCode("");
    setValuesInput("");
    setIsFormOpen(true);
  };

  const openEdit = (attr: AttributeOption) => {
    setEditing(attr);
    setName(attr.name);
    setCode(attr.code);
    setValuesInput(attr.values.join(", "));
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const values = valuesInput
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v !== "");

    if (editing) {
      toast.promise(
        updateMutation
          .mutateAsync({
            id: editing.id,
            data: { name, values },
          })
          .then(() => setIsFormOpen(false)),
        {
          loading: "Updating...",
          success: "Variant attribute updated successfully!",
          error: (err: any) => err.message || "Update error",
        },
      );
    } else {
      toast.promise(
        createMutation
          .mutateAsync({
            name,
            code,
            values,
          })
          .then(() => setIsFormOpen(false)),
        {
          loading: "Creating...",
          success: "New variant attribute created successfully!",
          error: (err: any) => err.message || "Creation error",
        },
      );
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this attribute?")) {
      toast.promise(deleteMutation.mutateAsync(id), {
        loading: "Deleting...",
        success: "Variant attribute deleted!",
        error: (err: any) => err.message || "Deletion error",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <PageHeader
        title="Variant Attributes"
        description="Define product variant attributes (Size, Color...)"
        actions={
          <Button
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none"
            size="sm"
            onClick={openCreate}
          >
            <Plus className="size-4 mr-2" /> Add Attribute
          </Button>
        }
        filters={
          <div className="flex flex-col gap-3 w-full">
            <div className="group relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                placeholder="Search attributes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
            </div>
          </div>
        }
      />

      {/* Grid of attributes */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-32 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAttributes.map((attr) => (
            <div
              key={attr.id}
              className="bg-surface border border-border rounded-sm p-5 shadow-ui-soft flex flex-col justify-between hover:shadow-ui-soft transition-shadow text-left"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-base text-ink">
                      {attr.name}
                    </h3>
                    <span className="text-[10px] font-mono bg-surface-muted text-ink-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                      Code: {attr.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(attr)}
                      className="text-ink-muted hover:text-ink-muted"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(attr.id)}
                      className="text-ink-muted hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Tags / Values */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {attr.values.map((v) => (
                    <Badge
                      key={v}
                      variant="outline"
                      className="text-xs text-ink bg-surface-soft/50"
                    >
                      {v}
                    </Badge>
                  ))}
                  {attr.values.length === 0 && (
                    <span className="text-xs text-ink-muted italic">
                      No values yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredAttributes.length === 0 && (
            <p className="col-span-2 py-8 text-center text-sm text-ink-muted">
              No attributes found
            </p>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(o) => !o && setIsFormOpen(false)}
      >
        <DialogContent className="max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-ink">
              {editing
                ? "Edit Attribute"
                : "Add New Variant Attribute"}
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted mt-1">
              Define variant parameters for retail products.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <Label htmlFor="aName" className="text-xs font-semibold text-ink">
                Attribute Name *
              </Label>
              <Input
                id="aName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Volume"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="aCode" className="text-xs font-semibold text-ink">
                Attribute Code *
              </Label>
              <Input
                id="aCode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="E.g., volume (no spaces)"
                required
                disabled={!!editing}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="aValues"
                className="text-xs font-semibold text-ink"
              >
                Configuration Values (comma separated)
              </Label>
              <Input
                id="aValues"
                value={valuesInput}
                onChange={(e) => setValuesInput(e.target.value)}
                placeholder="E.g., 50ml, 100ml, 250ml"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
