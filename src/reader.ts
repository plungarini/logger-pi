import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data', 'logs');

export interface ParsedLog {
	timestamp: string;
	level: string;
	projectId: string;
	message: string;
}

export async function getRecentLogs(limit = 100): Promise<ParsedLog[]> {
	if (!fs.existsSync(DATA_DIR)) {
		return [];
	}

	const projects = await fs.promises.readdir(DATA_DIR);
	const dateStr = new Date().toISOString().split('T')[0];
	const allLogs: ParsedLog[] = [];

	for (const projectId of projects) {
		const stat = await fs.promises.stat(path.join(DATA_DIR, projectId));
		if (!stat.isDirectory()) continue;

		const logFile = path.join(DATA_DIR, projectId, `${dateStr}.log`);
		if (!fs.existsSync(logFile)) continue;

		try {
			const content = await fs.promises.readFile(logFile, 'utf8');
			const lines = content.split('\n').filter((l) => l.trim() !== '');

			// parse lines
			for (const line of lines) {
				// [2026-03-19T11:42:01.123Z] [INFO] [nesthub-pi] Some log message
				const match = line.match(/^\[(.*?)\]\s+\[(.*?)\]\s+\[(.*?)\]\s+(.*)$/);
				if (match) {
					allLogs.push({
						timestamp: match[1],
						level: match[2],
						projectId: match[3],
						message: match[4],
					});
				}
			}
		} catch (err) {
			console.error(`[logger-pi] Failed to read logs for project ${projectId}:`, err);
		}
	}

	// Sort chronologically (oldest first)
	allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

	// Return top N
	return allLogs.slice(-limit);
}
