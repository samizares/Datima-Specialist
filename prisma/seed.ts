import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import {
  categories,
  popularTags,
  posts as blogPosts,
} from "../src/features/blog/content";
import { hashPassword } from "../src/features/password/utils/hash-and-verify";

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
  const adminPasswordHash = await hashPassword("adminadmin");
  const adminUser = await prisma.user.upsert({
    where: { id: "user-admin" },
    update: {
      username: "admin",
      email: "admin@datimaspecialistclinics.com",
      emailVerified: true,
      isAdmin: true,
      isSuperAdmin: true,
      passwordHash: adminPasswordHash,
    },
    create: {
      id: "user-admin",
      username: "admin",
      email: "admin@datimaspecialistclinics.com",
      emailVerified: true,
      isAdmin: true,
      isSuperAdmin: true,
      createdAt: now,
      updatedAt: now,
      passwordHash: adminPasswordHash,
    },
  });

  const managerPasswordHash = await hashPassword("manager");
  await prisma.user.upsert({
    where: { id: "user-manager" },
    update: {
      username: "manager",
      email: "manager@datimaspecialistclinics.com",
      emailVerified: true,
      isAdmin: true,
      isSuperAdmin: false,
      passwordHash: managerPasswordHash,
    },
    create: {
      id: "user-manager",
      username: "manager",
      email: "manager@datimaspecialistclinics.com",
      emailVerified: true,
      isAdmin: true,
      isSuperAdmin: false,
      createdAt: now,
      updatedAt: now,
      passwordHash: managerPasswordHash,
    },
  });

  const users = await Promise.all(
    Array.from({ length: 4 }, async (_, i) => {
      const id = `user-${i + 1}`;
      const passwordHash = await hashPassword(`user${i + 1}`);
      return prisma.user.upsert({
        where: { id },
        update: {},
        create: {
          id,
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          emailVerified: i % 2 === 0,
          isAdmin: false,
          isSuperAdmin: false,
          createdAt: now,
          updatedAt: now,
          passwordHash,
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
          createdAt: now,
          updatedAt: now,
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
          createdAt: now,
          updatedAt: now,
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
          createdAt: now,
          updatedAt: now,
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
          setDay: addDays(i + 1),
          setTime: "09:00",
          status: "UNFILL",
          client: { connect: { id: clients[i].id } },
          clinic: { connect: { id: clinics[i].id } },
          doctor: { connect: { id: doctors[i].id } },
          createdAt: now,
          updatedAt: now,
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
          attachmentType: i === 1 ? "ADMIN" : i === 3 ? "DOCTOR" : "CLIENT",
          createdAt: now,
          updatedAt: now,
        },
      });
    })
  );

  const blogAttachments = await Promise.all(
    blogPosts.map((post) => {
      const id = `attachment-blog-${post.id}`;
      const imageName = post.image.split("/").pop() || post.title;
      return prisma.attachment.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name: imageName,
          attachmentType: "BLOG",
        },
      });
    })
  );

  await Promise.all(
    blogPosts.map((post, index) => {
      const categoryTag = categories[index % categories.length]?.label;
      const popularTag = popularTags[index % popularTags.length];
      const tags = Array.from(
        new Set([...(post.tags || []), categoryTag, popularTag].filter(Boolean))
      ).join(", ");

      const author = users[index % users.length] ?? adminUser;
      return prisma.blog.upsert({
        where: { id: post.id },
        update: {
          title: post.title,
          tags,
          content: post.content,
          author: { connect: { id: author.id } },
          attachment: { connect: { id: blogAttachments[index].id } },
        },
        create: {
          id: post.id,
          title: post.title,
          tags,
          content: post.content,
          author: { connect: { id: author.id } },
          attachment: { connect: { id: blogAttachments[index].id } },
          createdAt: now,
          updatedAt: now,
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
          createdAt: now,
          updatedAt: now,
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
          createdAt: now,
          updatedAt: now,
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
          createdAt: now,
          updatedAt: now,
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
          createdAt: now,
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
          createdAt: now,
          updatedAt: now,
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
