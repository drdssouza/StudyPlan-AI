export interface User {
    id: string;
    email: string;
    name: string;
    attributes?: {
      email_verified?: boolean;
      name?: string;
    };
  }
  
  export interface Subject {
    name: string;
    weight: number;
    difficulty: 'Baixo' | 'Médio' | 'Alto';
    estimated: string;
    selected?: boolean;
  }
  
  export interface StudyPlan {
    id: string;
    userId: string;
    name: string;
    subjects: Subject[];
    hoursPerDay: number;
    daysPerWeek: number[];
    startDate: Date;
    endDate: Date;
    progress: number;
  }
  
  export interface ScheduleItem {
    day: string;
    morning: string;
    afternoon: string;
    evening: string;
  }