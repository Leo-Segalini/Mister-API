import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animal } from '../entities/animal.entity';
import { CreateAnimalDto, UpdateAnimalDto, AnimalQueryDto } from '../dto/animal.dto';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class AnimalService {
  constructor(
    @InjectRepository(Animal)
    private animalRepository: Repository<Animal>,
  ) {}

  /**
   * Crée un nouvel animal
   * @param createAnimalDto - Données de l'animal à créer
   * @returns L'animal créé
   */
  async create(createAnimalDto: CreateAnimalDto): Promise<ApiResponse<Animal>> {
    try {
      const animal = this.animalRepository.create(createAnimalDto);
      const savedAnimal = await this.animalRepository.save(animal);
      
      return {
        success: true,
        message: 'Animal créé avec succès',
        data: savedAnimal
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la création de l\'animal');
    }
  }

  /**
   * Récupère tous les animaux avec pagination et filtres
   * @param query - Paramètres de requête (pagination, filtres, recherche)
   * @returns Liste paginée des animaux
   */
  async findAll(query: AnimalQueryDto): Promise<ApiResponse<{ animaux: Animal[]; total: number; page: number; limit: number; totalPages: number }>> {
    try {
      const { page = 1, limit = 20, search, famille, habitat, alimentation, zone, is_active, taille_min, taille_max, poids_min, poids_max, order = 'asc', sortBy = 'nom' } = query;
      
      // Construction de la requête avec QueryBuilder
      const queryBuilder = this.animalRepository.createQueryBuilder('animal');
      
      if (search) {
        queryBuilder.andWhere('animal.nom ILIKE :search OR animal.espece ILIKE :search OR animal.famille ILIKE :search', { search: `%${search}%` });
      }
      
      if (famille) {
        queryBuilder.andWhere('animal.famille ILIKE :famille', { famille: `%${famille}%` });
      }
      
      if (habitat) {
        queryBuilder.andWhere('animal.habitat ILIKE :habitat', { habitat: `%${habitat}%` });
      }
      
      if (alimentation) {
        queryBuilder.andWhere('animal.alimentation ILIKE :alimentation', { alimentation: `%${alimentation}%` });
      }
      
      if (zone) {
        queryBuilder.andWhere('animal.zones_geographiques && :zone', { zone: [zone] });
      }
      
      if (is_active !== undefined) {
        queryBuilder.andWhere('animal.is_active = :is_active', { is_active });
      }
      
      if (taille_min) {
        queryBuilder.andWhere('animal.taille >= :taille_min', { taille_min });
      }
      
      if (taille_max) {
        queryBuilder.andWhere('animal.taille <= :taille_max', { taille_max });
      }
      
      if (poids_min) {
        queryBuilder.andWhere('animal.poids >= :poids_min', { poids_min });
      }
      
      if (poids_max) {
        queryBuilder.andWhere('animal.poids <= :poids_max', { poids_max });
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Ajout de l'ordre et de la pagination
      queryBuilder
        .orderBy(`animal.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC')
        .skip(offset)
        .take(limit);

      // Exécution de la requête
      const [animaux, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Animaux récupérés avec succès',
        data: {
          animaux,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des animaux');
    }
  }

  /**
   * Récupère un animal par son ID
   * @param id - ID de l'animal
   * @returns L'animal trouvé
   */
  async findOne(id: string): Promise<ApiResponse<Animal>> {
    try {
      const animal = await this.animalRepository.findOne({ where: { id } });
      
      if (!animal) {
        throw new NotFoundException('Animal non trouvé');
      }

      return {
        success: true,
        message: 'Animal récupéré avec succès',
        data: animal
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération de l\'animal');
    }
  }

  /**
   * Met à jour un animal
   * @param id - ID de l'animal à mettre à jour
   * @param updateAnimalDto - Nouvelles données de l'animal
   * @returns L'animal mis à jour
   */
  async update(id: string, updateAnimalDto: UpdateAnimalDto): Promise<ApiResponse<Animal>> {
    try {
      const animal = await this.animalRepository.findOne({ where: { id } });
      
      if (!animal) {
        throw new NotFoundException('Animal non trouvé');
      }

      // Mise à jour des champs
      Object.assign(animal, updateAnimalDto);
      const updatedAnimal = await this.animalRepository.save(animal);

      return {
        success: true,
        message: 'Animal mis à jour avec succès',
        data: updatedAnimal
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour de l\'animal');
    }
  }

  /**
   * Supprime un animal
   * @param id - ID de l'animal à supprimer
   * @returns Message de confirmation
   */
  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const animal = await this.animalRepository.findOne({ where: { id } });
      
      if (!animal) {
        throw new NotFoundException('Animal non trouvé');
      }

      await this.animalRepository.remove(animal);

      return {
        success: true,
        message: 'Animal supprimé avec succès',
        data: null
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la suppression de l\'animal');
    }
  }

  /**
   * Récupère un animal par son nom scientifique (espèce)
   * @param espece - Nom scientifique de l'animal
   * @returns L'animal trouvé
   */
  async findByEspece(espece: string): Promise<ApiResponse<Animal>> {
    try {
      const animal = await this.animalRepository
        .createQueryBuilder('animal')
        .where('animal.espece = :espece', { espece })
        .getOne();
      
      if (!animal) {
        throw new NotFoundException('Animal non trouvé');
      }

      return {
        success: true,
        message: 'Animal récupéré avec succès',
        data: animal
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération de l\'animal');
    }
  }

  /**
   * Récupère les animaux par famille
   * @param famille - Famille d'animaux
   * @returns Liste des animaux de la famille spécifiée
   */
  async findByFamille(famille: string): Promise<ApiResponse<Animal[]>> {
    try {
      const animaux = await this.animalRepository
        .createQueryBuilder('animal')
        .where('animal.famille ILIKE :famille', { famille: `%${famille}%` })
        .orderBy('animal.nom', 'ASC')
        .getMany();

      return {
        success: true,
        message: `Animaux de la famille ${famille} récupérés avec succès`,
        data: animaux
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des animaux par famille');
    }
  }

  /**
   * Récupère les animaux actifs
   * @returns Liste des animaux actifs
   */
  async getActiveAnimals(): Promise<ApiResponse<Animal[]>> {
    try {
      const animaux = await this.animalRepository
        .createQueryBuilder('animal')
        .where('animal.is_active = :is_active', { is_active: true })
        .orderBy('animal.nom', 'ASC')
        .getMany();

      return {
        success: true,
        message: 'Animaux actifs récupérés avec succès',
        data: animaux
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des animaux actifs');
    }
  }

  /**
   * Récupère les statistiques des animaux
   * @returns Statistiques des animaux
   */
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const total = await this.animalRepository.count();
      
      const activeCount = await this.animalRepository
        .createQueryBuilder('animal')
        .where('animal.is_active = :is_active', { is_active: true })
        .getCount();

      const statsByFamille = await this.animalRepository
        .createQueryBuilder('animal')
        .select('animal.famille', 'famille')
        .addSelect('COUNT(*)', 'count')
        .groupBy('animal.famille')
        .getRawMany();

      const statsByHabitat = await this.animalRepository
        .createQueryBuilder('animal')
        .select('animal.habitat', 'habitat')
        .addSelect('COUNT(*)', 'count')
        .groupBy('animal.habitat')
        .getRawMany();

      const statsByAlimentation = await this.animalRepository
        .createQueryBuilder('animal')
        .select('animal.alimentation', 'alimentation')
        .addSelect('COUNT(*)', 'count')
        .groupBy('animal.alimentation')
        .getRawMany();

      const averageTaille = await this.animalRepository
        .createQueryBuilder('animal')
        .select('AVG(animal.taille)', 'average')
        .getRawOne();

      const averagePoids = await this.animalRepository
        .createQueryBuilder('animal')
        .select('AVG(animal.poids)', 'average')
        .getRawOne();

      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: {
          total,
          activeCount,
          byFamille: statsByFamille,
          byHabitat: statsByHabitat,
          byAlimentation: statsByAlimentation,
          averageTaille: parseFloat(averageTaille.average) || 0,
          averagePoids: parseFloat(averagePoids.average) || 0
        }
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des statistiques');
    }
  }
} 