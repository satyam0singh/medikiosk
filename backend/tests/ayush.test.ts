import { AyushService } from '../src/modules/ayush/ayush.service';
import * as postgresModule from '../src/database/postgres';

describe('AYUSH Prakriti & Clinical Assessment Engine', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should compute Vata-Pitta dominant Prakriti and record clinical fact with provenance', async () => {
    jest.spyOn(postgresModule, 'query').mockResolvedValue({
      rows: [],
      rowCount: 1,
      command: 'INSERT',
      oid: 0,
      fields: [],
    });

    const assessment = await AyushService.assessPrakriti({
      encounterId: 'c0000000-0000-0000-0000-000000000002',
      patientId: 'b0000000-0000-0000-0000-000000000002',
      vataAnswers: 6,
      pittaAnswers: 4,
      kaphaAnswers: 1,
      agniType: 'VISHAMA',
      dietaryHabits: 'Irregular food timings, spicy food',
      sleepPattern: 'Light sleep, difficulty falling asleep',
      bowelHabits: 'Constipated',
    });

    expect(assessment.prakriti?.dominantPrakriti).toBe('VATA');
    expect(assessment.prakriti?.vataScore).toBeGreaterThan(50);
    expect(assessment.dashavidha?.anala).toBe('VISHAMA');
    expect(assessment.vikriti?.doshaImbalance).toContain('Vata Vriddhi');
  });
});
