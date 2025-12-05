export function cleanGeneratedComment(output: string): string {
    if (!output) return "";

    let cleaned = output.trim();

    // Remove Markdown code fences: ```ts ... ```
    cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
        // Extract inside the block
        const inner = match.replace(/```[a-zA-Z]*/g, "").replace(/```/g, "");
        return inner.trim();
    });

    // Remove any lingering ``` or backticks
    cleaned = cleaned.replace(/```/g, "");

    // Remove > style quoting if model returns it
    cleaned = cleaned.replace(/^>\s?/gm, "");

    // Remove duplicated code lines (heuristic)
    // Remove imports, function declarations, or code (not part of comments)
    cleaned = cleaned.replace(/^\s*(import .*|export .*|class .*|function .*|\w+\(.*\)\s*\{).*$/gm, "");

    return cleaned.trim();
}
