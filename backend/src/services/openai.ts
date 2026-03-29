import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it to your .env file.');
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function tailorResume(
  baseResume: string,
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<string> {
  const openai = getClient();

  const prompt = `You are an expert resume writer. Your task is to tailor the provided resume for a specific job application.

Job Details:
- Company: ${company}
- Job Title: ${jobTitle}
- Job Description: ${jobDescription}

Base Resume:
${baseResume}

Please rewrite and tailor this resume to highlight the most relevant skills, experiences, and accomplishments for this specific role. 
- Keep the same overall structure and factual information
- Emphasize relevant skills and experiences that match the job description
- Use keywords from the job description where naturally applicable
- Adjust the summary/objective to target this specific role
- Ensure the resume is compelling and ATS-friendly

Return only the tailored resume text, no additional commentary.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content ?? '';
}

export async function generateCoverLetter(
  baseResume: string,
  jobTitle: string,
  company: string,
  jobDescription: string,
  styleSample: string
): Promise<string> {
  const openai = getClient();

  const prompt = `You are an expert cover letter writer. Your task is to write a cover letter for a job application, matching the style and tone of the provided sample.

Job Details:
- Company: ${company}
- Job Title: ${jobTitle}
- Job Description: ${jobDescription}

Applicant's Resume:
${baseResume}

Style Sample (match the tone, length, and writing style of this sample):
${styleSample}

Please write a compelling cover letter that:
- Matches the tone, style, and approximate length of the style sample
- Highlights the applicant's most relevant qualifications for this specific role
- Shows genuine enthusiasm for the company and position
- Uses specific examples from the resume to demonstrate fit
- Follows the structural approach of the sample

Return only the cover letter text, no additional commentary.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content ?? '';
}
