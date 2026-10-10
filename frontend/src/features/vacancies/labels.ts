import type { EmploymentType, ExperienceLevel } from "./types";

export const employmentTypeLabels: Record<EmploymentType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export const experienceLevelLabels: Record<ExperienceLevel, string> = {
  less_than_1: "Kurang dari 1 tahun",
  "1_3": "1–3 tahun",
  "4_5": "4–5 tahun",
  "6_10": "6–10 tahun",
  more_than_10: "Lebih dari 10 tahun",
};

export const createEmploymentTypeLabels: Record<EmploymentType, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  contract: "Kontrak",
  intern: "Intern",
};

export const createExperienceLevelLabels: Record<ExperienceLevel, string> = {
  less_than_1: "Kurang dari 1 tahun",
  "1_3": "1-3 tahun",
  "4_5": "4-5 tahun",
  "6_10": "6-10 tahun",
  more_than_10: "Lebih dari 10 tahun",
};
