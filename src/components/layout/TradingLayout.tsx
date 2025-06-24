
import { Outlet } from "react-router-dom";
import { SignedIn, UserButton, useUser } from "@clerk/clerk-react";
import { TradingSidebar } from "./TradingSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export function TradingLayout() {
  const { user } = useUser();

  return (
    <>
      <TradingSidebar />
      <main className="flex-1 overflow-hidden">
        <SignedIn>
          <div className="h-full flex flex-col">
            {/* User info bar */}
            <div className="border-b bg-muted/50 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Professional Trading Account
                    </p>
                  </div>
                </div>
                <UserButton afterSignOutUrl="/auth" />
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex-1 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </SignedIn>
      </main>
    </>
  );
}
