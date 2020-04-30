export class SurveyQuestion {
    _id: string;
    type: string;
    questionText: string;
    answerRequired: boolean;
    maxChars?: number;
    choices?: string[];
    other?: boolean;
    likert?: any;
    infoText?: string;
    docPickerText?: string;
}
