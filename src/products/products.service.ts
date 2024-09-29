import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { OrderStatus } from 'src/orders/enums/order-status.enum';
import dataSource from 'db/data-source';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
    private readonly categoryService: CategoriesService,
    @Inject(forwardRef(() => OrdersService)) private readonly ordersService: OrdersService
  ) { }


  async create(createProductDto: CreateProductDto, currentUser: UserEntity): Promise<ProductEntity> {
    const category = await this.categoryService.findOne(+createProductDto.categoryId);

    if (!category) {
      throw new NotFoundException("Category Not Found")
    }

    const product = this.productRepository.create(createProductDto);
    // const p = Object.assign(ProductEntity,createProductDto)
    product.category = category;
    product.addedBy = currentUser;

    return await this.productRepository.save(product);
  }


  async findAll(query: any): Promise<{ products, totalProducts, limit }> {
    let filteredTotalProducts: number;
    let limit: number;
    if (!query.limit) {
      limit = 4;
    } else {
      limit = query.limit;
    }

    const queryBuilder = dataSource.getRepository(ProductEntity)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.reviews', 'review')
      .addSelect([
        'COUNT(review.id) AS reviewCount',
        'AVG(review.ratings)::numeric(10,2) AS avgRating'
      ])
      .groupBy('product.id, category.id, review.id');

    const totalProducts = await queryBuilder.getCount();

    if (query.search) {
      const search = query.search;
      queryBuilder.andWhere("product.title like :title", { title: `%${search}%` })
    }

    if (query.category) {
      const category = query.category;
      queryBuilder.andWhere("category.id = :id", { id: category })
    }

    if (query.minPrice) {
      queryBuilder.andWhere("product.price >= :minPrice", { minPrice: query.minPrice })
    }

    if (query.maxPrice) {
      queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice: query.maxPrice })
    }

    if (query.minRating) {
      queryBuilder.andHaving("AVG(review.ratings)>=:minRating", { minRating: query.minRating })
    }
    if (query.maxRating) {
      queryBuilder.andHaving("AVG(review.ratings)<=:maxRating", { maxRating: query.maxRating })
    }

    queryBuilder.limit(limit);

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const products = await queryBuilder.getRawMany();


    // const alldata = await this.productRepository.find({
    //   relations: {
    //     category: true,

    //   },
    //   select: {
    //     category: {
    //       id: true,
    //       title: true,
    //       description: true
    //     },

    //   }
    // });
    // return { data:alldata,totalProducts: totalProducts };

    return { products, totalProducts, limit }
  }



  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: {
        category: true,
        addedBy: true,

      },
      select: {
        category: {
          id: true,
          title: true,
          description: true
        },
        addedBy: {
          id: true,
          name: true,
          email: true,

        }
      }
    })
    if (!product) {
      throw new NotFoundException("Product Not Found")
    }
    return product;
  }

  async update(id: number, updateProductDto: Partial<UpdateProductDto>, currentUser: UserEntity): Promise<ProductEntity> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);
    product.addedBy = currentUser;

    if (updateProductDto.categoryId) {
      const category = await this.categoryService.findOne(+updateProductDto.categoryId);
      product.category = category;
    }
    return await this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id)
    const order = await this.ordersService.findOneByProductId(product.id)
    if (order) {
      throw new BadRequestException("Product is in order")
    }
    return await this.productRepository.remove(product);
  }

  async updateStock(id: number, stock: number, status: string) {
    let product = await this.findOne(id);
    if (status === OrderStatus.DELIVERED) {
      product.stock -= stock;
    } else {
      product.stock += stock
    }
    product = await this.productRepository.save(product);
    return product;
  }
}
