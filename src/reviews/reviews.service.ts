import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/review.entity';
import { Repository } from 'typeorm';
import { ProductsService } from 'src/products/products.service';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(ReviewEntity) private readonly reviewRepository: Repository<ReviewEntity>, private readonly productsService: ProductsService) { }


  async create(createReviewDto: CreateReviewDto, currentUser: UserEntity): Promise<ReviewEntity> {
    const product = await this.productsService.findOne(createReviewDto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = this.reviewRepository.create(createReviewDto)
    review.user = currentUser;
    review.product = product

    return await this.reviewRepository.save(review);
  }

  async findAll() {
    return await this.reviewRepository.find();
    // return `This action returns all reviews`;
  }

  async findAllByProductId(id: number): Promise<ReviewEntity[]> {
    console.log("idProduct:=>>>>", id);

    const product = this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found')
    }
    return await this.reviewRepository.find({
      where: { product: { id } },
      relations: {
        user: true,
        product: {
          category: true
        }
      }
    })
  }

  async findOne(id: number): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: {
        user: true,
        product: {
          category: true
        },
      }
    })
    if (!review) {
      throw new NotFoundException('Review not found')
    }
    return review;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  async remove(id: number) {
    const review = await this.findOne(id);
    return await this.reviewRepository.remove(review);
  }

  async findOneByUserAndProduct(userId: number, productId: number) {
    return await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId }
      }
      , relations: {
        product: {
          category: true
        },
        user: true
      }
    })
  }
}
