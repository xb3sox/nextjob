import { Layout, render } from "~/modules/common/layout/layout";

import { SidepanelWorkspace } from "./sidepanel-workspace";

const SidePanel = () => {
  return (
    <Layout className="p-4">
      <SidepanelWorkspace />
    </Layout>
  );
};

render("root", <SidePanel />);
