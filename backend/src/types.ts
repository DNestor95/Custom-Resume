export interface JobApplication {
  id: string;
  company: string;
  title: string;
  description: string;
  tailoredResume?: string;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequest {
  company: string;
  title: string;
  description: string;
}

export interface UpdateJobRequest {
  company?: string;
  title?: string;
  description?: string;
}

export interface TailorResumeRequest {
  baseResume: string;
}

export interface GenerateCoverLetterRequest {
  baseResume: string;
  styleSample: string;
}

export interface TailorCoverLetterRequest {
  baseCoverLetter: string;
}

export interface CustomizeRequest {
  jobUrl: string;
  baseResume: string;
  baseCoverLetter: string;
}

export interface CustomizeResponse {
  job: JobApplication;
  tailoredResume: string;
  tailoredCoverLetter: string;
}

export interface ScrapeJobRequest {
  url: string;
}

export interface ScrapeJobResponse {
  company: string;
  title: string;
  description: string;
}
