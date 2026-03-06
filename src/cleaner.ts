import fs from 'fs';
import cron from 'node-cron';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'logs');
const RETENTION_DAYS = 7;

export function startCleaner() {
	// Run every day at midnight
	cron.schedule('0 0 * * *', async () => {
		console.log('[cleaner] Starting daily log purge...');
		try {
			await purgeOldLogs();
			console.log('[cleaner] Daily log purge complete.');
		} catch (err) {
			console.error('[cleaner] Failed to purge logs', err);
		}
	});

	console.log(`[cleaner] Scheduled daily log purge (retention: ${RETENTION_DAYS} days)`);
}

async function purgeOldLogs() {
	if (!fs.existsSync(DATA_DIR)) return;

	const now = Date.now();
	const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

	const projects = await fs.promises.readdir(DATA_DIR);
	for (const projectId of projects) {
		const projectDir = path.join(DATA_DIR, projectId);
		const stats = await fs.promises.stat(projectDir);
		if (!stats.isDirectory()) continue;

		const logFiles = await fs.promises.readdir(projectDir);
		for (const file of logFiles) {
			if (!file.endsWith('.log')) continue;

			const filePath = path.join(projectDir, file);
			const fileStats = await fs.promises.stat(filePath);

			if (now - fileStats.mtimeMs > retentionMs) {
				await fs.promises.unlink(filePath);
				console.log(`[cleaner] Deleted old log file: ${projectId}/${file}`);
			}
		}
	}
}
