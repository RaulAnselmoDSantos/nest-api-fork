import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Either, left, right } from '@/domain/_shared/utils/either';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ProductReviewsRepository } from '@/domain/repositories/product-reviews.repository';
import { ProductsRepository } from '@/domain/repositories/products.repository';
import { UsersRepository } from '@/domain/repositories/users.repository';
import { InvalidRatingError } from '../errors/invalid-rating.error';
import { OperationNotAllowedError } from '../errors/operation-not-allowed.error';
import { ProductNotFoundError } from '../errors/product-not-found.error';
import { ReviewAlreadyExistsError } from '../errors/review-already-exists.error';

type Input = { currentUserId: string; productId: string; rating: number; comment?: string | null };
type Output = { averageRating: number; totalReviews: number };

@Injectable()
export class CreateProductReviewUseCase {
  private readonly logger = new Logger(CreateProductReviewUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewsRepo: ProductReviewsRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async execute(input: Input): Promise<Either<Error, Output>> {
    const t0 = Date.now();
    this.logger.debug({ event: 'start', ...input, useCase: 'create' });

    try {
      const { currentUserId, productId, rating } = input;
      const comment = input.comment ?? null;

      if (
        !Number.isInteger(rating)
        || rating < 1
        || rating > 5
      ) return left(new InvalidRatingError());

      if (comment && comment.length > 500) {
        return left(new OperationNotAllowedError('Comentário excede 500 caracteres'));
      }

      const product = await this.productsRepo.findByIdCore(productId);

      if (!product) {
        return left(new ProductNotFoundError(productId));
      }

      if (!product.isActive) {
        return left(new OperationNotAllowedError('Inactive product'));
      }

      if (product.artisanId === currentUserId) {
        return left(new OperationNotAllowedError('Product owner cannot review'));
      }

      const isDisabled = await this.usersRepo.findIsDisabledById(currentUserId);
      if (isDisabled === null) {
        return left(new OperationNotAllowedError('Invalid user'));
      }
      if (isDisabled) {
        return left(new OperationNotAllowedError('User is disabled'));
      }

      const existing = await this.reviewsRepo.findByUserAndProduct(
        currentUserId,
        productId,
      );
      if (existing) {
        return left(new ReviewAlreadyExistsError());
      }

      const out = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await this.reviewsRepo.create(currentUserId, productId, rating, comment, tx);

        const { avg, count } = await this.reviewsRepo.aggregateByProduct(productId, tx);
        await this.productsRepo.updateAverageRating({ productId, averageRating: avg ?? null }, tx);

        const averageRating = Math.ceil((avg ?? 0) * 10) / 10; // ceil 1 casa
        return { averageRating, totalReviews: count };
      });

      this.logger.debug({
        event: 'success',
        durationMs: Date.now() - t0,
        productId,
        currentUserId,
        action: 'created',
        averageRating: out.averageRating,
        totalReviews: out.totalReviews,
      });
      return right(out);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      this.logger.error({
        event: 'error',
        err: error.message,
        stack: error.stack,
      });
      return left(error);
    }
  }
}
