import { Controller, Get, Post, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Diagnostic des Cookies')
@Controller('cookie-diagnostic')
export class CookieDiagnosticController {
  private readonly logger = new Logger(CookieDiagnosticController.name);

  @Post('set-test-cookie')
  @ApiOperation({
    summary: 'Définir un cookie de test',
    description: 'Définit un cookie de test pour vérifier la configuration cross-origin'
  })
  @ApiResponse({
    status: 200,
    description: 'Cookie de test défini avec succès'
  })
  async setTestCookie(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.logger.log('🍪 Tentative de définition d\'un cookie de test');
    
    // Informations sur la requête
    const requestInfo = {
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host,
      userAgent: req.headers['user-agent'],
      cookies: req.cookies,
      timestamp: new Date().toISOString(),
    };

    this.logger.log('📋 Informations de la requête:', requestInfo);

    // Définir plusieurs cookies de test avec différentes configurations
    const testValue = `test-${Date.now()}`;
    
    // Cookie basique
    res.cookie('test-basic', testValue, {
      httpOnly: true,
      secure: true,
      maxAge: 60000, // 1 minute
    });

    // Cookie avec SameSite=None (nécessaire pour cross-origin)
    res.cookie('test-samesite-none', testValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60000,
    });

    // Cookie sans domaine spécifique
    res.cookie('test-no-domain', testValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60000,
      path: '/',
    });

    // Cookie avec domaine spécifique
    res.cookie('test-with-domain', testValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60000,
      path: '/',
      domain: '.onrender.com',
    });

    this.logger.log('✅ Cookies de test définis avec succès');

    return {
      success: true,
      message: 'Cookies de test définis avec succès',
      data: {
        testValue,
        requestInfo,
        cookiesSet: [
          'test-basic',
          'test-samesite-none', 
          'test-no-domain',
          'test-with-domain'
        ]
      }
    };
  }

  @Get('check-cookies')
  @ApiOperation({
    summary: 'Vérifier la réception des cookies',
    description: 'Vérifie quels cookies sont reçus par le serveur'
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic des cookies effectué'
  })
  async checkCookies(@Req() req: Request) {
    this.logger.log('🔍 Vérification des cookies reçus');
    
    const requestInfo = {
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host,
      userAgent: req.headers['user-agent'],
      cookieHeader: req.headers.cookie,
      parsedCookies: req.cookies,
      allCookies: Object.keys(req.cookies).length > 0 ? req.cookies : 'Aucun cookie reçu',
      timestamp: new Date().toISOString(),
    };

    this.logger.log('📋 Diagnostic des cookies:', requestInfo);

    // Vérifier les cookies de test
    const testCookies = {
      'test-basic': req.cookies['test-basic'],
      'test-samesite-none': req.cookies['test-samesite-none'],
      'test-no-domain': req.cookies['test-no-domain'],
      'test-with-domain': req.cookies['test-with-domain'],
    };

    // Vérifier les cookies d'authentification
    const authCookies = {
      'access_token': req.cookies['access_token'],
      'sb-access-token': req.cookies['sb-access-token'],
      'refresh_token': req.cookies['refresh_token'],
    };

    const analysis = {
      hasCookies: Object.keys(req.cookies).length > 0,
      totalCookies: Object.keys(req.cookies).length,
      testCookiesReceived: Object.values(testCookies).filter(v => v).length,
      authCookiesReceived: Object.values(authCookies).filter(v => v).length,
      recommendations: [] as string[],
    };

    // Générer des recommandations
    if (!analysis.hasCookies) {
      analysis.recommendations.push(
        'Aucun cookie reçu - problème de configuration cross-origin'
      );
    }
    
    if (analysis.testCookiesReceived === 0 && analysis.hasCookies) {
      analysis.recommendations.push(
        'Cookies reçus mais pas les cookies de test - problème de configuration'
      );
    }

    if (analysis.authCookiesReceived === 0) {
      analysis.recommendations.push(
        'Cookies d\'authentification manquants - utiliser les headers Authorization'
      );
    }

    if (req.headers.origin !== req.headers.referer?.replace(/\/$/, '')) {
      analysis.recommendations.push(
        'Origine et referer différents - vérifier la configuration CORS'
      );
    }

    this.logger.log('🔍 Analyse complète:', analysis);

    return {
      success: true,
      message: 'Diagnostic des cookies effectué',
      data: {
        requestInfo,
        testCookies,
        authCookies,
        analysis,
      }
    };
  }

  @Get('cors-info')
  @ApiOperation({
    summary: 'Informations CORS et configuration',
    description: 'Fournit des informations sur la configuration CORS actuelle'
  })
  @ApiResponse({
    status: 200,
    description: 'Informations CORS récupérées'
  })
  async getCorsInfo(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.logger.log('🔍 Récupération des informations CORS');

    // Ajouter les headers CORS explicites pour le diagnostic
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie, Authorization, X-Refresh-Token');

    const corsInfo = {
      requestOrigin: req.headers.origin,
      requestReferer: req.headers.referer,
      requestHost: req.headers.host,
      responseHeaders: {
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie',
        'Access-Control-Expose-Headers': 'Set-Cookie, Authorization, X-Refresh-Token',
      },
      cookieSupport: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: 'undefined (pas de restriction)',
      },
      recommendations: [
        'Utiliser SameSite=None avec Secure=true pour cross-origin',
        'Ne pas spécifier de domaine pour éviter les restrictions',
        'Vérifier que le frontend envoie les cookies avec credentials: "include"',
        'Utiliser les headers Authorization comme fallback',
      ],
    };

    this.logger.log('📋 Informations CORS:', corsInfo);

    return {
      success: true,
      message: 'Informations CORS récupérées',
      data: corsInfo
    };
  }
} 