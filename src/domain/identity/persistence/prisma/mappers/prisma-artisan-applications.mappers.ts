import { Prisma, ArtisanApplication as PrismaArtisanApplication, ApplicationType } from '@prisma/client';
import { ArtisanApplication, ArtisanApplicationStatus } from '@/domain/identity/core/entities/artisan-application.entity';

export class PrismaArtisanApplicationsMapper {
  static toDomain(artisanApplication: PrismaArtisanApplication): ArtisanApplication {
    return ArtisanApplication.create({
      userId: artisanApplication.userId,
      type: artisanApplication.type as ApplicationType,
      rawMaterial: artisanApplication.rawMaterial,
      technique: artisanApplication.technique,
      finalityClassification: artisanApplication.finalityClassification,
      sicab: artisanApplication.sicab,
      sicabRegistrationDate: artisanApplication.sicabRegistrationDate,
      sicabValidUntil: artisanApplication.sicabValidUntil,
      status: artisanApplication.status as ArtisanApplicationStatus,
      reviewerId: artisanApplication.reviewerId ?? undefined,
      rejectionReason: artisanApplication.rejectionReason ?? undefined,
    }, artisanApplication.id, artisanApplication.createdAt, artisanApplication.updatedAt);
  }

  static toPrisma(
    artisanApplication: ArtisanApplication,
  ): Prisma.ArtisanApplicationUncheckedCreateInput {
    return {
      id: artisanApplication.id,
      userId: artisanApplication.userId,
      type: artisanApplication.type,
      rawMaterial: artisanApplication.rawMaterial,
      technique: artisanApplication.technique,
      finalityClassification: artisanApplication.finalityClassification,
      sicab: artisanApplication.sicab,
      sicabRegistrationDate: artisanApplication.sicabRegistrationDate,
      sicabValidUntil: artisanApplication.sicabValidUntil,
      status: artisanApplication.status as ArtisanApplicationStatus,
      reviewerId: artisanApplication.reviewerId ?? undefined,
      rejectionReason: artisanApplication.rejectionReason ?? undefined,
      createdAt: artisanApplication.createdAt,
      updatedAt: artisanApplication.updatedAt,
    };
  }
}
