import type { AIFeature, ClaudeResponse } from '@/types/claude';

// Client-side function to call the Claude API route
export async function callClaude(
  feature: AIFeature,
  payload: string
): Promise<ClaudeResponse> {
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature, payload }),
    });

    const data: ClaudeResponse = await response.json();
    return data;
  } catch {
    return {
      success: false,
      content: '',
      error: 'Failed to connect to Claude API. Please check your network.',
    };
  }
}
