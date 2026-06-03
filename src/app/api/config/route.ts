import { readConfig } from '@/lib/sheets';

export const revalidate = 600;

export async function GET() {
  try {
    const config = await readConfig();
    return Response.json(config);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to load config' },
      { status: 500 },
    );
  }
}
