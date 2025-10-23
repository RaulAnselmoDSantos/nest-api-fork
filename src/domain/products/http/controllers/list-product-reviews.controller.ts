import {
  Controller, Get, NotFoundException, Param, Query,
} from '@nestjs/common';
import { ListProductReviewsUseCase } from '../../core/use-cases/list-product-reviews.use-case';
import { PaginateReviewsDto } from '../dtos/paginate-reviews.dto';
import { ProductNotFoundError } from '../../core/errors/product-not-found.error';

@Controller('products/:id/reviews')
export class ListProductReviewsController {
  constructor(private readonly useCase: ListProductReviewsUseCase) {}

  @Get()
  async handle(
    @Param('id') productId: string,
    @Query() q: PaginateReviewsDto,
  ) {
    const result = await this.useCase.execute({ productId, page: q.page, limit: q.limit });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ProductNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw error;
      }
    }

    return {
      reviews: result.value.reviews,
      pagination: result.value.pagination,
    };
  }
}
