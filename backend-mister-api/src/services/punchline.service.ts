import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between, FindOptionsWhere } from 'typeorm';
import { Punchline } from '../entities/punchline.entity';
import { CreatePunchlineDto, UpdatePunchlineDto, PunchlineQueryDto, PunchlineTheme, PunchlineLangue } from '../dto/punchline.dto';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class PunchlineService {
  constructor(
    @InjectRepository(Punchline)
    private punchlineRepository: Repository<Punchline>,
  ) {}

  /**
   * Crée une nouvelle citation historique
   * @param createPunchlineDto - Données de la citation à créer
   * @returns La citation créée
   */
  async create(createPunchlineDto: CreatePunchlineDto): Promise<ApiResponse<Punchline>> {
    try {
      const punchline = this.punchlineRepository.create(createPunchlineDto);
      const savedPunchline = await this.punchlineRepository.save(punchline);
      
      return {
        success: true,
        message: 'Citation historique créée avec succès',
        data: savedPunchline
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la création de la citation historique');
    }
  }

  /**
   * Récupère toutes les citations historiques avec filtres et pagination
   * @param query - Paramètres de requête et filtres
   * @returns Liste paginée des citations
   */
  async findAll(query: PunchlineQueryDto): Promise<ApiResponse<{ punchlines: Punchline[]; total: number; page: number; limit: number; totalPages: number }>> {
    try {
      const { page = 1, limit = 20, search, theme, langue, auteur, tags, annee, annee_range, popularite_min, order = 'desc', sortBy = 'popularite' } = query;
      
      // Construction de la requête avec QueryBuilder
      const queryBuilder = this.punchlineRepository.createQueryBuilder('punchline');
      
      if (search) {
        queryBuilder.andWhere('punchline.citation ILIKE :search OR punchline.auteur ILIKE :search OR punchline.theme ILIKE :search', { search: `%${search}%` });
      }
      
      if (theme) {
        queryBuilder.andWhere('punchline.theme = :theme', { theme });
      }
      
      if (langue) {
        queryBuilder.andWhere('punchline.langue = :langue', { langue });
      }
      
      if (auteur) {
        queryBuilder.andWhere('punchline.auteur ILIKE :auteur', { auteur: `%${auteur}%` });
      }
      
      if (annee) {
        queryBuilder.andWhere('punchline.annee = :annee', { annee });
      }
      
      if (annee_range) {
        const [startYear, endYear] = annee_range.split('-').map(y => parseInt(y.trim()));
        if (startYear && endYear) {
          queryBuilder.andWhere('punchline.annee BETWEEN :startYear AND :endYear', { startYear, endYear });
        }
      }
      
      if (popularite_min) {
        queryBuilder.andWhere('punchline.popularite >= :popularite_min', { popularite_min });
      }

      // Gestion des tags (recherche dans le tableau)
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        queryBuilder.andWhere('punchline.tags && :tags', { tags: tagArray });
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Ajout de l'ordre et de la pagination
      queryBuilder
        .orderBy(`punchline.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC')
        .skip(offset)
        .take(limit);

      // Exécution de la requête
      const [punchlines, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Citations historiques récupérées avec succès',
        data: {
          punchlines,
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des citations historiques');
    }
  }

  /**
   * Récupère une citation historique par son ID
   * @param id - ID de la citation
   * @returns La citation trouvée
   */
  async findOne(id: string): Promise<ApiResponse<Punchline>> {
    try {
      const punchline = await this.punchlineRepository.findOne({ where: { id } });
      
      if (!punchline) {
        throw new NotFoundException('Citation historique non trouvée');
      }

      return {
        success: true,
        message: 'Citation historique récupérée avec succès',
        data: punchline
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération de la citation historique');
    }
  }

  /**
   * Met à jour une citation historique
   * @param id - ID de la citation à mettre à jour
   * @param updatePunchlineDto - Nouvelles données de la citation
   * @returns La citation mise à jour
   */
  async update(id: string, updatePunchlineDto: UpdatePunchlineDto): Promise<ApiResponse<Punchline>> {
    try {
      const punchline = await this.punchlineRepository.findOne({ where: { id } });
      
      if (!punchline) {
        throw new NotFoundException('Citation historique non trouvée');
      }

      // Mise à jour des champs
      Object.assign(punchline, updatePunchlineDto);
      const updatedPunchline = await this.punchlineRepository.save(punchline);

      return {
        success: true,
        message: 'Citation historique mise à jour avec succès',
        data: updatedPunchline
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour de la citation historique');
    }
  }

  /**
   * Supprime une citation historique
   * @param id - ID de la citation à supprimer
   * @returns Message de confirmation
   */
  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const punchline = await this.punchlineRepository.findOne({ where: { id } });
      
      if (!punchline) {
        throw new NotFoundException('Citation historique non trouvée');
      }

      await this.punchlineRepository.remove(punchline);

      return {
        success: true,
        message: 'Citation historique supprimée avec succès',
        data: null
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la suppression de la citation historique');
    }
  }

  /**
   * Récupère une citation historique aléatoire
   * @param filters - Filtres optionnels pour la sélection aléatoire
   * @returns Une citation aléatoire
   */
  async getRandom(filters?: { theme?: PunchlineTheme; langue?: PunchlineLangue; popularite_min?: number }): Promise<ApiResponse<Punchline>> {
    try {
      const queryBuilder = this.punchlineRepository.createQueryBuilder('punchline');
      
      if (filters?.theme) {
        queryBuilder.andWhere('punchline.theme = :theme', { theme: filters.theme });
      }
      
      if (filters?.langue) {
        queryBuilder.andWhere('punchline.langue = :langue', { langue: filters.langue });
      }
      
      if (filters?.popularite_min) {
        queryBuilder.andWhere('punchline.popularite >= :popularite_min', { popularite_min: filters.popularite_min });
      }

      const punchline = await queryBuilder
        .orderBy('RANDOM()')
        .getOne();

      if (!punchline) {
        throw new NotFoundException('Aucune citation historique trouvée avec les critères spécifiés');
      }

      return {
        success: true,
        message: 'Citation historique aléatoire récupérée avec succès',
        data: punchline
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la récupération de la citation historique aléatoire');
    }
  }

  /**
   * Récupère les statistiques des citations historiques
   * @returns Statistiques des citations
   */
  async getStats(): Promise<ApiResponse<any>> {
    try {
      const total = await this.punchlineRepository.count();
      
      const statsByTheme = await this.punchlineRepository
        .createQueryBuilder('punchline')
        .select('punchline.theme', 'theme')
        .addSelect('COUNT(*)', 'count')
        .groupBy('punchline.theme')
        .getRawMany();
      
      const statsByLangue = await this.punchlineRepository
        .createQueryBuilder('punchline')
        .select('punchline.langue', 'langue')
        .addSelect('COUNT(*)', 'count')
        .groupBy('punchline.langue')
        .getRawMany();
      
      const averagePopularite = await this.punchlineRepository
        .createQueryBuilder('punchline')
        .select('AVG(punchline.popularite)', 'average')
        .getRawOne();

      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: {
          total,
          byTheme: statsByTheme,
          byLangue: statsByLangue,
          averagePopularite: parseFloat(averagePopularite.average) || 0
        }
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des statistiques');
    }
  }
} 