interface Message {
	code: string;
	message: string;
}

export class ResponseWarning implements Message {
	code: string;
	message: string;

	constructor(code: string, message: string) {
		this.code = code;
		this.message = message;
	}
}

export class ResponseMessage implements Message {
	public code: string;
	public message: string;

	constructor(code: string, message: string) {
		this.code = code;
		this.message = message;
	}
}

export interface Pagination {
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
	totalPages: number;
}

export interface Metadata {
	// Add any relevant metadata properties here
}

// For partial success
class Result<T> {
	data: T;
	success: boolean;
	errorMessage?: string;

	constructor(data: T, success: boolean, errorMessage?: string) {
		this.data = data;
		this.success = success;
		this.errorMessage = errorMessage;
	}
}

interface BackendStandardResponseInput<T> {
	status: 'success' | 'error' | 'partial';
	message: ResponseMessage;
	data?: T;
	requestId: string;
	traceId?: string;
	timestamp?: string; // ISO 8601 format
	warnings?: ResponseWarning[];
	version?: string;
	pagination?: Pagination;
	metadata?: Metadata;
	result?: Result<T>[];
}

class BackendStandardResponse<T> {
	status: 'success' | 'error' | 'partial';
	message: ResponseMessage;
	data?: T;
	requestId: string;
	traceId?: string;
	timestamp?: string;
	warnings?: ResponseWarning[];
	version?: string;
	pagination?: Pagination;
	metadata?: Metadata;
	result?: Result<T>[]; // List of Result<T>

	constructor(input: BackendStandardResponseInput<T>) {
		this.status = input.status;
		this.message = input.message;
		this.data = input.data;
		this.requestId = input.requestId;
		this.traceId = input.traceId;
		this.timestamp = input.timestamp || new Date().toISOString();
		this.warnings = input.warnings;
		this.version = input.version || '1.0';
		this.pagination = input.pagination;
		this.metadata = input.metadata;
		this.result = input.result;
	}
}

export default BackendStandardResponse;
