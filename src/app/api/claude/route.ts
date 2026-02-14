import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { AIFeature, ClaudeResponse } from '@/types/claude';

const execFileAsync = promisify(execFile);

// Build the prompt based on AI feature type
function buildPrompt(feature: AIFeature, payload: string): string {
  switch (feature) {
    case 'generate-description':
      return `You are a task management assistant. Generate a concise but helpful description (2-3 sentences in Japanese) for a task card titled: "${payload}". Focus on what the task might involve and potential steps. Return only the description text, no markdown formatting.`;

    case 'suggest-tasks':
      return `You are a task management assistant. Based on the following existing tasks, suggest 3 related new tasks that would be helpful (in Japanese). Format as a simple numbered list. Existing tasks:\n${payload}`;

    case 'summarize-board':
      return `You are a task management assistant. Summarize the current state of this KANBAN board concisely in Japanese (3-4 sentences). Highlight progress, bottlenecks, and priorities:\n${payload}`;

    default:
      return payload;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature, payload } = body as { feature: AIFeature; payload: string };

    if (!feature || !payload) {
      return NextResponse.json(
        { success: false, content: '', error: 'Missing feature or payload' } satisfies ClaudeResponse,
        { status: 400 }
      );
    }

    const prompt = buildPrompt(feature, payload);

    // Use execFile (not exec) to prevent command injection
    // claude CLI with -p flag for non-interactive mode
    const { stdout, stderr } = await execFileAsync('claude', ['-p', prompt], {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
      env: { ...process.env },
    });

    if (stderr && !stdout) {
      return NextResponse.json(
        { success: false, content: '', error: stderr.trim() } satisfies ClaudeResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: stdout.trim(),
    } satisfies ClaudeResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Check for common CLI errors
    if (message.includes('ENOENT')) {
      return NextResponse.json(
        {
          success: false,
          content: '',
          error: 'Claude CLI not found. Make sure Claude Code is installed and in PATH.',
        } satisfies ClaudeResponse,
        { status: 500 }
      );
    }

    if (message.includes('TIMEOUT') || message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          content: '',
          error: 'Claude CLI timed out. Please try again.',
        } satisfies ClaudeResponse,
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, content: '', error: message } satisfies ClaudeResponse,
      { status: 500 }
    );
  }
}
