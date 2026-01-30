import type { BuiltInAgentId } from '../types/prompt';
import type { TweakSuggestion, TweakDefinition } from '../types/tweaks';
import { ALL_TWEAKS, THINKING_TWEAKS } from '../constants/tweaks';

const MAX_SUGGESTIONS = 3;
const MIN_CONFIDENCE = 0.3;

interface SuggestionOptions {
  input: string;
  currentAgent?: BuiltInAgentId;
  maxSuggestions?: number;
}

/**
 * Analyze input text and suggest relevant tweaks based on keywords and context.
 */
export function suggestTweaks(options: SuggestionOptions): TweakSuggestion[] {
  const { input, currentAgent, maxSuggestions = MAX_SUGGESTIONS } = options;
  const lowerInput = input.toLowerCase();
  const scores: Map<string, { score: number; reasons: string[] }> = new Map();

  // Score each tweak based on keyword matches and agent relevance
  for (const tweak of ALL_TWEAKS) {
    let score = 0;
    const reasons: string[] = [];

    // Check trigger keywords
    if (tweak.triggerKeywords) {
      for (const keyword of tweak.triggerKeywords) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          score += 0.3;
          if (reasons.length === 0) {
            reasons.push(`Contains "${keyword}"`);
          }
        }
      }
    }

    // Bonus for agent relevance
    if (currentAgent && tweak.relevantAgents?.includes(currentAgent)) {
      score += 0.15;
      if (score > 0.3) {
        reasons.push(`Optimized for ${currentAgent}`);
      }
    }

    // Cap base score at 0.9 (never fully confident)
    score = Math.min(score, 0.9);

    if (score >= MIN_CONFIDENCE) {
      scores.set(tweak.id, { score, reasons });
    }
  }

  // Check for complexity indicators that suggest thinking modes
  const complexityIndicators = [
    { pattern: /complex|complicated|tricky/i, level: 'think', boost: 0.2 },
    { pattern: /difficult|challenging|hard problem/i, level: 'think-harder', boost: 0.25 },
    { pattern: /critical|mission.?critical|production|enterprise/i, level: 'ultrathink', boost: 0.3 },
    { pattern: /architect|redesign|major refactor/i, level: 'think-harder', boost: 0.2 },
  ];

  for (const indicator of complexityIndicators) {
    if (indicator.pattern.test(input)) {
      const existing = scores.get(indicator.level);
      const newScore = (existing?.score || 0) + indicator.boost;
      const reasons = existing?.reasons || [];
      if (reasons.length === 0) {
        reasons.push('Complex task detected');
      }
      scores.set(indicator.level, { score: Math.min(newScore, 0.9), reasons });
    }
  }

  // Convert to suggestions array and sort by score
  const suggestions: TweakSuggestion[] = [];

  for (const [tweakId, data] of scores) {
    suggestions.push({
      tweakId,
      confidence: data.score,
      reason: data.reasons[0] || 'Relevant to your input',
    });
  }

  // Sort by confidence, descending
  suggestions.sort((a, b) => b.confidence - a.confidence);

  // Return top N suggestions
  return suggestions.slice(0, maxSuggestions);
}

/**
 * Check if two tweaks conflict with each other.
 */
export function tweaksConflict(tweakIdA: string, tweakIdB: string): boolean {
  const tweakA = ALL_TWEAKS.find((t) => t.id === tweakIdA);
  const tweakB = ALL_TWEAKS.find((t) => t.id === tweakIdB);

  if (!tweakA || !tweakB) return false;

  return (
    tweakA.conflictsWith?.includes(tweakIdB) ||
    tweakB.conflictsWith?.includes(tweakIdA) ||
    false
  );
}

/**
 * Remove conflicting tweaks from a selection.
 * Returns a cleaned list with conflicts resolved (keeps the first one).
 */
export function resolveConflicts(tweakIds: string[]): string[] {
  const result: string[] = [];

  for (const id of tweakIds) {
    const hasConflict = result.some((existingId) => tweaksConflict(id, existingId));
    if (!hasConflict) {
      result.push(id);
    }
  }

  return result;
}

/**
 * Get tweaks that would conflict with a given tweak.
 */
export function getConflictingTweaks(tweakId: string): string[] {
  const tweak = ALL_TWEAKS.find((t) => t.id === tweakId);
  if (!tweak?.conflictsWith) return [];
  return tweak.conflictsWith;
}

/**
 * Calculate estimated token cost impact for selected tweaks.
 */
export function estimateTokenImpact(tweakIds: string[], thinkingLevel?: string): string {
  let minPercent = 0;
  let maxPercent = 0;

  // Calculate skill and behavior impact
  for (const id of tweakIds) {
    const tweak = ALL_TWEAKS.find((t) => t.id === id);
    if (!tweak) continue;

    switch (tweak.tokenCost) {
      case 'low':
        minPercent += 5;
        maxPercent += 10;
        break;
      case 'medium':
        minPercent += 15;
        maxPercent += 25;
        break;
      case 'high':
        minPercent += 50;
        maxPercent += 75;
        break;
      case 'very-high':
        minPercent += 100;
        maxPercent += 150;
        break;
    }
  }

  // Add thinking mode impact
  if (thinkingLevel) {
    const thinkingTweak = THINKING_TWEAKS.find((t) => t.id === thinkingLevel);
    if (thinkingTweak) {
      switch (thinkingTweak.tokenCost) {
        case 'medium':
          minPercent += 30;
          maxPercent += 50;
          break;
        case 'high':
          minPercent += 100;
          maxPercent += 150;
          break;
        case 'very-high':
          minPercent += 200;
          maxPercent += 300;
          break;
      }
    }
  }

  if (minPercent === 0 && maxPercent === 0) {
    return 'No additional cost';
  }

  return `+${minPercent}-${maxPercent}% tokens`;
}
