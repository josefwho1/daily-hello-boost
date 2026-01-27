import { useMemo } from 'react';
import { compareTwoStrings } from 'string-similarity';
import { HelloLog } from './useHelloLogs';
import { useTimezone } from './useTimezone';

export interface PotentialDuplicate {
  existingLog: HelloLog;
  similarity: number;
}

const SIMILARITY_THRESHOLD = 0.7; // 70% match threshold

/**
 * Normalizes a name for comparison by:
 * - Converting to lowercase
 * - Removing extra whitespace
 * - Removing common titles/prefixes
 */
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(mr\.?|mrs\.?|ms\.?|dr\.?|prof\.?)\s*/i, '');
};

export const useDuplicateDetection = (logs: HelloLog[]) => {
  const { formatTimestamp } = useTimezone();

  // Create a map of normalized names to their logs for quick lookup
  const namedLogs = useMemo(() => {
    return logs.filter(log => log.name && log.name.trim() !== '');
  }, [logs]);

  /**
   * Finds potential duplicate entries for a given name
   * Returns the best match if similarity is above threshold
   */
  const findDuplicate = (newName: string): PotentialDuplicate | null => {
    if (!newName || newName.trim() === '') return null;

    const normalizedNewName = normalizeName(newName);
    if (normalizedNewName.length < 2) return null; // Too short to match reliably

    let bestMatch: PotentialDuplicate | null = null;

    for (const log of namedLogs) {
      if (!log.name) continue;
      
      const normalizedExistingName = normalizeName(log.name);
      const similarity = compareTwoStrings(normalizedNewName, normalizedExistingName);

      if (similarity >= SIMILARITY_THRESHOLD) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = { existingLog: log, similarity };
        }
      }
    }

    return bestMatch;
  };

  /**
   * Gets a formatted description of when/where the person was met
   */
  const getDuplicateDescription = (log: HelloLog): string => {
    const parts: string[] = [];
    
    if (log.location) {
      parts.push(`at ${log.location}`);
    }
    
    parts.push(`on ${formatTimestamp(log.created_at, false)}`);
    
    return parts.join(' ');
  };

  return {
    findDuplicate,
    getDuplicateDescription,
  };
};
