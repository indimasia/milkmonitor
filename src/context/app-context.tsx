"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import type { FeedingLog, GrowthRecord, FeedingSchedule, User } from "@/lib/types";

interface AppContextType {
  feedings: FeedingLog[];
  growthRecords: GrowthRecord[];
  schedule: FeedingSchedule | null;
  currentUser: User | null;
  addFeeding: (feeding: Omit<FeedingLog, "id">) => void;
  updateFeeding: (id: string, updatedFeeding: Omit<FeedingLog, "id">) => void;
  deleteFeeding: (id: string) => void;
  addGrowthRecord: (record: Omit<GrowthRecord, "id">) => void;
  updateGrowthRecord: (id: string, updatedRecord: Omit<GrowthRecord, "id">) => void;
  deleteGrowthRecord: (id: string) => void;
  setSchedule: (schedule: FeedingSchedule) => void;
  login: (credentials: Pick<User, "email" | "password">) => boolean;
  logout: () => void;
  register: (credentials: Pick<User, "email" | "password">) => boolean;
}

export const AppContext = createContext<AppContextType>({
  feedings: [],
  growthRecords: [],
  schedule: null,
  currentUser: null,
  addFeeding: () => {},
  updateFeeding: () => {},
  deleteFeeding: () => {},
  addGrowthRecord: () => {},
  updateGrowthRecord: () => {},
  deleteGrowthRecord: () => {},
  setSchedule: () => {},
  login: () => false,
  logout: () => {},
  register: () => false,
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

// Dummy Users
const initialUsers: User[] = [
    { id: '1', email: 'user@example.com', password: 'password123' }
];

const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const { currentUser } = React.useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ['/login', '/register'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!currentUser && !isPublicPath) {
      router.push('/login');
    } else if (currentUser && isPublicPath) {
      router.push('/');
    }
  }, [currentUser, pathname, router]);

  const publicPaths = ['/login', '/register'];
  if (!currentUser && !publicPaths.includes(pathname)) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [feedings, setFeedings] = useState<FeedingLog[]>(initialFeedings);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>(initialGrowthRecords);
  const [schedule, setSchedule] = useState<FeedingSchedule | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  const login = (credentials: Pick<User, "email" | "password">) => {
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (credentials: Pick<User, "email" | "password">) => {
    if (users.some(u => u.email === credentials.email)) {
      return false; // User already exists
    }
    const newUser: User = {
      id: new Date().toISOString(),
      email: credentials.email!,
      password: credentials.password!,
    };
    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const value = {
    feedings,
    growthRecords,
    schedule,
    currentUser,
    addFeeding,
    updateFeeding,
    deleteFeeding,
    addGrowthRecord,
    updateGrowthRecord,
    deleteGrowthRecord,
    setSchedule,
    login,
    logout,
    register,
  };

  return (
    <AppContext.Provider value={value}>
      <AuthWrapper>{children}</AuthWrapper>
    </AppContext.Provider>
  );
};
