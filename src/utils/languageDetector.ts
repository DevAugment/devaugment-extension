export function detectLanguage(fileName: string, languageId: string): string {
    if (languageId) return languageId;

    const ext = fileName.split(".").pop();
    return ext || "text";
}
