
import React from "react";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import SidebarMenu from "./SidebarMenu";
import SidebarFooterComponent from "./SidebarFooter";
import SidebarHeaderComponent from "./SidebarHeader";

const Sidebar = () => {
  return (
    <SidebarComponent collapsible="icon">
      <SidebarHeader>
        <SidebarHeaderComponent />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterComponent />
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
