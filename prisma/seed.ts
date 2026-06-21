import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash("123456", 12)

  // ─── Board ───
  const board = await prisma.board.upsert({
    where: { code: "GCB" },
    update: {},
    create: {
      name: "Gazipur Cantonment Board",
      code: "GCB",
      address: "Gazipur Cantonment, Dhaka, Bangladesh",
    },
  })

  // ─── Users ───
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@erp.com" },
    update: {},
    create: {
      email: "admin@erp.com",
      password,
      fullName: "Super Admin",
      role: UserRole.SUPER_ADMIN,
    },
  })

  const ceo = await prisma.user.upsert({
    where: { email: "ceo@gcb.gov.bd" },
    update: {},
    create: {
      boardId: board.id,
      email: "ceo@gcb.gov.bd",
      password,
      fullName: "Chief Executive Officer",
      role: UserRole.CEO,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: "manager@gcb.gov.bd" },
    update: {},
    create: {
      boardId: board.id,
      email: "manager@gcb.gov.bd",
      password,
      fullName: "Property Manager",
      role: UserRole.MANAGER,
    },
  })

  const financeOfficer = await prisma.user.upsert({
    where: { email: "finance@gcb.gov.bd" },
    update: {},
    create: {
      boardId: board.id,
      email: "finance@gcb.gov.bd",
      password,
      fullName: "Finance Officer",
      role: UserRole.FINANCE_OFFICER,
    },
  })

  const tenantUser = await prisma.user.upsert({
    where: { email: "user@gcb.gov.bd" },
    update: {},
    create: {
      boardId: board.id,
      email: "user@gcb.gov.bd",
      password,
      fullName: "Abdul Karim",
      phone: "01712345678",
      nidNumber: "1234567890",
      address: "Gazipur Sadar, Dhaka",
      role: UserRole.USER,
    },
  })

  // ─── Properties ───
  const shopProperty = await prisma.property.create({
    data: {
      boardId: board.id,
      code: "SHOP-001",
      name: "Main Market Complex",
      category: "SHOP",
      address: "Board Bazar, Gazipur",
      status: "ACTIVE",
      createdBy: manager.id,
    },
  })

  const landProperty = await prisma.property.create({
    data: {
      boardId: board.id,
      code: "LAND-001",
      name: "Cantonment Residential Plot A",
      category: "LAND",
      address: "Cantonment Road, Sector 3",
      status: "ACTIVE",
      createdBy: manager.id,
    },
  })

  const houseProperty = await prisma.property.create({
    data: {
      boardId: board.id,
      code: "HOUSE-001",
      name: "Officers Colony Building A",
      category: "HOUSE",
      address: "Cantonment Residential Area",
      status: "ACTIVE",
      createdBy: manager.id,
    },
  })

  // ─── Units ───
  const shopUnits = [
    { unitNumber: "S-01", floor: "Ground", unitType: "Shop", monthlyRent: 15000, size: 400 },
    { unitNumber: "S-02", floor: "Ground", unitType: "Shop", monthlyRent: 12000, size: 350 },
    { unitNumber: "S-03", floor: "1st", unitType: "Shop", monthlyRent: 10000, size: 300 },
  ]
  for (const u of shopUnits) {
    const exists = await prisma.unit.findFirst({
      where: { propertyId: shopProperty.id, unitNumber: u.unitNumber },
    })
    if (!exists) {
      await prisma.unit.create({
        data: { ...u, propertyId: shopProperty.id, status: "VACANT", createdBy: manager.id },
      })
    }
  }

  const landUnits = [
    { unitNumber: "PLOT-A1", monthlyRent: 5000, size: 1200 },
    { unitNumber: "PLOT-A2", monthlyRent: 4500, size: 1000 },
  ]
  for (const u of landUnits) {
    const exists = await prisma.unit.findFirst({
      where: { propertyId: landProperty.id, unitNumber: u.unitNumber },
    })
    if (!exists) {
      await prisma.unit.create({
        data: { ...u, propertyId: landProperty.id, unitType: "Land Plot", status: "VACANT", createdBy: manager.id },
      })
    }
  }

  const houseUnits = [
    { unitNumber: "A-101", floor: "1st", unitType: "Flat", monthlyRent: 25000, size: 1200 },
    { unitNumber: "A-102", floor: "1st", unitType: "Flat", monthlyRent: 22000, size: 1000 },
  ]
  for (const u of houseUnits) {
    const exists = await prisma.unit.findFirst({
      where: { propertyId: houseProperty.id, unitNumber: u.unitNumber },
    })
    if (!exists) {
      await prisma.unit.create({
        data: { ...u, propertyId: houseProperty.id, status: "VACANT", createdBy: manager.id },
      })
    }
  }

  // ─── Second Board (demo multi-tenant) ───
  const board2 = await prisma.board.upsert({
    where: { code: "DCB" },
    update: {},
    create: {
      name: "Dhaka Cantonment Board",
      code: "DCB",
      address: "Dhaka Cantonment, Dhaka, Bangladesh",
    },
  })

  await prisma.user.upsert({
    where: { email: "ceo@dcb.gov.bd" },
    update: {},
    create: { boardId: board2.id, email: "ceo@dcb.gov.bd", password, fullName: "DCB CEO", role: "CEO" },
  })

  await prisma.user.upsert({
    where: { email: "manager@dcb.gov.bd" },
    update: {},
    create: { boardId: board2.id, email: "manager@dcb.gov.bd", password, fullName: "DCB Manager", role: "MANAGER" },
  })

  await prisma.property.create({
    data: { boardId: board2.id, code: "MKT-001", name: "Kawran Bazar Market", category: "MARKET", address: "Kawran Bazar, Dhaka", status: "ACTIVE", createdBy: superAdmin.id },
  })

  console.log("✅ Seed completed successfully")
  console.log("")
  console.log("── Login Credentials ──")
  console.log("Super Admin:     admin@erp.com / 123456")
  console.log("")
  console.log("── Board 1: Gazipur Cantonment Board (GCB) ──")
  console.log("CEO:             ceo@gcb.gov.bd / 123456")
  console.log("Manager:         manager@gcb.gov.bd / 123456")
  console.log("Finance:         finance@gcb.gov.bd / 123456")
  console.log("User:            user@gcb.gov.bd / 123456")
  console.log("")
  console.log("── Board 2: Dhaka Cantonment Board (DCB) ──")
  console.log("CEO:             ceo@dcb.gov.bd / 123456")
  console.log("Manager:         manager@dcb.gov.bd / 123456")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
