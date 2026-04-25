// 가챠 추첨 로직
import { BADGES, RARITY_CONFIG, getBadgesByRarity } from '../data/badges';

/**
 * 1회 추첨
 * 1. 레어도 추첨 (rate 가중치)
 * 2. 해당 레어도 안에서 랜덤 캔뱃지
 */
export function rollOnce() {
  const r = Math.random();
  
  // 레어도 결정 (UR → レア → ノーマル 순서로 체크)
  let rarity = 'normal';
  let cumulative = 0;
  
  // UR 체크
  cumulative += RARITY_CONFIG.ur.rate;
  if (r < cumulative) {
    rarity = 'ur';
  } else {
    cumulative += RARITY_CONFIG.rare.rate;
    if (r < cumulative) {
      rarity = 'rare';
    } else {
      rarity = 'normal';
    }
  }
  
  // 해당 레어도의 캔뱃지 풀에서 랜덤
  const candidates = getBadgesByRarity(rarity);
  
  // 풀에 캔뱃지가 없으면 (예: UR 캔뱃지가 아직 없을때) ノーマル로 폴백
  if (candidates.length === 0) {
    const normals = getBadgesByRarity('normal');
    return normals[Math.floor(Math.random() * normals.length)];
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 10연 추첨
 * - 10연 안에 レア 이상이 1장도 없으면 마지막 1장을 レア로 보장
 */
export function rollTen() {
  const results = [];
  let hasRareOrAbove = false;
  
  for (let i = 0; i < 10; i++) {
    const badge = rollOnce();
    results.push(badge);
    if (badge.rarity !== 'normal') hasRareOrAbove = true;
  }
  
  // レア 이상 보장
  if (!hasRareOrAbove) {
    const rares = getBadgesByRarity('rare');
    if (rares.length > 0) {
      results[9] = rares[Math.floor(Math.random() * rares.length)];
    }
  }
  
  return results;
}

/**
 * 가챠 결과를 처리
 * - 신규/중복 분류
 * - 중복은 자동 포인트 환원
 * @param {Array} results - 추첨된 캔뱃지 배열
 * @param {Object} currentBadges - 현재 보유 캔뱃지 ({ badgeId: { count, ... } })
 * @returns {Object} { newBadges, duplicates, refundPoints, updatedBadges }
 */
export function processGachaResults(results, currentBadges = {}) {
  const newBadges = [];
  const duplicates = [];
  let refundPoints = 0;
  const updatedBadges = { ...currentBadges };
  
  for (const badge of results) {
    const isNew = !updatedBadges[badge.id];
    
    if (isNew) {
      newBadges.push(badge);
      updatedBadges[badge.id] = {
        count: 1,
        firstAcquiredAt: Date.now(),
      };
    } else {
      duplicates.push(badge);
      const refund = RARITY_CONFIG[badge.rarity].refundPoints;
      refundPoints += refund;
      updatedBadges[badge.id] = {
        ...updatedBadges[badge.id],
        count: updatedBadges[badge.id].count + 1,
      };
    }
  }
  
  return {
    newBadges,
    duplicates,
    refundPoints,
    updatedBadges,
  };
}

/**
 * 하루가 지났는지 확인 (무료 가챠/일일 보너스용)
 * @param {number} lastTimestamp - 마지막 사용 timestamp
 * @returns {boolean}
 */
export function isNewDay(lastTimestamp) {
  if (!lastTimestamp) return true;
  
  const last = new Date(lastTimestamp);
  const now = new Date();
  
  return (
    last.getFullYear() !== now.getFullYear() ||
    last.getMonth() !== now.getMonth() ||
    last.getDate() !== now.getDate()
  );
}
