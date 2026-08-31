const { EncountersService } = require('./dist/modules/encounters/encounters.service');

async function test() {
  try {
    const queue = await EncountersService.getQueue();
    console.log('GET QUEUE RESULT:', queue.length, 'items');
    console.log(queue.slice(0, 5));
  } catch (err) {
    console.error('GET QUEUE ERROR:', err);
  }
}

test();
