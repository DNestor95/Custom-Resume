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

export interface ScrapeJobResponse {
  company: string;
  title: string;
  description: string;
}
