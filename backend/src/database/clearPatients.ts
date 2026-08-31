import { dbPool } from './postgres';
import { logger } from '../middleware/logger';

async function clearPatients() {
  logger.info('Starting patient and clinical data truncation...');
  try {
    const client = await dbPool.connect();
    try {
      await client.query('BEGIN');

      // Truncate all clinical, encounter, and patient tables
      await client.query(`
        TRUNCATE TABLE 
          session_answers,
          clinical_sessions,
          symptoms,
          medications,
          allergies,
          investigations,
          clinical_facts,
          document_extractions,
          documents,
          red_flag_events,
          timeline_events,
          physician_reviews,
          clinical_summaries,
          fhir_exports,
          consents,
          encounters,
          patients
        CASCADE;
      `);

      await client.query('COMMIT');
      console.log('✅ Successfully truncated all patient and clinical records from PostgreSQL.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Failed to truncate patient records:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ DB connection error:', error);
  } finally {
    await dbPool.end();
  }
}

clearPatients()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
