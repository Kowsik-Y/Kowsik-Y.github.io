export function getWordCount(content: string) {
    const normalized = content.trim();
    if (!normalized) return 0;
    return normalized.split(/\s+/).length;
}

export function getReadingTimeMinutes(content: string, wordsPerMinute = 200) {
    const words = getWordCount(content);
    if (words === 0) return 1;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}
