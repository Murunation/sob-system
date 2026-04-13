import { PrismaClient, Role, StudentStatus, AttendanceStatus, MealStatus, ReviewStatus, FeedbackStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed эхэллээ...')

  const password = await bcrypt.hash('password123', 10)

  // ==========================================
  // ХЭРЭГЛЭГЧИД үүсгэх
  // ==========================================

  // Эрхлэгч
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin01' },
    update: {},
    create: {
      firstname: 'Сарнай',
      lastname: 'Батбаяр',
      phone: '99001100',
      email: 'admin@sob.mn',
      username: 'admin01',
      password,
      role: Role.ADMIN,
      admin: { create: {} }
    }
  })

  // Багш 1
  const teacherUser1 = await prisma.user.upsert({
    where: { username: 'teacher01' },
    update: {},
    create: {
      firstname: 'Номин',
      lastname: 'Дорж',
      phone: '99112233',
      email: 'teacher01@sob.mn',
      username: 'teacher01',
      password,
      role: Role.TEACHER,
      teacher: { create: { profession: 'Сургагч багш' } }
    }
  })

  // Багш 2
  const teacherUser2 = await prisma.user.upsert({
    where: { username: 'teacher02' },
    update: {},
    create: {
      firstname: 'Уянга',
      lastname: 'Гантулга',
      phone: '99223344',
      email: 'teacher02@sob.mn',
      username: 'teacher02',
      password,
      role: Role.TEACHER,
      teacher: { create: { profession: 'Сургагч багш' } }
    }
  })

  // Тогооч
  const chefUser = await prisma.user.upsert({
    where: { username: 'chef01' },
    update: {},
    create: {
      firstname: 'Болд',
      lastname: 'Нарантуяа',
      phone: '99334455',
      email: 'chef01@sob.mn',
      username: 'chef01',
      password,
      role: Role.CHEF,
      chef: { create: {} }
    }
  })

  // Асран хамгаалагч 1
  const parentUser1 = await prisma.user.upsert({
    where: { username: 'parent01' },
    update: {},
    create: {
      firstname: 'Энхбаяр',
      lastname: 'Цэрэн',
      phone: '99445566',
      email: 'parent01@sob.mn',
      username: 'parent01',
      password,
      role: Role.PARENT,
      parent: { create: { address: 'УБ, Баянзүрх дүүрэг' } }
    }
  })

  // Асран хамгаалагч 2
  const parentUser2 = await prisma.user.upsert({
    where: { username: 'parent02' },
    update: {},
    create: {
      firstname: 'Оюунцэцэг',
      lastname: 'Батмөнх',
      phone: '99556677',
      email: 'parent02@sob.mn',
      username: 'parent02',
      password,
      role: Role.PARENT,
      parent: { create: { address: 'УБ, Сүхбаатар дүүрэг' } }
    }
  })

  console.log('✅ Хэрэглэгчид үүслээ')

  // ==========================================
  // БАГШ, ЭЦЭГ ЭХ, ТОГООЧ object авах
  // ==========================================

  const teacher1 = await prisma.teacher.findUnique({ where: { userId: teacherUser1.id } })
  const teacher2 = await prisma.teacher.findUnique({ where: { userId: teacherUser2.id } })
  const chef = await prisma.chef.findUnique({ where: { userId: chefUser.id } })
  const parent1 = await prisma.parent.findUnique({ where: { userId: parentUser1.id } })
  const parent2 = await prisma.parent.findUnique({ where: { userId: parentUser2.id } })
  const admin = await prisma.admin.findUnique({ where: { userId: adminUser.id } })

  // ==========================================
  // БҮЛЭГ үүсгэх
  // ==========================================

  const group1 = await prisma.group.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Наран бүлэг',
      ageRange: '3-4 нас',
      capacity: 25,
      teacherId: teacher1!.id
    }
  })

  const group2 = await prisma.group.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Сар бүлэг',
      ageRange: '4-5 нас',
      capacity: 25,
      teacherId: teacher2!.id
    }
  })

  console.log('✅ Бүлгүүд үүслээ')

  // ==========================================
  // ХҮҮХЭД үүсгэх
  // ==========================================

  const student1 = await prisma.student.upsert({
    where: { id: 1 },
    update: {},
    create: {
      firstname: 'Тэмүүлэн',
      lastname: 'Цэрэн',
      birthDate: new Date('2021-05-12'),
      groupId: group1.id,
      parentId: parent1!.id,
      healthInfo: 'Самрын харшилтай',
      status: StudentStatus.ACTIVE
    }
  })

  const student2 = await prisma.student.upsert({
    where: { id: 2 },
    update: {},
    create: {
      firstname: 'Анужин',
      lastname: 'Цэрэн',
      birthDate: new Date('2020-08-20'),
      groupId: group1.id,
      parentId: parent1!.id,
      status: StudentStatus.ACTIVE
    }
  })

  const student3 = await prisma.student.upsert({
    where: { id: 3 },
    update: {},
    create: {
      firstname: 'Мөнхбат',
      lastname: 'Батмөнх',
      birthDate: new Date('2020-03-15'),
      groupId: group2.id,
      parentId: parent2!.id,
      status: StudentStatus.ACTIVE
    }
  })

  console.log('✅ Хүүхдүүд үүслээ')

  // ==========================================
  // ИРЦИЙН БҮРТГЭЛ
  // ==========================================

  await prisma.attendance.createMany({
    skipDuplicates: true,
    data: [
      {
        studentId: student1.id,
        teacherId: teacher1!.id,
        date: new Date('2026-03-23'),
        status: AttendanceStatus.PRESENT
      },
      {
        studentId: student2.id,
        teacherId: teacher1!.id,
        date: new Date('2026-03-23'),
        status: AttendanceStatus.SICK,
        note: 'Халуурсан'
      },
      {
        studentId: student3.id,
        teacherId: teacher2!.id,
        date: new Date('2026-03-23'),
        status: AttendanceStatus.PRESENT
      }
    ]
  })

  console.log('✅ Ирц үүслээ')

  // ==========================================
  // ХООЛНЫ ЦЭС
  // ==========================================

  const meal = await prisma.meal.create({
    data: {
      chefId: chef!.id,
      date: new Date('2026-03-23'),
      menu: 'Өглөө: Будаатай цай\nӨдөр: Шөл, тараг\nОрой: Жигнэмэг',
      ingredients: 'Будаа, сүү, мах, лууван, гурил',
      allergyFlag: true,
      servedStudents: 38,
      status: MealStatus.CONFIRMED
    }
  })

  console.log('✅ Хоолны цэс үүслээ')

  // ==========================================
  // ХӨГЖЛИЙН ҮНЭЛГЭЭ
  // ==========================================

  await prisma.review.create({
    data: {
      studentId: student1.id,
      teacherId: teacher1!.id,
      behavior: 'Тайван, найрсаг, нийтэч',
      development: 'Хэл ярианы ахиц сайтай, тоолох чадвар хөгжиж байна',
      note: 'Гэртээ ном уншуулах',
      status: ReviewStatus.SENT
    }
  })

  console.log('✅ Үнэлгээ үүслээ')

  // ==========================================
  // САНАЛ ХҮСЭЛТ
  // ==========================================

  await prisma.feedback.create({
    data: {
      parentId: parent1!.id,
      teacherId: teacher1!.id,
      message: 'Манай хүүхэд өчигдөр хоол идээгүй гэсэн, шалтгаан юу вэ?',
      status: FeedbackStatus.PENDING
    }
  })

  console.log('✅ Санал хүсэлт үүслээ')

  // ==========================================
  // ТӨЛБӨР
  // ==========================================

  await prisma.payment.create({
    data: {
      studentId: student1.id,
      parentId: parent1!.id,
      amount: 22000,
      date: new Date('2026-03-01'),
      dueDate: new Date('2026-03-10'),
      status: 'Төлсөн'
    }
  })

  console.log('✅ Төлбөр үүслээ')

  // ==========================================
  // ТАЙЛАН
  // ==========================================

  await prisma.report.create({
    data: {
      adminId: admin!.id,
      type: 'Ирцийн тайлан',
      dateRange: '2026.03.01-2026.03.23',
      status: 'SENT'
    }
  })

  console.log('✅ Тайлан үүслээ')
  console.log('🎉 Seed амжилттай дууслаа!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })