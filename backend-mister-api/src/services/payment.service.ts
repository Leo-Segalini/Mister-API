import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto } from '../dto/payment.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Créer un nouveau paiement (admin seulement)
   */
  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: createPaymentDto.user_id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const payment = this.paymentRepository.create(createPaymentDto);
    const savedPayment = await this.paymentRepository.save(payment);
    
    return this.mapToResponseDto(savedPayment);
  }

  /**
   * Récupérer tous les paiements (admin seulement)
   */
  async findAll(): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' }
    });
    
    return payments.map(payment => this.mapToResponseDto(payment));
  }

  /**
   * Récupérer un paiement par ID (admin seulement)
   */
  async findOne(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!payment) {
      throw new NotFoundException('Paiement non trouvé');
    }

    return this.mapToResponseDto(payment);
  }

  /**
   * Récupérer les paiements d'un utilisateur (utilisateur authentifié)
   */
  async findByUserId(userId: string, currentUserId: string): Promise<PaymentResponseDto[]> {
    // Vérifier que l'utilisateur peut voir ses propres paiements
    if (userId !== currentUserId) {
      throw new ForbiddenException('Vous ne pouvez voir que vos propres paiements');
    }

    const payments = await this.paymentRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });

    return payments.map(payment => this.mapToResponseDto(payment));
  }

  /**
   * Mettre à jour un paiement (admin seulement)
   */
  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    
    if (!payment) {
      throw new NotFoundException('Paiement non trouvé');
    }

    Object.assign(payment, updatePaymentDto);
    const updatedPayment = await this.paymentRepository.save(payment);
    
    return this.mapToResponseDto(updatedPayment);
  }

  /**
   * Supprimer un paiement (admin seulement)
   */
  async remove(id: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    
    if (!payment) {
      throw new NotFoundException('Paiement non trouvé');
    }

    await this.paymentRepository.remove(payment);
  }

  /**
   * Mettre à jour le statut d'un paiement (utilisé par les webhooks Stripe)
   */
  async updateStatus(id: string, status: PaymentStatus, metadata?: Record<string, any>): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    
    if (!payment) {
      throw new NotFoundException('Paiement non trouvé');
    }

    payment.status = status;
    if (metadata) {
      payment.metadata = { ...payment.metadata, ...metadata };
    }

    const updatedPayment = await this.paymentRepository.save(payment);
    return this.mapToResponseDto(updatedPayment);
  }

  /**
   * Récupérer les statistiques des paiements (admin seulement)
   */
  async getStats() {
    const stats = await this.paymentRepository
      .createQueryBuilder('payment')
      .select([
        'COUNT(*) as total_payments',
        'COUNT(CASE WHEN payment.status = :succeeded THEN 1 END) as successful_payments',
        'COUNT(CASE WHEN payment.status = :failed THEN 1 END) as failed_payments',
        'COUNT(CASE WHEN payment.status = :pending THEN 1 END) as pending_payments',
        'SUM(CASE WHEN payment.status = :succeeded THEN payment.amount ELSE 0 END) as total_amount',
        'AVG(CASE WHEN payment.status = :succeeded THEN payment.amount ELSE NULL END) as average_amount'
      ])
      .setParameters({
        succeeded: PaymentStatus.SUCCEEDED,
        failed: PaymentStatus.FAILED,
        pending: PaymentStatus.PENDING
      })
      .getRawOne();

    return {
      total_payments: parseInt(stats.total_payments),
      successful_payments: parseInt(stats.successful_payments),
      failed_payments: parseInt(stats.failed_payments),
      pending_payments: parseInt(stats.pending_payments),
      total_amount: parseInt(stats.total_amount) || 0,
      average_amount: parseFloat(stats.average_amount) || 0
    };
  }

  /**
   * Rechercher des paiements par critères (admin seulement)
   */
  async search(criteria: {
    status?: PaymentStatus;
    user_id?: string;
    date_from?: Date;
    date_to?: Date;
    min_amount?: number;
    max_amount?: number;
  }) {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (criteria.status) {
      queryBuilder.andWhere('payment.status = :status', { status: criteria.status });
    }

    if (criteria.user_id) {
      queryBuilder.andWhere('payment.user_id = :user_id', { user_id: criteria.user_id });
    }

    if (criteria.date_from) {
      queryBuilder.andWhere('payment.created_at >= :date_from', { date_from: criteria.date_from });
    }

    if (criteria.date_to) {
      queryBuilder.andWhere('payment.created_at <= :date_to', { date_to: criteria.date_to });
    }

    if (criteria.min_amount) {
      queryBuilder.andWhere('payment.amount >= :min_amount', { min_amount: criteria.min_amount });
    }

    if (criteria.max_amount) {
      queryBuilder.andWhere('payment.amount <= :max_amount', { max_amount: criteria.max_amount });
    }

    const payments = await queryBuilder
      .leftJoinAndSelect('payment.user', 'user')
      .orderBy('payment.created_at', 'DESC')
      .getMany();

    return payments.map(payment => this.mapToResponseDto(payment));
  }

  /**
   * Mapper l'entité vers le DTO de réponse
   */
  private mapToResponseDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      user_id: payment.user_id,
      stripe_payment_intent_id: payment.stripe_payment_intent_id,
      stripe_subscription_id: payment.stripe_subscription_id,
      stripe_customer_id: payment.stripe_customer_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.payment_method,
      description: payment.description,
      metadata: payment.metadata,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    };
  }
} 