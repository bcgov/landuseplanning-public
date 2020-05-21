export class SurveyQuestion {
    _id: string;
    type: string;
    questionText: string;
    answerRequired: boolean;
    maxChars?: number;
    choices?: string[];
    choose?: number;
    other?: boolean;
    attributes?: any;
    infoText?: string;
    docPickerText?: string;
    emailText: string;
    phoneNumberText: string;
}
