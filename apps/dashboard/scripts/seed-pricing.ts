import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete existing pricing data
  await prisma.pricing.deleteMany({})

  // OpenAI pricing
  await prisma.pricing.create({
    data: {
      provider: 'openai',
      model: 'gpt-4',
      inputCostPer1k: 0.03,
      outputCostPer1k: 0.06,
    },
  })

  await prisma.pricing.create({
    data: {
      provider: 'openai',
      model: 'gpt-4-turbo',
      inputCostPer1k: 0.01,
      outputCostPer1k: 0.03,
    },
  })

  // Anthropic pricing
  await prisma.pricing.create({
    data: {
      provider: 'anthropic',
      model: 'claude-sonnet-4',
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.015,
    },
  })

  console.log('✅ Pricing data seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })