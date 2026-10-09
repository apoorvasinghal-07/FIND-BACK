import { CampusItem, MatchScoreResult } from './types';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'and', 'or', 'my', 'is', 'it', 'was', 'lost', 'found', 'near', 'around', 'item', 'campus'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token));
}

function normalizeLocation(loc: string): string {
  const l = loc.toLowerCase();
  if (l.includes('library')) return 'library';
  if (l.includes('canteen') || l.includes('cafeteria') || l.includes('food court')) return 'canteen';
  if (l.includes('lab') || l.includes('laboratory') || l.includes('cse') || l.includes('ece')) return 'lab';
  if (l.includes('auditorium') || l.includes('audi') || l.includes('hall')) return 'auditorium';
  if (l.includes('sports') || l.includes('gym') || l.includes('ground') || l.includes('court')) return 'sports';
  if (l.includes('hostel') || l.includes('dorm') || l.includes('mess')) return 'hostel';
  if (l.includes('parking')) return 'parking';
  if (l.includes('admin') || l.includes('office')) return 'admin';
  return l.trim();
}

/**
 * Deterministic matching algorithm between a Lost report and a Found report.
 */
export function calculateMatchScore(lostItem: CampusItem, foundItem: CampusItem): MatchScoreResult {
  // Must compare a lost item with a found item
  if (lostItem.type !== 'lost' || foundItem.type !== 'found') {
    return {
      score: 0,
      eligible: false,
      matchedReasons: [],
      lostItem,
      foundItem
    };
  }

  let totalScore = 0;
  const reasons: string[] = [];

  // 1. Category Matching (Weight: up to 35 pts)
  if (lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
    totalScore += 35;
    reasons.push(`Category match: "${lostItem.category}"`);
  } else {
    // If categories are completely different and not "Other", matching is improbable
    if (lostItem.category !== 'Other' && foundItem.category !== 'Other') {
      return {
        score: 10,
        eligible: false,
        matchedReasons: ['Different category mismatch'],
        lostItem,
        foundItem
      };
    }
    totalScore += 5;
  }

  // 2. Title & Keyword Similarity (Weight: up to 25 pts)
  const lostTokens = new Set(tokenize(`${lostItem.title} ${lostItem.description}`));
  const foundTokens = new Set(tokenize(`${foundItem.title} ${foundItem.description}`));
  
  const commonTokens: string[] = [];
  lostTokens.forEach(token => {
    if (foundTokens.has(token)) {
      commonTokens.push(token);
    }
  });

  if (commonTokens.length > 0) {
    const similarityFraction = (2 * commonTokens.length) / (lostTokens.size + foundTokens.size);
    const keywordPoints = Math.min(25, Math.round(similarityFraction * 35) + (commonTokens.length * 3));
    totalScore += keywordPoints;
    const sampleKeywords = commonTokens.slice(0, 3).map(k => `"${k}"`).join(', ');
    reasons.push(`Shared keywords in description: ${sampleKeywords}`);
  }

  // 3. Brand Match (Weight: up to 12 pts)
  const lostBrand = (lostItem.brand || '').trim().toLowerCase();
  const foundBrand = (foundItem.brand || '').trim().toLowerCase();
  
  if (lostBrand && foundBrand) {
    if (lostBrand === foundBrand) {
      totalScore += 12;
      reasons.push(`Matching brand: "${lostItem.brand}"`);
    } else if (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
      totalScore += 9;
      reasons.push(`Similar brand reference: "${lostItem.brand}" / "${foundItem.brand}"`);
    }
  } else if (lostBrand && foundTokens.has(lostBrand)) {
    totalScore += 8;
    reasons.push(`Lost brand "${lostItem.brand}" noted in found item description`);
  } else if (foundBrand && lostTokens.has(foundBrand)) {
    totalScore += 8;
    reasons.push(`Found brand "${foundItem.brand}" noted in lost item description`);
  }

  // 4. Color Match (Weight: up to 10 pts)
  const lostColor = (lostItem.primaryColor || '').trim().toLowerCase();
  const foundColor = (foundItem.primaryColor || '').trim().toLowerCase();

  if (lostColor && foundColor) {
    if (lostColor === foundColor) {
      totalScore += 10;
      reasons.push(`Identical colour specified: "${lostItem.primaryColor}"`);
    } else if (lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
      totalScore += 7;
      reasons.push(`Compatible color description: "${lostItem.primaryColor}"`);
    }
  } else if (lostColor && foundTokens.has(lostColor)) {
    totalScore += 6;
    reasons.push(`Colour "${lostItem.primaryColor}" observed in report`);
  }

  // 5. Campus Location Match (Weight: up to 18 pts)
  const normLostLoc = normalizeLocation(lostItem.campusLocation);
  const normFoundLoc = normalizeLocation(foundItem.campusLocation);

  if (lostItem.campusLocation.toLowerCase().trim() === foundItem.campusLocation.toLowerCase().trim()) {
    totalScore += 18;
    reasons.push(`Exact campus location match: "${lostItem.campusLocation}"`);
  } else if (normLostLoc === normFoundLoc && normLostLoc.length > 2) {
    totalScore += 14;
    reasons.push(`Same campus zone: "${normLostLoc.toUpperCase()}" area`);
  }

  // 6. Date Proximity (Weight: up to 10 pts)
  try {
    const lostDate = new Date(lostItem.date).getTime();
    const foundDate = new Date(foundItem.date).getTime();
    const diffDays = Math.round((foundDate - lostDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      totalScore += 10;
      reasons.push(`Reported on the same calendar day (${lostItem.date})`);
    } else if (diffDays > 0 && diffDays <= 3) {
      totalScore += 8;
      reasons.push(`Found ${diffDays} day(s) following reported loss`);
    } else if (diffDays > 3 && diffDays <= 7) {
      totalScore += 5;
      reasons.push(`Found within a week of reported loss`);
    } else if (diffDays < 0 && diffDays >= -1) {
      // Minor date error by user (e.g., lost late at night, reported next day)
      totalScore += 3;
      reasons.push(`Timestamps within 24-hour margin`);
    }
  } catch {
    // Ignore date parse errors
  }

  // Cap score between 0 and 99% (100% only reserved for confirmed returned claims)
  const finalScore = Math.min(98, Math.max(0, totalScore));

  return {
    score: finalScore,
    eligible: finalScore >= 35,
    matchedReasons: reasons,
    lostItem,
    foundItem
  };
}
