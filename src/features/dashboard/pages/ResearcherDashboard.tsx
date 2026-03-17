import { Link, useParams } from "react-router-dom";
import {
  BarChart3,
  Clock,
  GraduationCap,
  Hourglass,
  Plus,
  UserPlus,
  List,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  getResearcherSupervisionsPath,
  getResearcherSupervisionDetailPath,
  getSupervisionEditPath,
  getResearcherSupervisionNewPath,
  getResearcherStudentsPath,
} from "@/config/routes";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_STATS = {
  total: 25,
  inProgress: 7,
  defended: 18,
  pendingValidation: 3,
};

const MOCK_BY_TYPE = [
  { name: "PFE", value: 10, pct: 40 },
  { name: "Master", value: 8, pct: 32 },
  { name: "PhD", value: 5, pct: 20 },
  { name: "Internship", value: 2, pct: 8 },
  { name: "Project", value: 0, pct: 0 },
];

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const MOCK_BY_YEAR = [
  { year: "2021-22", count: 4 },
  { year: "2022-23", count: 6 },
  { year: "2023-24", count: 7 },
  { year: "2024-25", count: 5 },
  { year: "2025-26", count: 3 },
];

const SUPERVISION_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  IN_PROGRESS: "secondary",
  VALIDATED: "default",
  REJECTED: "destructive",
};

const MOCK_RECENT_SUPERVISIONS = [
  { id: "1", title: "Deep Learning for Medical Imaging", student: "Ali K.", type: "Master", status: "PENDING" },
  { id: "2", title: "Blockchain for Supply Chain", student: "Sara M.", type: "PFE", status: "VALIDATED" },
  { id: "3", title: "IoT Security in Smart Cities", student: "Youcef B.", type: "Master", status: "REJECTED" },
  { id: "4", title: "AI for Healthcare Diagnostics", student: "Amina T.", type: "PhD", status: "VALIDATED" },
  { id: "5", title: "NLP for Arabic Dialects", student: "Mohamed K.", type: "Master", status: "IN_PROGRESS" },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function ResearcherDashboard() {
  const { researcherId } = useParams<{ researcherId: string }>();
  const basePath = researcherId ? getResearcherSupervisionsPath(researcherId) : "#";

  function handleDeleteSupervision(id: string) {
    // Placeholder: in real app would call API and refresh list
    console.log("Delete supervision", id);
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to={basePath}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Supervisions
              </CardTitle>
              <BarChart3 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_STATS.total}</div>
              <p className="text-xs text-muted-foreground">Click to view all</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={basePath}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
              <Hourglass className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_STATS.inProgress}</div>
              <p className="text-xs text-muted-foreground">Click to filter</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={basePath}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Defended
              </CardTitle>
              <GraduationCap className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_STATS.defended}</div>
              <p className="text-xs text-muted-foreground">Click to filter</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={basePath}>
          <Card className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Validation
              </CardTitle>
              <Clock className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_STATS.pendingValidation}</div>
              <p className="text-xs text-muted-foreground">Click to filter</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts row - Recharts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supervisions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_BY_TYPE.filter((d) => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, pct }) => `${name}: ${pct}%`}
                  >
                    {MOCK_BY_TYPE.filter((d) => d.value > 0).map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string, props: { payload: { pct: number } }) => [`${value} (${props.payload.pct}%)`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {MOCK_BY_TYPE.map((item, i) => (
                <li key={item.name}>
                  {item.name}: {item.value} ({item.pct}%)
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Supervisions by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_BY_YEAR} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Supervisions table - Actions = dots menu (Update / Delete) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Supervisions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_RECENT_SUPERVISIONS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{row.student}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <Badge variant={SUPERVISION_STATUS_VARIANT[row.status] ?? "outline"}>
                      {row.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label="Actions">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            to={
                              researcherId
                                ? getSupervisionEditPath(researcherId, row.id)
                                : "#"
                            }
                          >
                            <Pencil className="size-4" />
                            Update
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteSupervision(row.id)}
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
        </CardContent>
      </Card>

      {/* Action buttons - icon and text on one line */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <Button asChild className="shrink-0 min-w-0 whitespace-nowrap">
          <Link to={researcherId ? getResearcherSupervisionNewPath(researcherId) : "#"} className="inline-flex items-center gap-2">
            <Plus className="size-5 shrink-0" />
            <span>Add New Supervision</span>
          </Link>
        </Button>
        <Button variant="secondary" asChild className="shrink-0 min-w-0 whitespace-nowrap border bg-background hover:bg-muted">
          <Link to={researcherId ? getResearcherStudentsPath(researcherId) : "#"} className="inline-flex items-center gap-2">
            <UserPlus className="size-5 shrink-0" />
            <span>Register Student</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="shrink-0 min-w-0 whitespace-nowrap">
          <Link to={basePath} className="inline-flex items-center gap-2">
            <List className="size-5 shrink-0" />
            <span>View All Supervisions</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
