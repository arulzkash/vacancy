export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "intern";

export type ExperienceLevel =
  | "less_than_1"
  | "1_3"
  | "4_5"
  | "6_10"
  | "more_than_10";

export type Vacancy = {
  id: number;
  title: string;
  position: string;
  company: {
    name: string;
    business_sector: string;
    employee_range: string;
  };
  employment_type: EmploymentType;
  candidate_count: number;
  closing_date: string;
  location: string;
  is_remote: boolean;
  experience_level: ExperienceLevel;
  show_salary: boolean;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  updated_at: string;
};

export type VacancyListResponse = {
  data: Vacancy[];
};

export type VacancyDetail = Vacancy & {
  description_html: string;
};

export type VacancyDetailResponse = {
  data: VacancyDetail;
};
