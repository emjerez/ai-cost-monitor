import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  
  const body = await request.json();
  
  const project = await prisma.project.findUnique({
    where: { apiKey: apiKey }
  });
  
  if (!project) {
    return Response.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
  
  // TODO: Calculate cost (we'll do this next)
  const cost = 0.0001; // placeholder
  
  // Create the request record
  const savedRequest = await prisma.request.create({
    data: {
      projectId: project.id,
      provider: body.provider,
      model: body.model,
      inputTokens: body.inputTokens,
      outputTokens: body.outputTokens,
      cost: cost,
      latencyMs: body.latencyMs,
      status: body.status || 'success',
      errorMessage: body.errorMessage,
      tags: body.tags,
    }
  });
  
  return Response.json({ 
    success: true,
    requestId: savedRequest.id 
  });
}