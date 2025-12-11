import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Define the validation schema
const IngestRequestSchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  latencyMs: z.number().int().min(0),
  status: z.string(),
  errorMessage: z.string().optional(),
  tags: z.record(z.string(), z.any()).optional(), // JSON object with string keys object
})

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');
  
  const body = await request.json();
  
  // Validate the request body
  const validation = IngestRequestSchema.safeParse(body);
  if (!validation.success) {
    return Response.json(
      { error: 'Validation failed', details: validation.error },
      { status: 400 }
    );
  }
  
  const validatedData = validation.data;
  
  const project = await prisma.project.findUnique({
    where: { apiKey: apiKey }
  });
  
  if (!project) {
    return Response.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  // Look up pricing for this provider/model
  const pricing = await prisma.pricing.findFirst({
    where: {
      provider: validatedData.provider,
      model: validatedData.model,
    }
  });

// Calculate cost or use 0 if pricing not found
const cost = pricing
  ? (validatedData.inputTokens / 1000 * pricing.inputCostPer1k) +
    (validatedData.outputTokens / 1000 * pricing.outputCostPer1k)
  : 0;
  
  const savedRequest = await prisma.request.create({
    data: {
      projectId: project.id,
      provider: validatedData.provider,
      model: validatedData.model,
      inputTokens: validatedData.inputTokens,
      outputTokens: validatedData.outputTokens,
      cost: cost,
      latencyMs: validatedData.latencyMs,
      status: validatedData.status,
      errorMessage: validatedData.errorMessage,
      tags: validatedData.tags,
    }
  });
  
  return Response.json({ 
    success: true,
    requestId: savedRequest.id 
  });
}