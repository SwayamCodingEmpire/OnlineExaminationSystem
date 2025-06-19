export interface QuestionBankPayload {
  code: string;
  question: string;
  options: string[];
  correctOption?: string;
  marks: number;
  topicCode: string;
  duration: number;

}
