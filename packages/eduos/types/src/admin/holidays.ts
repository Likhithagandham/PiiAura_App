export type HolidayScope = "institution" | "classes";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  scope: HolidayScope;
  classIds: string[];
  blocksAttendance: boolean;
  createdAt: string;
}

export interface CreateHolidayInput {
  name: string;
  date: string;
  scope: HolidayScope;
  classIds?: string[];
}
