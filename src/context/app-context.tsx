"use client";

import React, { createContext, useState, ReactNode } from "react";
import type { FeedingLog, GrowthRecord, FeedingSchedule } from "@/lib/types";

interface AppContextType {
  feedings: FeedingLog[];
  growthRecords: GrowthRecord[];
  schedule: FeedingSchedule | null;
  addFeeding: (feeding: Omit<FeedingLog, "id">) => void;
  updateFeeding: (id: string, updatedFeeding: Omit<FeedingLog, "id">) => void;
  deleteFeeding: (id: string) => void;
  addGrowthRecord: (record: Omit<GrowthRecord, "id">) => void;
  updateGrowthRecord: (id: string, updatedRecord: Omit<GrowthRecord, "id">) => void;
  deleteGrowthRecord: (id: string) => void;
  setSchedule: (schedule: FeedingSchedule) => void;
}

export const AppContext = createContext<AppContextType>({
  feedings: [],
  growthRecords: [],
  schedule: null,
  addFeeding: () => {},
  updateFeeding: () => {},
  deleteFeeding: () => {},
  addGrowthRecord: () => {},
  updateGrowthRecord: () => {},
  deleteGrowthRecord: () => {},
  setSchedule: () => {},
});

// Mock Data
const initialFeedings: FeedingLog[] = [
  {
    id: "1",
    dateTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    type: "EBM",
    amount: 120,
  },
  {
    id: "2",
    dateTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    type: "Formula",
    amount: 100,
  },
];

const initialGrowthRecords: GrowthRecord[] = [
  {
    id: "1",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    weight: 4.5,
    height: 55,
    headCircumference: 36,
  },
  {
    id: "2",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    weight: 4.2,
    height: 53,
    headCircumference: 35.5,
  },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [feedings, setFeedings] = useState<FeedingLog[]>(initialFeedings);
  const [growthRecords, setGrowthRecords] =
    useState<GrowthRecord[]>(initialGrowthRecords);
  const [schedule, setSchedule] = useState<FeedingSchedule | null>(null);

  const addFeeding = (feeding: Omit<FeedingLog, "id">) => {
    const newFeeding = { ...feeding, id: new Date().toISOString() };
    setFeedings((prev) => [newFeeding, ...prev]);
  };
  
  const updateFeeding = (id: string, updatedFeeding: Omit<FeedingLog, "id">) => {
    setFeedings(prev => prev.map(f => f.id === id ? { ...updatedFeeding, id } : f));
  };

  const deleteFeeding = (id: string) => {
    setFeedings(prev => prev.filter(f => f.id !== id));
  };

  const addGrowthRecord = (record: Omit<GrowthRecord, "id">) => {
    const newRecord = { ...record, id: new Date().toISOString() };
    setGrowthRecords((prev) => [newRecord, ...prev]);
  };

  const updateGrowthRecord = (id: string, updatedRecord: Omit<GrowthRecord, "id">) => {
    setGrowthRecords(prev => prev.map(r => r.id === id ? { ...updatedRecord, id } : r));
  };

  const deleteGrowthRecord = (id: string) => {
    setGrowthRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        feedings,
        growthRecords,
        schedule,
        addFeeding,
        updateFeeding,
        deleteFeeding,
        addGrowthRecord,
        updateGrowthRecord,
        deleteGrowthRecord,
        setSchedule,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
