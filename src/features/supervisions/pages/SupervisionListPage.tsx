import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getResearcherSupervisionsPath,
  getResearcherSupervisionDetailPath,
  getSupervisionEditPath,
  getResearcherSupervisionNewPath,
} from "@/config/routes";

// ─── Types ─────────────────────────────────────────────────────────────

const SUPERVISION_TYPES = ["PFE", "Master", "PhD", "Internship", "Project"] as const;
const SUPERVISION_STATUSES = ["IN_PROGRESS", "DEFENDED", "ABANDONED", "EXTENSION", "SUSPENDED"] as const;
const VALIDATION_STATUSES = ["PENDING", "VALIDATED", "REJECTED", "REVISED"] as const;
const ACADEMIC_YEARS = ["2021-2022", "2022-2023", "2023-2024", "2024-2025", "2025-2026"] as const;
const THEMES = ["Machine Learning", "Cybersecurity", "Blockchain", "IoT", "NLP", "Cloud", "Quantum", "Healthcare"] as const;

type SupervisionType = (typeof SUPERVISION_TYPES)[number];
type SupervisionStatus = (typeof SUPERVISION_STATUSES)[number];
type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

interface SupervisionRow {
  id: string;
  title: string;
  student: string;
  type: SupervisionType;
  status: SupervisionStatus;
  validationStatus: ValidationStatus;
  academicYear: string;
  theme: string;
  startDate: string;
}

// ─── Mock data (25 total) ───────────────────────────────────────────────

const MOCK_SUPERVISIONS: SupervisionRow[] = [
  { id: "1", title: "Deep Learning for Medical Imaging", student: "Ali Khelifi", type: "Master", status: "IN_PROGRESS", validationStatus: "PENDING", academicYear: "2025-2026", theme: "Machine Learning", startDate: "2024-09-01" },
  { id: "2", title: "Blockchain for Supply Chain", student: "Sara Meziani", type: "PFE", status: "DEFENDED", validationStatus: "VALIDATED", academicYear: "2024-2025", theme: "Blockchain", startDate: "2024-02-01" },
  { id: "3", title: "IoT Security Framework", student: "Youcef Benali", type: "Master", status: "IN_PROGRESS", validationStatus: "REJECTED", academicYear: "2025-2026", theme: "IoT", startDate: "2024-10-01" },
  { id: "4", title: "AI for Healthcare Diagnostics", student: "Amina Taleb", type: "PhD", status: "IN_PROGRESS", validationStatus: "VALIDATED", academicYear: "2024-2025", theme: "Healthcare", startDate: "2023-09-01" },
  { id: "5", title: "NLP for Arabic Text", student: "Mohamed Khelifi", type: "Master", status: "IN_PROGRESS", validationStatus: "PENDING", academicYear: "2025-2026", theme: "NLP", startDate: "2024-09-15" },
  { id: "6", title: "Cloud Computing Architecture", student: "Fatima Lahmar", type: "Master", status: "DEFENDED", validationStatus: "VALIDATED", academicYear: "2023-2024", theme: "Cloud", startDate: "2023-02-01" },
  { id: "7", title: "Mobile App Development", student: "Karim Bouzid", type: "PFE", status: "IN_PROGRESS", validationStatus: "REVISED", academicYear: "2025-2026", theme: "IoT", startDate: "2024-11-01" },
  { id: "8", title: "Cybersecurity Analysis", student: "Nadia Cherif", type: "Master", status: "IN_PROGRESS", validationStatus: "PENDING", academicYear: "2025-2026", theme: "Cybersecurity", startDate: "2024-09-01" },
  { id: "9", title: "Data Mining Algorithms", student: "Hamza Mokhtar", type: "PFE", status: "ABANDONED", validationStatus: "VALIDATED", academicYear: "2023-2024", theme: "Machine Learning", startDate: "2023-03-01" },
  { id: "10", title: "Quantum Computing", student: "Sami Arous", type: "PhD", status: "IN_PROGRESS", validationStatus: "VALIDATED", academicYear: "2024-2025", theme: "Quantum", startDate: "2023-09-01" },
  { id: "11", title: "Distributed Systems", student: "Leila Amrani", type: "Master", status: "DEFENDED", validationStatus: "VALIDATED", academicYear: "2024-2025", theme: "Cloud", startDate: "2023-10-01" },
  { id: "12", title: "Smart City Sensors", student: "Omar Djemai", type: "Internship", status: "IN_PROGRESS", validationStatus: "PENDING", academicYear: "2025-2026", theme: "IoT", startDate: "2025-01-15" },
  { id: "13", title: "Cryptography Protocols", student: "Yasmine Bensaad", type: "PhD", status: "IN_PROGRESS", validationStatus: "REVISED", academicYear: "2024-2025", theme: "Cybersecurity", startDate: "2022-09-01" },
  { id: "14", title: "Web Security Audit", student: "Rafik Mansouri", type: "PFE", status: "DEFENDED", validationStatus: "VALIDATED", academicYear: "2024-2025", theme: "Cybersecurity", startDate: "2024-02-01" },
  { id: "15", title: "Recommendation Systems", student: "Ines Ferhat", type: "Master", status: "IN_PROGRESS", validationStatus: "VALIDATED", academicYear: "2025-2026", theme: "Machine Learning", startDate: "2024-09-01" },
  { id: "16", title: "DeFi Smart Contracts", student: "Anis Kaddour", type: "Master", status: "EXTENSION", validationStatus: "PENDING", academicYear: "2024-2025", theme: "Blockchain", startDate: "2023-09-01" },
  { id: "17", title: "Edge Computing", student: "Salma Hamdi", type: "PFE", status: "IN_PROGRESS", validationStatus: "REJECTED", academicYear: "2025-2026", theme: "Cloud", startDate: "2024-10-01" },
  { id: "18", title: "Medical Image Segmentation", student: "Nabil Chouiter", type: "PhD", status: "IN_PROGRESS", validationStatus: "VALIDATED", academicYear: "2024-2025", theme: "Healthcare", startDate: "2022-03-01" },
  { id: "19", title: "Arabic Speech Recognition", student: "Dalia Meziane", type: "Master", status: "SUSPENDED", validationStatus: "REJECTED", academicYear: "2023-2024", theme: "NLP", startDate: "2023-02-01" },
  { id: "20", title: "DevOps Pipeline", student: "Walid Khelifi", type: "Project", status: "DEFENDED", validationStatus: "VALIDATED", academicYear: "2024-2025", theme: "Cloud", startDate: "2024-01-01" },
  { id: "21", title: "Network Intrusion Detection", student: "Samira Belkadi", type: "Master", status: "IN_PROGRESS", validationStatus: "PENDING", academicYear: "2025-2026", theme: "Cybersecurity", startDate: "2024-09-01" },
  { id: "22", title: "Supply Chain Blockchain", student: "Tarek Boussaha", type: "PFE", status: "DEFENDED", validationStatus: "VALIDATED", academicYear: "2023-2024", theme: "Blockchain", startDate: "2023-03-01" },
  { id: "23", title: "Federated Learning", student: "Houda Slimani", type: "PhD", status: "IN_PROGRESS", validationStatus: "REVISED", academicYear: "2024-2025", theme: "Machine Learning", startDate: "2023-09-01" },
  { id: "24", title: "Smart Home IoT", student: "Ibrahim Ziani", type: "Internship", status: "IN_PROGRESS", validationStatus: "VALIDATED", academicYear: "2025-2026", theme: "IoT", startDate: "2025-02-01" },
  { id: "25", title: "API Security", student: "Farida Benali", type: "PFE", status: "IN_PROGRESS", validationStatus: "PENDING", academicYear: "2025-2026", theme: "Cybersecurity", startDate: "2024-11-01" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  DEFENDED: "default",
  VALIDATED: "default",
  REJECTED: "destructive",
  REVISED: "secondary",
  ABANDONED: "destructive",
  EXTENSION: "outline",
  SUSPENDED: "outline",
};

function formatStatus(s: string): string {
  if (s === "IN_PROGRESS") return "IN_PROG";
  return s;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function SupervisionListPage() {
  const { userId } = useParams<{ userId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filter state (same shape as in Filters panel)
  const [typeFilter, setTypeFilter] = useState<SupervisionType[]>([]);
  const [statusFilter, setStatusFilter] = useState<SupervisionStatus[]>([]);
  const [validationFilter, setValidationFilter] = useState<ValidationStatus[]>([]);
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("");
  const [themeFilter, setThemeFilter] = useState<string>("");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [startDateTo, setStartDateTo] = useState("");

  const toggleType = (t: SupervisionType) => {
    setTypeFilter((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };
  const toggleStatus = (s: SupervisionStatus) => {
    setStatusFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };
  const toggleValidation = (v: ValidationStatus) => {
    setValidationFilter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const hasActiveFilters =
    typeFilter.length > 0 ||
    statusFilter.length > 0 ||
    validationFilter.length > 0 ||
    academicYearFilter !== "" ||
    themeFilter !== "" ||
    startDateFrom !== "" ||
    startDateTo !== "";

  const activeFilterLabels: { key: string; label: string }[] = [];
  typeFilter.forEach((t) => activeFilterLabels.push({ key: `type-${t}`, label: `Type: ${t}` }));
  statusFilter.forEach((s) => activeFilterLabels.push({ key: `status-${s}`, label: `Status: ${s.replace("_", " ")}` }));
  validationFilter.forEach((v) => activeFilterLabels.push({ key: `val-${v}`, label: `Validation: ${v}` }));
  if (academicYearFilter) activeFilterLabels.push({ key: "year", label: `Academic Year: ${academicYearFilter}` });
  if (themeFilter) activeFilterLabels.push({ key: "theme", label: `Theme: ${themeFilter}` });
  if (startDateFrom) activeFilterLabels.push({ key: "from", label: `From: ${startDateFrom}` });
  if (startDateTo) activeFilterLabels.push({ key: "to", label: `To: ${startDateTo}` });

  const removeFilter = (key: string) => {
    if (key.startsWith("type-")) setTypeFilter((p) => p.filter((x) => `type-${x}` !== key));
    else if (key.startsWith("status-")) setStatusFilter((p) => p.filter((x) => `status-${x}` !== key));
    else if (key.startsWith("val-")) setValidationFilter((p) => p.filter((x) => `val-${x}` !== key));
    else if (key === "year") setAcademicYearFilter("");
    else if (key === "theme") setThemeFilter("");
    else if (key === "from") setStartDateFrom("");
    else if (key === "to") setStartDateTo("");
  };

  const clearAllFilters = () => {
    setTypeFilter([]);
    setStatusFilter([]);
    setValidationFilter([]);
    setAcademicYearFilter("");
    setThemeFilter("");
    setStartDateFrom("");
    setStartDateTo("");
    setPage(1);
  };

  const applyFiltersFromPanel = () => {
    setFiltersOpen(false);
    setPage(1);
  };

  const resetPanelFilters = () => {
    setTypeFilter([]);
    setStatusFilter([]);
    setValidationFilter([]);
    setAcademicYearFilter("");
    setThemeFilter("");
    setStartDateFrom("");
    setStartDateTo("");
    setPage(1);
    setFiltersOpen(false);
  };

  const filtered = useMemo(() => {
    let list = MOCK_SUPERVISIONS;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.student.toLowerCase().includes(q) ||
          r.theme.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
      );
    }
    if (typeFilter.length > 0) list = list.filter((r) => typeFilter.includes(r.type));
    if (statusFilter.length > 0) list = list.filter((r) => statusFilter.includes(r.status));
    if (validationFilter.length > 0) list = list.filter((r) => validationFilter.includes(r.validationStatus));
    if (academicYearFilter) list = list.filter((r) => r.academicYear === academicYearFilter);
    if (themeFilter) list = list.filter((r) => r.theme === themeFilter);
    if (startDateFrom) list = list.filter((r) => r.startDate >= startDateFrom);
    if (startDateTo) list = list.filter((r) => r.startDate <= startDateTo);
    return list;
  }, [
    searchQuery,
    typeFilter,
    statusFilter,
    validationFilter,
    academicYearFilter,
    themeFilter,
    startDateFrom,
    startDateTo,
  ]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  function handleDelete(id: string) {
    console.log("Delete supervision", id);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Supervisions ({totalFiltered} total)
        </h1>
      </div>

      {/* Toolbar: Search | Filters | Add New */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, keywords, student name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap"
        >
          <SlidersHorizontal className="size-4 shrink-0" />
          <span>Filters</span>
        </Button>
        <Button asChild className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
          <Link to={userId ? getResearcherSupervisionNewPath(userId) : "#"} className="inline-flex items-center gap-2">
            <Plus className="size-4 shrink-0" />
            <span>Add New</span>
          </Link>
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2 py-3">
            <span className="text-sm text-muted-foreground">Active Filters:</span>
            {activeFilterLabels.map(({ key, label }) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-sm"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeFilter(key)}
                  className="rounded p-0.5 hover:bg-muted"
                  aria-label={`Remove ${label}`}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium max-w-[220px]">{row.title}</TableCell>
                  <TableCell>{row.student}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{formatStatus(row.status)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[row.validationStatus] ?? "outline"}>
                      {row.validationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" aria-label="Actions">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            to={
                              userId
                                ? getSupervisionEditPath(userId, row.id)
                                : "#"
                            }
                          >
                            <Pencil className="size-4" />
                            Update
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border bg-background px-2 py-1.5 text-sm"
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              <ChevronLeft className="size-4 shrink-0" />
              <span>Prev</span>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === currentPage ? "secondary" : "ghost"}
                size="sm"
                className="min-w-8"
                onClick={() => p !== currentPage && setPage(p)}
                disabled={p === currentPage}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="size-4 shrink-0" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            ({currentPage} of {totalPages})
          </span>
        </CardContent>
      </Card>

      {/* Filters panel (slide-over) */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-card shadow-lg transition-transform duration-200 ease-out",
          filtersOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ visibility: filtersOpen ? "visible" : "hidden" }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <div className="mb-2 text-sm font-medium">Type</div>
              <div className="space-y-2">
                {SUPERVISION_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={typeFilter.includes(t)}
                      onChange={() => toggleType(t)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Status</div>
              <div className="space-y-2">
                {SUPERVISION_STATUSES.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(s)}
                      onChange={() => toggleStatus(s)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{s.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Validation Status</div>
              <div className="space-y-2">
                {VALIDATION_STATUSES.map((v) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={validationFilter.includes(v)}
                      onChange={() => toggleValidation(v)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Academic Year</label>
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Theme</label>
              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select theme...</option>
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Start Date Range</div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={startDateFrom}
                    onChange={(e) => setStartDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={startDateTo}
                    onChange={(e) => setStartDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 border-t p-4">
            <Button onClick={applyFiltersFromPanel} className="flex-1 shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-2">
              Apply Filters
            </Button>
            <Button variant="outline" onClick={resetPanelFilters} className="shrink-0 whitespace-nowrap">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop when filters open */}
      {filtersOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20"
          aria-label="Close filters"
          onClick={() => setFiltersOpen(false)}
        />
      )}
    </div>
  );
}
