"use client";
import { useState, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import VaultScreen from "@/components/VaultScreen";
import WarpDrive from "@/components/WarpDrive";
import AgentsScene3D from "@/components/AgentsScene3D";
import DashboardScreen from "@/components/DashboardScreen";

type AppStep = "login" | "vault" | "warp" | "agents" | "dashboard";

export default function Home() {
  const [step, setStep] = useState<AppStep>("login");
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    const hasConfig = localStorage.getItem('fabric_has_ships') === 'true';
    setIsFirstTime(!hasConfig);
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      {step === "login" && <LoginScreen onLoginSuccess={() => setStep("vault")} />}
      {step === "vault" && <VaultScreen onUnlock={() => setStep("warp")} />}
      {step === "warp" && <WarpDrive isFirstTime={isFirstTime} onComplete={() => setStep("agents")} />}
      {step === "agents" && <AgentsScene3D onComplete={() => {
        localStorage.setItem('fabric_has_ships', 'true');
        setStep("dashboard");
      }} />}
      {step === "dashboard" && <DashboardScreen />}
    </main>
  );
}