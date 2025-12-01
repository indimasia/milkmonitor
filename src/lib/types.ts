export type FeedingLog = {
  id: string;
  dateTime: string;
  type: "Breast Milk" | "Formula";
  amount: number; // in ml
};

export type GrowthRecord = {
  id: string;
  date: string;
  weight: number; // in kg
  height: number; // in cm
  headCircumference: number; // in cm
};

export type FeedingSchedule = {
  suggestedSchedule: string;
};
