import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"

export async function getCategories(showAll?: boolean) {
  return prisma.category.findMany({
    where: showAll ? {} : { deletedAt: null },
    include: { children: { where: { deletedAt: null } }, parent: true }
  })
}

export async function getCategoryById(id: number) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { children: { where: { deletedAt: null } }, parent: true, events: true }
  })
  if (!category) throw new AppError("Catégorie non trouvée", 404)
  if (category.deletedAt) throw new AppError("Catégorie supprimée", 404)
  return category
}

export async function createCategory(data: {
  name: string
  description: string
  parentId?: number
}) {
  if (data.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: data.parentId } })
    if (!parent || parent.deletedAt) throw new AppError("Catégorie parente non trouvée", 404)
  }

  return prisma.category.create({ data })
}

export async function updateCategory(id: number, data: any) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new AppError("Catégorie non trouvée", 404)
  if (category.deletedAt) throw new AppError("Catégorie supprimée", 404)

  return prisma.category.update({ where: { id }, data })
}

export async function deleteCategory(id: number) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new AppError("Catégorie non trouvée", 404)
  if (category.deletedAt) throw new AppError("Catégorie déjà supprimée", 400)

  return prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() }
  })
}

export async function restoreCategory(id: number) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) throw new AppError("Catégorie non trouvée", 404)
  if (!category.deletedAt) throw new AppError("Catégorie non supprimée", 400)

  return prisma.category.update({
    where: { id },
    data: { deletedAt: null }
  })
}