import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pays } from '../entities/pays.entity';
import { CreatePaysDuMondeDto, UpdatePaysDuMondeDto, PaysDuMondeQueryDto } from '../dto/pays-du-monde.dto';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class PaysDuMondeService {
  constructor(
    @InjectRepository(Pays)
    private paysDuMondeRepository: Repository<Pays>,
  ) {}

  /**
   * Crée un nouveau pays
   * @param createPaysDuMondeDto - Données du pays à créer
   * @returns Le pays créé
   */
  async create(createPaysDuMondeDto: CreatePaysDuMondeDto): Promise<ApiResponse<Pays>> {
    try {
      const pays = this.paysDuMondeRepository.create(createPaysDuMondeDto);
      const savedPays = await this.paysDuMondeRepository.save(pays);
      
      return {
        success: true,
        message: 'Pays créé avec succès',
        data: savedPays
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la création du pays');
    }
  }

  /**
   * Récupère tous les pays avec pagination et filtres
   * @param query - Paramètres de requête (pagination, filtres, recherche)
   * @returns Liste paginée des pays
   */
  async findAll(query: PaysDuMondeQueryDto): Promise<ApiResponse<{ pays: Pays[]; total: number; page: number; limit: number; totalPages: number }>> {
    try {
      const { page = 1, limit = 20, search, continent, population_min, population_max, superficie_min, superficie_max, is_active, order = 'asc', sortBy = 'nom' } = query;
      
      // Construction de la requête avec QueryBuilder
      const queryBuilder = this.paysDuMondeRepository.createQueryBuilder('pays');
      
      if (search) {
        queryBuilder.andWhere('pays.nom ILIKE :search OR pays.capitale ILIKE :search OR pays.continent ILIKE :search', { search: `%${search}%` });
      }
      
      if (continent) {
        queryBuilder.andWhere('pays.continent ILIKE :continent', { continent: `%${continent}%` });
      }
      
      if (is_active !== undefined) {
        queryBuilder.andWhere('pays.is_active = :is_active', { is_active });
      }
      
      if (population_min) {
        queryBuilder.andWhere('pays.population >= :population_min', { population_min });
      }
      
      if (population_max) {
        queryBuilder.andWhere('pays.population <= :population_max', { population_max });
      }
      
      if (superficie_min) {
        queryBuilder.andWhere('pays.superficie >= :superficie_min', { superficie_min });
      }
      
      if (superficie_max) {
        queryBuilder.andWhere('pays.superficie <= :superficie_max', { superficie_max });
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Ajout de l'ordre et de la pagination
      queryBuilder
        .orderBy(`pays.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC')
        .skip(offset)
        .take(limit);

      // Exécution de la requête
      const [pays, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Pays récupérés avec succès',
        data: {
          pays,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des pays');
    }
  }

  /**
   * Récupère un pays par son ID
   * @param id - ID du pays
   * @returns Le pays trouvé
   */
  async findOne(id: string): Promise<ApiResponse<Pays>> {
    try {
      const pays = await this.paysDuMondeRepository.findOne({ where: { id } });
      
      if (!pays) {
        throw new NotFoundException('Pays non trouvé');
      }

      return {
        success: true,
        message: 'Pays récupéré avec succès',
        data: pays
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération du pays');
    }
  }

  /**
   * Met à jour un pays
   * @param id - ID du pays à mettre à jour
   * @param updatePaysDuMondeDto - Nouvelles données du pays
   * @returns Le pays mis à jour
   */
  async update(id: string, updatePaysDuMondeDto: UpdatePaysDuMondeDto): Promise<ApiResponse<Pays>> {
    try {
      const pays = await this.paysDuMondeRepository.findOne({ where: { id } });
      
      if (!pays) {
        throw new NotFoundException('Pays non trouvé');
      }

      // Mise à jour des champs
      Object.assign(pays, updatePaysDuMondeDto);
      const updatedPays = await this.paysDuMondeRepository.save(pays);

      return {
        success: true,
        message: 'Pays mis à jour avec succès',
        data: updatedPays
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour du pays');
    }
  }

  /**
   * Supprime un pays
   * @param id - ID du pays à supprimer
   * @returns Message de confirmation
   */
  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const pays = await this.paysDuMondeRepository.findOne({ where: { id } });
      
      if (!pays) {
        throw new NotFoundException('Pays non trouvé');
      }

      await this.paysDuMondeRepository.remove(pays);

      return {
        success: true,
        message: 'Pays supprimé avec succès',
        data: null
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la suppression du pays');
    }
  }

  /**
   * Récupère un pays par son nom
   * @param nom - Nom du pays
   * @returns Le pays trouvé
   */
  async findByNom(nom: string): Promise<ApiResponse<Pays>> {
    try {
      const pays = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .where('LOWER(pays.nom) = LOWER(:nom)', { nom })
        .getOne();
      
      if (!pays) {
        throw new NotFoundException('Pays non trouvé');
      }

      return {
        success: true,
        message: 'Pays récupéré avec succès',
        data: pays
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération du pays');
    }
  }

  /**
   * Récupère les pays par continent
   * @param continent - Nom du continent
   * @returns Liste des pays du continent
   */
  async getCountriesByContinent(continent: string): Promise<ApiResponse<Pays[]>> {
    try {
      const pays = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .where('LOWER(pays.continent) = LOWER(:continent)', { continent })
        .orderBy('pays.nom', 'ASC')
        .getMany();

      return {
        success: true,
        message: `Pays du continent ${continent} récupérés avec succès`,
        data: pays
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des pays du continent');
    }
  }

  /**
   * Récupère les pays actifs
   * @returns Liste des pays actifs
   */
  async getActiveCountries(): Promise<ApiResponse<Pays[]>> {
    try {
      const pays = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .where('pays.is_active = :is_active', { is_active: true })
        .orderBy('pays.nom', 'ASC')
        .getMany();

      return {
        success: true,
        message: 'Pays actifs récupérés avec succès',
        data: pays
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des pays actifs');
    }
  }

  /**
   * Récupère les pays par tranche de population
   * @param range - Tranche de population (petit, moyen, grand, très grand)
   * @returns Liste des pays de la tranche
   */
  async getCountriesByPopulation(range: string): Promise<ApiResponse<Pays[]>> {
    try {
      let queryBuilder = this.paysDuMondeRepository.createQueryBuilder('pays');
      
      switch (range.toLowerCase()) {
        case 'petit':
          queryBuilder = queryBuilder.where('pays.population < 10000000');
          break;
        case 'moyen':
          queryBuilder = queryBuilder.where('pays.population >= 10000000 AND pays.population < 50000000');
          break;
        case 'grand':
          queryBuilder = queryBuilder.where('pays.population >= 50000000 AND pays.population < 100000000');
          break;
        case 'très grand':
        case 'tres grand':
          queryBuilder = queryBuilder.where('pays.population >= 100000000');
          break;
        default:
          throw new BadRequestException('Tranche de population invalide');
      }

      const pays = await queryBuilder
        .orderBy('pays.population', 'DESC')
        .getMany();

      return {
        success: true,
        message: `Pays de la tranche ${range} récupérés avec succès`,
        data: pays
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération des pays par population');
    }
  }

  /**
   * Recherche un pays par sa capitale
   * @param capitale - Nom de la capitale
   * @returns Le pays trouvé
   */
  async findByCapitale(capitale: string): Promise<ApiResponse<Pays>> {
    try {
      const pays = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .where('LOWER(pays.capitale) = LOWER(:capitale)', { capitale })
        .getOne();

      if (!pays) {
        throw new NotFoundException('Pays non trouvé');
      }

      return {
        success: true,
        message: 'Pays trouvé avec succès',
        data: pays
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la recherche du pays');
    }
  }

  /**
   * Récupère les pays par monnaie
   * @param monnaie - Nom de la monnaie
   * @returns Liste des pays utilisant cette monnaie
   */
  async getCountriesByCurrency(monnaie: string): Promise<ApiResponse<Pays[]>> {
    try {
      const pays = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .where('LOWER(pays.monnaie) = LOWER(:monnaie)', { monnaie })
        .orderBy('pays.nom', 'ASC')
        .getMany();

      return {
        success: true,
        message: `Pays utilisant la monnaie ${monnaie} récupérés avec succès`,
        data: pays
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des pays par monnaie');
    }
  }

  /**
   * Récupère les pays par langue officielle
   * @param langue - Nom de la langue
   * @returns Liste des pays ayant cette langue officielle
   */
  async getCountriesByLanguage(langue: string): Promise<ApiResponse<Pays[]>> {
    try {
      const pays = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .where('LOWER(pays.langue_officielle) = LOWER(:langue)', { langue })
        .orderBy('pays.nom', 'ASC')
        .getMany();

      return {
        success: true,
        message: `Pays ayant la langue officielle ${langue} récupérés avec succès`,
        data: pays
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des pays par langue');
    }
  }

  /**
   * Récupère les pays par animal national
   * @param animal - Nom de l'animal national
   * @returns Liste des pays ayant cet animal national
   */
  async getCountriesByAnimal(animal: string): Promise<ApiResponse<Pays[]>> {
    try {
      const pays = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .where('LOWER(pays.animal_national) = LOWER(:animal)', { animal })
        .orderBy('pays.nom', 'ASC')
        .getMany();

      return {
        success: true,
        message: `Pays ayant l'animal national ${animal} récupérés avec succès`,
        data: pays
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des pays par animal national');
    }
  }

  /**
   * Récupère les statistiques des pays
   * @returns Statistiques des pays
   */
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const total = await this.paysDuMondeRepository.count();
      
      const activeCount = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .where('pays.is_active = :is_active', { is_active: true })
        .getCount();

      const statsByContinent = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .select('pays.continent', 'continent')
        .addSelect('COUNT(*)', 'count')
        .groupBy('pays.continent')
        .getRawMany();

      const statsByPopulation = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .select('COUNT(*)', 'count')
        .addSelect('CASE WHEN pays.population >= 100000000 THEN \'Très grand\' WHEN pays.population >= 50000000 THEN \'Grand\' WHEN pays.population >= 10000000 THEN \'Moyen\' ELSE \'Petit\' END', 'category')
        .groupBy('category')
        .getRawMany();

      const statsByAnimal = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .select('pays.animal_national', 'animal')
        .addSelect('COUNT(*)', 'count')
        .where('pays.animal_national IS NOT NULL')
        .groupBy('pays.animal_national')
        .getRawMany();

      const averagePopulation = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .select('AVG(pays.population)', 'average')
        .getRawOne();

      const averageArea = await this.paysDuMondeRepository
        .createQueryBuilder('pays')
        .select('AVG(pays.superficie)', 'average')
        .getRawOne();

      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: {
          total,
          activeCount,
          byContinent: statsByContinent,
          byPopulation: statsByPopulation,
          byAnimal: statsByAnimal,
          averagePopulation: parseFloat(averagePopulation.average) || 0,
          averageArea: parseFloat(averageArea.average) || 0
        }
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des statistiques');
    }
  }
} 