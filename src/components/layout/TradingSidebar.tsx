
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  TrendingUp,
  List,
  DollarSign,
  FileText,
  PieChart,
  BookOpen,
  Settings,
  Activity,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const tradingMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Charts",
    url: "/charts",
    icon: TrendingUp,
  },
  {
    title: "Watchlist",
    url: "/watchlist",
    icon: List,
  },
  {
    title: "Market Intelligence",
    url: "/market-intelligence",
    icon: Activity,
  },
];

const tradingActions = [
  {
    title: "Live Trading",
    url: "/trading",
    icon: DollarSign,
  },
  {
    title: "Paper Trading",
    url: "/paper-trading",
    icon: Activity,
  },
  {
    title: "Backtesting",
    url: "/backtesting",
    icon: Zap,
  },
  {
    title: "Stock Screener",
    url: "/screener",
    icon: FileText,
  },
];

const analysisTools = [
  {
    title: "Portfolio Analytics",
    url: "/portfolio-analytics",
    icon: PieChart,
  },
  {
    title: "Risk Management",
    url: "/risk-management",
    icon: BookOpen,
  },
  {
    title: "Trading Journal",
    url: "/journal",
    icon: BookOpen,
  },
];

const systemItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function TradingSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AlgoTrade Pro</h1>
            <p className="text-xs text-muted-foreground">Advanced Trading Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Market Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradingMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Trading</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradingActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analysis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisTools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Market Status
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>
        <SidebarTrigger className="mt-2" />
      </SidebarFooter>
    </Sidebar>
  );
}
