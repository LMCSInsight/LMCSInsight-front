import { Outlet } from "react-router-dom";
import { Layout } from "antd";

const { Content } = Layout;

export function DashboardLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
