import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
    private readonly categoryService: CategoriesService
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


  async findAll(): Promise<ProductEntity[]> {
    return await this.productRepository.find({
      relations: {
        category: true,

      },
      select: {
        category: {
          id: true,
          title: true,
          description: true
        },

      }
    });
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

  async update(id: number, updateProductDto: Partial<UpdateProductDto>, currentUser: UserEntity):Promise<ProductEntity> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);
    product.addedBy = currentUser;

    if (updateProductDto.categoryId) {
      const category = await this.categoryService.findOne(+updateProductDto.categoryId);
      product.category = category;
    }
    return await this.productRepository.save(product);
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
