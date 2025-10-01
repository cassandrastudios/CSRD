export type SessionType = "O2" | "CO2" | "CUSTOM";
export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface TrainingTable {
  rounds: number;
  holdTimes: number[];
  restTimes: number[];
}

export interface TrainingProgram {
  id: string;
  name: string;
  level: SkillLevel;
  description: string;
  duration: string;
  weeks: ProgramWeek[];
}

export interface ProgramWeek {
  week: number;
  goal: string;
  sessions: ProgramSession[];
}

export interface ProgramSession {
  day: number;
  type: SessionType;
  table: TrainingTable;
  notes?: string;
}
