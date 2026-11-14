import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeItems, normalizeMatches, getSafeImageList } from './safeData.js';

test('normalizeItems adds safe defaults for incomplete item data', () => {
  const result = normalizeItems([
    {
      id: 'itm_1',
      type: 'found',
      title: ' ',
      description: '',
      location: null,
      status: undefined,
    },
  ]);

  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Untitled Item');
  assert.equal(result[0].status, 'active');
  assert.equal(typeof result[0].images[0], 'string');
  assert.equal(result[0].category, 'Other');
});

test('normalizeItems leaves valid item data intact', () => {
  const result = normalizeItems([
    {
      id: 'itm_2',
      type: 'lost',
      title: 'Calculator',
      description: 'Used in lab',
      category: 'Electronics',
      status: 'matched',
      images: ['https://example.com/img.png'],
      aiTags: ['Calculator'],
      rekognitionConfidence: 96,
    },
  ]);

  assert.equal(result[0].title, 'Calculator');
  assert.deepEqual(result[0].images, ['https://example.com/img.png']);
  assert.equal(result[0].rekognitionConfidence, 96);
});

test('normalizeMatches prevents undefined images and aiComparison errors', () => {
  const rawMatches = [
    {
      id: 'mtc_test',
      lostItem: {
        id: 'lost_1',
        title: 'Lost Keys',
        image: 'https://example.com/key.jpg', // Singular image, no images array
      },
      foundItem: {
        id: 'found_1',
        title: 'Found Keys',
        // Neither image nor images
      },
      // Missing aiComparison
    },
  ];

  const result = normalizeMatches(rawMatches);
  assert.equal(result.length, 1);
  assert.equal(Array.isArray(result[0].lostItem.images), true);
  assert.equal(result[0].lostItem.images[0], 'https://example.com/key.jpg');
  assert.equal(Array.isArray(result[0].foundItem.images), true);
  assert.equal(typeof result[0].aiComparison.rekognitionInsights, 'string');
  assert.equal(typeof result[0].aiComparison.locationDistanceKm, 'number');
  assert.equal(typeof result[0].aiComparison.timeDifferenceHours, 'number');
});
