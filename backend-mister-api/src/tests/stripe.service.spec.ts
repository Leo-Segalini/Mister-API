import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StripeService } from '../services/stripe.service';
import { User } from '../entities/user.entity';
import { ApiKey } from '../entities/api-key.entity';

describe('StripeService', () => {
  let service: StripeService;
  let configService: ConfigService;
  let userRepository: any;
  let apiKeyRepository: any;

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockApiKeyRepository = {
    update: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockApiKeyRepository,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get(getRepositoryToken(User));
    apiKeyRepository = module.get(getRepositoryToken(ApiKey));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockConfigService.get.mockReturnValue('sk_test_key');

      // Mock Stripe
      jest.spyOn(service['stripe'].checkout.sessions, 'create').mockResolvedValue(mockSession as any);

      const result = await service.createCheckoutSession({
        userId: 'user-123',
        priceId: 'price_123',
        successUrl: 'https://success.com',
        cancelUrl: 'https://cancel.com',
      });

      expect(result).toEqual(mockSession);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-123' } });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue('sk_test_key');

      await expect(
        service.createCheckoutSession({
          userId: 'user-123',
          priceId: 'price_123',
          successUrl: 'https://success.com',
          cancelUrl: 'https://cancel.com',
        })
      ).rejects.toThrow('Utilisateur non trouvé');
    });
  });

  describe('getPrices', () => {
    it('should return list of prices', async () => {
      const mockPrices = [
        { id: 'price_1', currency: 'eur', unit_amount: 999 },
        { id: 'price_2', currency: 'eur', unit_amount: 1999 },
      ];

      mockConfigService.get.mockReturnValue('sk_test_key');
      jest.spyOn(service['stripe'].prices, 'list').mockResolvedValue({ data: mockPrices } as any);

      const result = await service.getPrices();

      expect(result).toEqual(mockPrices);
    });
  });

  describe('handleWebhook', () => {
    it('should handle checkout.session.completed event', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            metadata: { userId: 'user-123' },
          },
        },
      };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      await service.handleWebhook(mockEvent as any);

      expect(mockUserRepository.update).toHaveBeenCalledWith('user-123', {
        stripe_customer_id: 'cus_test_123',
      });
    });
  });
}); 