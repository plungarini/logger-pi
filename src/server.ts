import Fastify from 'fastify';
import { startCleaner } from './cleaner.js';
import { AsyncLogWriter, LogPayload } from './writer.js';

const fastify = Fastify({ logger: false });
const writer = new AsyncLogWriter();

fastify.post('/logs', async (request, reply) => {
	const payload = request.body as LogPayload;

	if (!payload || !payload.projectId || !Array.isArray(payload.logs)) {
		return reply.code(400).send({ error: 'Invalid log payload ' });
	}

	// Fire and forget
	writer.writeBatch(payload).catch((err) => {
		console.error('[logger-pi] Failed to write logs safely to disk:', err);
	});

	return reply.code(202).send({ queued: true });
});

const PORT = 4000;

async function start() {
	try {
		startCleaner();
		await fastify.listen({ port: PORT, host: '0.0.0.0' });
		console.log(`[logger-pi] Server listening on port ${PORT}`);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

start();
