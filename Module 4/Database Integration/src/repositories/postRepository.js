
const prisma = require('../db/prisma');

async function findAll() {
  return prisma.post.findMany({
    orderBy: { id: 'asc' },
  });
}

async function findById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
  });
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        authorId: fields.authorId,
      },
    });
  } catch (error) {
    if (error.code === 'P2003') {
      const safeError = new Error('Referenced user does not exist');
      safeError.statusCode = 422;
      throw safeError;
    }

    throw error;
  }
}

async function update(id, patch) {
  try {
    return await prisma.post.update({
      where: { id: Number(id) },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.body !== undefined && { body: patch.body }),
      },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }

    throw error;
  }
}

async function remove(id) {
  try {
    await prisma.post.delete({
      where: { id: Number(id) },
    });

    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      return false;
    }

    throw error;
  }
}

module.exports = { findAll, findById, create, update, remove };
