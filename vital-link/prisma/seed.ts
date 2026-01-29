import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Infrastructure Seed (Staff & Wards)...')

  // 1. Clean the database
  // Deleting in this order prevents foreign key constraints errors
  await prisma.clinicalLog.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.bed.deleteMany()
  await prisma.ward.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Database cleaned.')

  const passwordHash = await hash('password', 12)

  // 2. Create Staff (One for each Role)
  const staff = [
    { email: 'nurse@nhs.net', name: 'Nurse Muir', role: Role.TRIAGE_NURSE },
    { email: 'doctor@nhs.net', name: 'Dr. Meikle', role: Role.DOCTOR },
    { email: 'manager@nhs.net', name: 'Michael Scott', role: Role.SITE_MANAGER },
    { email: 'cleaner@nhs.net', name: 'Barry Scott', role: Role.CLEANER },
    { email: 'admin@nhs.net', name: 'Pam Beasley', role: Role.ADMIN },
  ]

  for (const s of staff) {
    await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        role: s.role,
        password: passwordHash,
      }
    })
  }
  console.log(`👤 Created ${staff.length} Staff Members.`)

  // 3. Create Wards & Generate Beds
  const wards = [
    { name: 'Emergency Assessment (EAU)', type: 'Emergency', bedCount: 10 },
    { name: 'Cardiology (Ward 4)', type: 'Specialist', bedCount: 8 },
    { name: 'General Surgery (Ward 10)', type: 'General', bedCount: 12 },
    { name: 'Paediatrics (Rainbow Ward)', type: 'Paediatrics', bedCount: 6 },
    { name: 'Intensive Care (ICU)', type: 'ICU', bedCount: 4 }
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
    console.log(`🏥 Created ${w.name} with ${w.bedCount} beds`)
  }

  console.log('✅ Infrastructure Ready!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })