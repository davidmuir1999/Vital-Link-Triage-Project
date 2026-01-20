import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Seed...')
  
  // Cleanup
  await prisma.clinicalLog.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.bed.deleteMany()
  await prisma.ward.deleteMany()
  await prisma.user.deleteMany()

  // Create Wards
  const wards = [
    { name: 'Emergency Assessment (EAU)', type: 'Emergency', bedCount: 8 },
    { name: 'Cardiology (Ward 4)', type: 'Specialist', bedCount: 6 }
  ]

  for (const w of wards) {
    await prisma.ward.create({
      data: {
        name: w.name,
        type: w.type,
        beds: {
          create: Array.from({ length: w.bedCount }).map((_, i) => ({
            label: `Bed ${i + 1}`,
            status: 'AVAILABLE',
            version: 0
          }))
        }
      }
    })
  }
  console.log('✅ Seed Complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })