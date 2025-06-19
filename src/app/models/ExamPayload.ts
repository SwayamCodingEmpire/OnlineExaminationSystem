import { Time } from "@angular/common";

export interface ExamPayload {
  code: string;
  name: string;
  examDate: Date; // or Date if you convert
  examTime: Time; // or Time if you convert
}
