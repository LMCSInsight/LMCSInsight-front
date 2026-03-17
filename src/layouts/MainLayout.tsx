import { Outlet } from "react-router-dom";
import { Layout } from "antd";

const { Content } = Layout;

export function MainLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
}
