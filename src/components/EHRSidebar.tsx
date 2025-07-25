"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Heart,
  Activity,
  FileText,
  Pill,
  AlertTriangle,
  Calendar,
  Phone,
  MapPin,
  Thermometer,
  Weight,
  Ruler,
} from "lucide-react";
import type { Patient } from "~/types";

interface EHRSidebarProps {
  patient: Patient;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function EHRSidebar({
  patient,
  collapsed,
  onToggleCollapse,
}: EHRSidebarProps) {
  const [activeSection, setActiveSection] = useState("demographics");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const demographicsRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const medicationsRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section");
            if (sectionId) {
              setActiveSection(sectionId);
            }
          }
        });
      },
      {
        root: scrollAreaRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]",
        ),
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0.1,
      },
    );

    const sections = [
      demographicsRef.current,
      historyRef.current,
      medicationsRef.current,
    ];
    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  const scrollToSection = (
    sectionRef: React.RefObject<HTMLDivElement | null>,
  ) => {
    if (sectionRef.current && scrollAreaRef.current) {
      const container = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = sectionRef.current.getBoundingClientRect();
        const offset =
          elementRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({ top: offset, behavior: "smooth" });
      }
    }
  };

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center space-y-4 border-r bg-gray-50 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="flex w-full justify-center"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const demographics = patient.demographics;
  const age =
    new Date().getFullYear() -
    new Date(demographics.date_of_birth).getFullYear();

  return (
    <div className="flex h-full flex-col border-r bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">患者档案</h2>
          <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b bg-white p-2">
        <div
          className="scrollbar-hide flex gap-1 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <Button
            variant={activeSection === "demographics" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(demographicsRef)}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <User className="h-3 w-3" />
            <span className="text-xs">基本信息</span>
          </Button>
          <Button
            variant={activeSection === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(historyRef)}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <FileText className="h-3 w-3" />
            <span className="text-xs">病史</span>
          </Button>
          <Button
            variant={activeSection === "medications" ? "default" : "ghost"}
            size="sm"
            onClick={() => scrollToSection(medicationsRef)}
            className="flex items-center space-x-1 whitespace-nowrap"
          >
            <Pill className="h-3 w-3" />
            <span className="text-xs">用药</span>
          </Button>
        </div>
      </div>

      {/* Content - Single Scroll Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="space-y-4 p-4">
          {/* Demographics Section */}
          <div
            ref={demographicsRef}
            data-section="demographics"
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>基本信息</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-300 to-blue-500">
                    <span className="text-lg font-bold text-white">
                      {demographics.first_name[0]}
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium">
                    {demographics.first_name}
                    {demographics.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {demographics.patient_id}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">性别:</span>
                    <span>{demographics.gender === "male" ? "男" : "女"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">年龄:</span>
                    <span>{age}岁</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">出生日期:</span>
                    <span>
                      {new Date(demographics.date_of_birth).toLocaleDateString(
                        "zh-CN",
                      )}
                    </span>
                  </div>
                </div>

                {demographics.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span>{demographics.phone}</span>
                  </div>
                )}

                {demographics.address && (
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="mt-0.5 h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">
                      {demographics.address}
                    </span>
                  </div>
                )}

                {demographics.emergency_contact_name && (
                  <div className="border-t pt-2">
                    <p className="mb-1 text-xs text-gray-500">紧急联系人</p>
                    <p className="text-sm font-medium">
                      {demographics.emergency_contact_name}
                    </p>
                    {demographics.emergency_contact_phone && (
                      <p className="text-sm text-gray-600">
                        {demographics.emergency_contact_phone}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* History Section */}
          {patient.historyPresentIllness && (
            <div ref={historyRef} data-section="history" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>现病史</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">主诉</p>
                    <p className="text-sm font-medium">
                      {patient.historyPresentIllness.chief_complaint}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-500">现病史</p>
                    <p className="text-sm text-gray-700">
                      {patient.historyPresentIllness.history_of_present_illness}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="mb-1 text-xs text-gray-500">起病</p>
                      <p>{patient.historyPresentIllness.onset}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-500">持续时间</p>
                      <p>{patient.historyPresentIllness.duration}</p>
                    </div>
                  </div>

                  {patient.historyPresentIllness.severity && (
                    <div>
                      <p className="mb-1 text-xs text-gray-500">严重程度</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {Array.from({ length: 10 }, (_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < patient.historyPresentIllness!.severity!
                                  ? "bg-red-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm">
                          {patient.historyPresentIllness.severity}/10
                        </span>
                      </div>
                    </div>
                  )}

                  {patient.historyPresentIllness.associated_symptoms && (
                    <div>
                      <p className="mb-1 text-xs text-gray-500">伴随症状</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.historyPresentIllness.associated_symptoms.map(
                          (symptom, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {symptom}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Medications Section */}
          <div
            ref={medicationsRef}
            data-section="medications"
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Pill className="h-4 w-4" />
                  <span>当前用药</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medicines.length > 0 ? (
                  <div className="space-y-3">
                    {patient.medicines.map((medicine) => (
                      <div
                        key={medicine._id}
                        className="rounded bg-gray-50 p-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {medicine.medicine_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {medicine.dosage} • {medicine.frequency}
                            </p>
                            <p className="text-xs text-gray-500">
                              {medicine.route === "oral"
                                ? "口服"
                                : medicine.route === "injection"
                                  ? "注射"
                                  : medicine.route === "topical"
                                    ? "外用"
                                    : "吸入"}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              medicine.route === "injection"
                                ? "border-red-200 text-red-700"
                                : medicine.route === "oral"
                                  ? "border-blue-200 text-blue-700"
                                  : "border-green-200 text-green-700"
                            }`}
                          >
                            {medicine.route === "oral"
                              ? "口服"
                              : medicine.route === "injection"
                                ? "注射"
                                : medicine.route === "topical"
                                  ? "外用"
                                  : "吸入"}
                          </Badge>
                        </div>
                        {medicine.notes && (
                          <p className="mt-1 text-xs text-gray-600">
                            {medicine.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <Pill className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无用药记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
