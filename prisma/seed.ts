import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const _dbUrl = process.env.DATABASE_URL;
if (!_dbUrl || _dbUrl.includes("Concrete45Stron")) {
  console.error(
    "Please set a valid DATABASE_URL in .env before running the seed script."
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const now = new Date();
const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

async function main() {
  const users = await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `user-${i + 1}`;
      return prisma.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          emailVerified: i % 2 === 0,
          passwordHash: `hash-${i + 1}`,
        },
      });
    })
  );

  const clients = await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `client-${i + 1}`;
      return prisma.client.upsert({
        where: { id },
        update: {},
        create: {
          id,
          firstName: `Client${i + 1}`,
          lastName: `Lastname${i + 1}`,
          telephone: `+15550000${i + 1}`,
          address: `Street ${i + 1}`,
          status: i % 2 === 0 ? "PROSPECT" : "PATIENT",
          attachmentId: `attachment-${i + 1}`,
        },
      });
    })
  );

  const clinics = await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `clinic-${i + 1}`;
      return prisma.clinic.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: `Clinic ${i + 1}`,
          desc: `Clinic description ${i + 1}`,
          attachmentId: `attachment-${i + 1}`,
        },
      });
    })
  );

  const doctors = await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `doctor-${i + 1}`;
      return prisma.doctor.upsert({
        where: { id },
        update: {},
        create: {
          id,
          firstName: `Doctor${i + 1}`,
          lastName: `Lastname${i + 1}`,
          email: `doctor${i + 1}@example.com`,
          clinic: { connect: { id: clinics[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `appointment-${i + 1}`;
      return prisma.appointment.upsert({
        where: { id },
        update: {},
        create: {
          id,
          setTime: addDays(i + 1),
          status: "UNFILL",
          client: { connect: { id: clients[i].id } },
          clinic: { connect: { id: clinics[i].id } },
          doctor: { connect: { id: doctors[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `attachment-${i + 1}`;
      return prisma.attachment.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: `Attachment ${i + 1}`,
          attachmentTpe: i === 1 ? "ADMIN" : i === 3 ? "DOCTOR" : "CLIENT",
        },
      });
    })
  );

  const blogAttachments = await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `attachment-blog-${i + 1}`;
      return prisma.attachment.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: `Blog Attachment ${i + 1}`,
          attachmentTpe: "BLOG",
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `blog-${i + 1}`;
      return prisma.blog.upsert({
        where: { id },
        update: {},
        create: {
          id,
          title: `Blog Post ${i + 1}`,
          tags: i % 2 === 0 ? "Dental, Wellness" : "Family Care, Prevention",
          content:
            "Datima Specialist Clinics shares practical healthcare guidance to help patients make informed choices. This sample blog entry outlines why routine checkups, early screening, and consistent follow-ups support long-term wellbeing. It highlights the importance of lifestyle habits, medication adherence, and knowing when to seek specialist input. Patients are encouraged to ask questions, track symptoms, and schedule appointments when changes appear. Our multidisciplinary team works together to offer clear explanations, collaborative treatment plans, and compassionate care. This placeholder content keeps seed data within the database length limits while demonstrating typical blog formatting and tone.",
          author: { connect: { id: users[i].id } },
          attachment: { connect: { id: blogAttachments[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `session-${i + 1}`;
      return prisma.session.upsert({
        where: { id },
        update: {},
        create: {
          id,
          expiresAt: addDays(7 + i),
          user: { connect: { id: users[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const tokenHash = `token-hash-${i + 1}`;
      return prisma.passwordResetToken.upsert({
        where: { tokenHash },
        update: {},
        create: {
          tokenHash,
          expiresAt: addDays(2 + i),
          user: { connect: { id: users[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `email-token-${i + 1}`;
      return prisma.emailVerificationToken.upsert({
        where: { id },
        update: {},
        create: {
          id,
          code: `code-${i + 1}`,
          expiresAt: addDays(3 + i),
          email: users[i].email,
          user: { connect: { id: users[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `clinic-schedule-${i + 1}`;
      return prisma.clinicSchedule.upsert({
        where: { id },
        update: {},
        create: {
          id,
          days: "Mon-Fri",
          openTime: "08:00am",
          closeTime: "05:00pm",
          clinic: { connect: { id: clinics[i].id } },
          doctor: { connect: { id: doctors[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `doctor-schedule-${i + 1}`;
      return prisma.doctorSchedule.upsert({
        where: { id },
        update: {},
        create: {
          id,
          day: "Monday",
          startTime: "09:00am",
          endTime: "04:00pm",
          doctor: { connect: { id: doctors[i].id } },
          clinic: { connect: { id: clinics[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `testimonial-${i + 1}`;
      return prisma.testimonial.upsert({
        where: { id },
        update: {},
        create: {
          id,
          client: { connect: { id: clients[i].id } },
          content: `Testimonial content ${i + 1}`,
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `message-${i + 1}`;
      return prisma.message.upsert({
        where: { id },
        update: {},
        create: {
          id,
          content: `Message content ${i + 1}`,
          client: { connect: { id: clients[i].id } },
        },
      });
    })
  );

  await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const id = `campaign-${i + 1}`;
      return prisma.campaigns.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: `Campaign ${i + 1}`,
          catchphrase: `Catchphrase ${i + 1}`,
          startDate: addDays(i),
          endDate: addDays(i + 30),
        },
      });
    })
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
