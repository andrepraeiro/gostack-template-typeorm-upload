import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const categorySameTitle = await categoryRepository.findOne({
      where: { title },
    });

    if (categorySameTitle) {
      throw new AppError('This title for category already exists', 400);
    }

    const category = await categoryRepository.create({ title });

    return categoryRepository.save(category);
  }
}

export default CreateCategoryService;
