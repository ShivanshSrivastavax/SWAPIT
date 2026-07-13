export async function findUserByLoginIdentifier(prismaClient, identifier) {
  const normalized = identifier.trim().toLowerCase()

  return prismaClient.user.findFirst({
    where: {
      OR: [
        { email: { equals: normalized, mode: 'insensitive' } },
        { username: { equals: normalized, mode: 'insensitive' } },
      ],
    },
  })
}
