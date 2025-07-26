"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Activity, Users, BarChart3 } from "lucide-react";
import Dashboard from "~/components/Dashboard";
import CDSSScreen from "~/components/CDSSScreen";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "cdss">(
    "dashboard", // Default to "dashboard"
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentScreen("cdss");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Image
                  src="/images/logo.png"
                  alt="logo"
                  width={40}
                  height={40}
                />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">医通</h1>
                </div>
              </div>
            </div>

            {/* Default Navigation */}
            <nav className="flex space-x-2">
              <Button
                variant={currentScreen === "dashboard" ? "default" : "outline"}
                onClick={() => setCurrentScreen("dashboard")}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>仪表板</span>
              </Button>
              <Button
                variant={currentScreen === "cdss" ? "default" : "outline"}
                onClick={() => setCurrentScreen("cdss")}
                className="flex items-center space-x-2"
                disabled={!selectedPatientId}
              >
                <Activity className="h-4 w-4" />
                <span>CDSS系统</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {currentScreen === "dashboard" && (
          <Dashboard onPatientSelect={handlePatientSelect} />
        )}
        {currentScreen === "cdss" && selectedPatientId && (
          <CDSSScreen patientId={selectedPatientId} />
        )}
        {currentScreen === "cdss" && !selectedPatientId && (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                请选择患者
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                请从仪表板选择一个患者开始使用CDSS系统
              </p>
              <Button
                onClick={() => setCurrentScreen("dashboard")}
                className="mt-4"
              >
                返回仪表板
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
