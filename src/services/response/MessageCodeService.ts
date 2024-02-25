import * as fs from 'fs';
import { Service } from 'typedi';

interface ResponseMessages {
	[key: string]: {
		[key: string]: ResponseMessage;
	};
}

export class ResponseMessage {
	Code: string;
	Message: string;
	StatusCode: number;

	constructor(code: string, message: string, statusCode: number) {
		this.Code = code;
		this.Message = message;
		this.StatusCode = statusCode;
	}
}

@Service()
export class MessageCodeService {
	public readonly Messages: ResponseMessages;

	constructor() {
		const data = fs.readFileSync(
			'src/models/share/api/MessageCodes.json',
			'utf8'
		);
		this.Messages = JSON.parse(data);
	}

	public getResponseMessageByCode(code: string): ResponseMessage | undefined {
		for (const category in this.Messages) {
			if (Object.prototype.hasOwnProperty.call(this.Messages, category)) {
				const responseMessages = this.Messages[category];
				for (const key in responseMessages) {
					if (
						Object.prototype.hasOwnProperty.call(
							responseMessages,
							key
						)
					) {
						const responseMessage = responseMessages[key];
						if (responseMessage.Code === code) {
							return responseMessage;
						}
					}
				}
			}
		}
		return undefined;
	}
}
