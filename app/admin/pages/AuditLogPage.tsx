import { useState, useRef } from "react";
import { Search, Loader2, ShieldAlert, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs } from "../hooks/useAuditLog";
import { useAuth } from "@/auth/hooks/useAdminAuth";
import { PageHeader } from "../components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AuditLogPage() {
  const { isOwner } = useAuth();
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] || undefined;

  const { data, isLoading } = useAuditLogs({
    search,
    domain: domainFilter,
    startDate,
    endDate,
    cursor: currentCursor,
    limit: 20,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  const handleNext = () => {
    if (pagination?.nextCursor) setCursors((prev) => [...prev, pagination.nextCursor!]);
  };
  const handlePrev = () => setCursors((prev) => prev.slice(0, -1));

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center p-8 bg-surface border border-border rounded-sm shadow-ui-soft animate-page-enter">
        <div className="p-3 bg-brand-light text-brand rounded-full mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-ink">
          Access Restricted
        </h3>
        <p className="text-sm text-ink-muted mt-2 max-w-md">
          System Audit Logs are only available for Store Owner accounts. Staff members do not have permission to view this information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-page-enter">
      <PageHeader
        title="System Logs"
        description="Monitor and trace system configuration activities, management, and data security"
        filters={
          <div className="flex flex-col gap-3 w-full">
            <div className="group relative max-w-sm flex-1 min-w-50">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
              <Input
                placeholder="Search account, content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
                  title="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-fit h-9 rounded-sm border-border bg-surface text-sm text-ink-muted px-3">
                  <SelectValue placeholder="All domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  <SelectItem value="catalog">Catalog</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <div
                  className="relative group cursor-pointer flex-1"
                  onClick={() => {
                    try {
                      if (startDateRef.current && 'showPicker' in HTMLInputElement.prototype) {
                        startDateRef.current.showPicker();
                      }
                    } catch (err) { }
                  }}
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-hover:text-brand pointer-events-none" />
                  <Input
                    ref={startDateRef}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-37.5 pl-9 h-9 rounded-sm bg-surface border-border text-ink-muted focus:ring-brand focus:border-brand cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                    title="From date"
                  />
                </div>
                <span className="text-ink-muted">-</span>
                <div
                  className="relative group cursor-pointer flex-1"
                  onClick={() => {
                    try {
                      if (endDateRef.current && 'showPicker' in HTMLInputElement.prototype) {
                        endDateRef.current.showPicker();
                      }
                    } catch (err) { }
                  }}
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-hover:text-brand pointer-events-none" />
                  <Input
                    ref={endDateRef}
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-37.5 pl-9 h-9 rounded-sm bg-surface border-border text-ink-muted focus:ring-brand focus:border-brand cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                    title="To date"
                  />
                </div>
              </div>
            </div>
          </div>
        }
      />

      {/* Logs Table */}
      <div className="premium-card rounded-sm overflow-hidden">
        <Table className="min-w-200 table-fixed">
          <TableHeader>
            <TableRow className="bg-surface-muted border-b border-border">
              <TableHead className="w-[20%] text-left text-ink-muted font-medium pl-4">
                Account
              </TableHead>
              <TableHead className="text-center w-[12%] text-ink-muted font-medium">
                Action
              </TableHead>
              <TableHead className="text-center w-[13%] text-ink-muted font-medium">
                Domain
              </TableHead>
              <TableHead className="text-center w-[40%] text-ink-muted font-medium">
                Details
              </TableHead>
              <TableHead className="text-center w-[15%] text-ink-muted font-medium">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-ink-muted">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    <span>Loading system logs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-ink-muted">
                  No activity logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                >
                  <TableCell className="font-medium text-ink-muted pl-4">
                    {log.userName}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${["create", "add", "import"].includes(
                        log.action.toLowerCase(),
                      )
                        ? "bg-emerald-100 text-emerald-700"
                        : ["update", "edit", "modify"].includes(
                          log.action.toLowerCase(),
                        )
                          ? "bg-amber-100 text-amber-700"
                          : ["delete", "remove", "destroy"].includes(
                            log.action.toLowerCase(),
                          )
                            ? "bg-red-100 text-red-700"
                            : ["login", "logout"].includes(
                              log.action.toLowerCase(),
                            )
                              ? "bg-blue-100 text-blue-700"
                              : ["export", "download"].includes(
                                log.action.toLowerCase(),
                              )
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-ink-muted font-medium capitalize text-center">
                    {log.domain}
                  </TableCell>
                  <TableCell className="font-medium text-ink-muted break-words max-w-xs text-center">
                    {log.description}
                  </TableCell>
                  <TableCell className="text-ink-muted text-xs font-medium text-center">
                    {log.timestamp}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(cursors.length > 0 || pagination?.hasNextPage) && (
        <div className="flex items-center justify-between p-5 bg-surface border border-border rounded-sm">
          <div className="text-sm text-ink-muted font-medium">
            Page {cursors.length + 1}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm h-9 px-4 font-medium"
              onClick={handlePrev}
              disabled={cursors.length === 0}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm h-9 px-4 font-medium"
              onClick={handleNext}
              disabled={!pagination?.hasNextPage}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
