import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const logActivity = async (
  action: string,
  description: string,
  userId?: string,
  bookingId?: string
) => {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        description,
        userId: userId || null,
        bookingId: bookingId || null
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should not break the main flow
  }
};

