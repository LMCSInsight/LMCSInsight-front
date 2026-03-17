import { Outlet } from "react-router-dom";
import { Layout } from "antd";

const { Content } = Layout;

export function AuthLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
