
import { Outlet } from "react-router-dom";
import { TradingSidebar } from "./TradingSidebar";

export function TradingLayout() {
  return (
    <>
      <TradingSidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </>
  );
}
