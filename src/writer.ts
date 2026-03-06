import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'logs');

// Ensure base dir exists
if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface LogEntry {
	level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
	timestamp: string;
	message: string;
	meta?: any;
}

export interface LogPayload {
	projectId: string;
	logs: LogEntry[];
}

export class AsyncLogWriter {
	private getLogFilePath(projectId: string): string {
		const projectDir = path.join(DATA_DIR, projectId);
		if (!fs.existsSync(projectDir)) {
			fs.mkdirSync(projectDir, { recursive: true });
		}

		const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		return path.join(projectDir, `${dateStr}.log`);
	}

	public async writeBatch(payload: LogPayload): Promise<void> {
		if (!payload.logs || payload.logs.length === 0) return;

		const filePath = this.getLogFilePath(payload.projectId);

		const lines = payload.logs
			.map((log) => {
				const level = (log.level || 'INFO').toUpperCase().trim();
				const projectId = (payload.projectId || '').trim();
				const message = (log.message || '').trim(); // Trims the leading \n from console logs
				const ts = log.timestamp || new Date().toISOString();
				return `[${ts}] [${level}] [${projectId}] ${message}\n`;
			})
			.join('');

		// In a truly massive system you'd keep a Map of WriteStreams.
		// For moderate microservices, appendFile is perfectly non-blocking.
		await fs.promises.appendFile(filePath, lines);
	}
}
