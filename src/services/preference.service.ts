import { prisma } from "../prisma";
import { AppError } from "../errors/AppError";


export async function getPreferences(userId: number) {
    return prisma.preference.findMany({
        where: { userId },
        include: { category: true}
    })
}
export async function addPreferences(userId: number, categoryIds: number[]) {
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } }
  })
  if (categories.length !== categoryIds.length) {
    throw new AppError("La ou les catégories n'ont pas été trouvées", 404)
  }

  const existing = await prisma.preference.findMany({
    where: { userId, categoryId: { in: categoryIds } }
  })
  const existingIds = existing.map(p => p.categoryId)
  const newIds = categoryIds.filter(id => !existingIds.includes(id))

  if (newIds.length === 0) throw new AppError("Toutes les préférences existe déjà", 409)

  await prisma.preference.createMany({
    data: newIds.map(categoryId => ({ userId, categoryId }))
  })

  return prisma.preference.findMany({
    where: { userId, categoryId: { in: newIds } },
    include: { category: true }
  })
}

export async function deletePreference(id: number, userId: number) {
    const preference = await prisma.preference.findUnique({ where: { id } })
    if (!preference) throw new AppError("Préférence non trouvé", 404)
    
    if (preference.userId !== userId) throw new AppError("Cette préférence n'est pas la votre", 403)

    return prisma.preference.delete({ where: {id}})
}