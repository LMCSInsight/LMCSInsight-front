import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import { useAuthContext } from "@/shared/context/AuthContext";
import { ROUTES, getResearcherDashboardPath } from "@/config/routes";
import type { AppRole } from "@/config/routes";

const { Header, Sider, Content } = Layout;

interface NavItem {
  key: string;
  path: string;
  label: string;
}

const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  ADMIN: [
    { key: "admin-dashboard", path: ROUTES.DASHBOARD_ADMIN, label: "Dashboard" },
    { key: "admin-users", path: ROUTES.ADMIN, label: "Users" },
  ],
  DIRECTOR: [
    { key: "director-dashboard", path: ROUTES.DASHBOARD_DIRECTOR, label: "Dashboard" },
    { key: "supervisions", path: ROUTES.SUPERVISIONS, label: "Supervisions" },
    { key: "validation", path: ROUTES.VALIDATION, label: "Validation queue" },
  ],
  RESEARCHER: [
    { key: "researcher-dashboard", path: ROUTES.DASHBOARD_RESEARCHER, label: "My dashboard" },
    { key: "supervisions", path: ROUTES.SUPERVISIONS, label: "My supervisions" },
  ],
  ASSISTANT: [
    { key: "assistant-dashboard", path: ROUTES.DASHBOARD_ASSISTANT, label: "Dashboard" },
    { key: "validation", path: ROUTES.VALIDATION, label: "Validation queue" },
  ],
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuthContext();

  const role = (currentUser?.role ?? "RESEARCHER") as AppRole;
  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.RESEARCHER;

  const getPath = (item: NavItem) =>
    role === "RESEARCHER" && item.key === "researcher-dashboard" && currentUser?.id
      ? getResearcherDashboardPath(currentUser.id)
      : item.path;

  const menuItems = navItems.map((item) => ({
    key: item.key,
    label: <Link to={getPath(item)}>{item.label}</Link>,
  }));

  const selectedKey =
    navItems.find((item) => location.pathname.startsWith(getPath(item)))?.key ?? navItems[0]?.key;

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 24,
          background: "#001529",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 18 }}>LMCS Insight</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.85)" }}>
            {currentUser?.name ?? currentUser?.email}
          </span>
          <Button type="primary" ghost size="small" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={220} style={{ background: "#fff" }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>
        <Content style={{ padding: 24, background: "#f0f2f5" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
