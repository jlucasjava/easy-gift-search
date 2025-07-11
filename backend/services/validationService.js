/**
 * 🚀 ADVANCED VALIDATION SERVICE
 * Easy Gift Search - Input Validation & Sanitization
 */

const Joi = require('joi');
const { body, param, query, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const { advancedLogger } = require('./advancedLogger');

// Esquemas de validação com Joi
const validationSchemas = {
  // Validação de busca
  search: Joi.object({
    query: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Query de busca não pode estar vazia',
        'string.min': 'Query deve ter pelo menos 1 caractere',
        'string.max': 'Query não pode ter mais que 200 caracteres'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(10)
      .messages({
        'number.min': 'Limite deve ser pelo menos 1',
        'number.max': 'Limite não pode ser maior que 50'
      }),
    
    precoMin: Joi.number()
      .min(0)
      .max(1000000)
      .optional()
      .messages({
        'number.min': 'Preço mínimo deve ser 0 ou maior',
        'number.max': 'Preço mínimo muito alto'
      }),
    
    precoMax: Joi.number()
      .min(0)
      .max(1000000)
      .optional()
      .messages({
        'number.min': 'Preço máximo deve ser 0 ou maior',
        'number.max': 'Preço máximo muito alto'
      }),
    
    categoria: Joi.string()
      .valid('all', 'electronics', 'clothing', 'books', 'home', 'sports', 'toys')
      .default('all')
      .optional(),
    
    ordenacao: Joi.string()
      .valid('relevance', 'price_asc', 'price_desc', 'newest')
      .default('relevance')
      .optional(),
    
    marketplace: Joi.string()
      .valid('all', 'amazon', 'mercadolivre', 'shopee', 'aliexpress')
      .default('all')
      .optional()
  }),

  // Validação de recomendações
  recommend: Joi.object({
    age: Joi.number()
      .integer()
      .min(0)
      .max(120)
      .required()
      .messages({
        'number.min': 'Idade deve ser 0 ou maior',
        'number.max': 'Idade deve ser menor que 120'
      }),
    
    gender: Joi.string()
      .valid('male', 'female', 'unisex')
      .required()
      .messages({
        'any.only': 'Gênero deve ser male, female ou unisex'
      }),
    
    interests: Joi.array()
      .items(Joi.string().trim().min(1).max(50))
      .min(1)
      .max(10)
      .optional()
      .messages({
        'array.min': 'Pelo menos 1 interesse deve ser fornecido',
        'array.max': 'Máximo 10 interesses permitidos'
      }),
    
    budget: Joi.number()
      .min(1)
      .max(1000000)
      .required()
      .messages({
        'number.min': 'Orçamento deve ser pelo menos R$ 1',
        'number.max': 'Orçamento muito alto'
      }),
    
    occasion: Joi.string()
      .valid('birthday', 'christmas', 'valentine', 'anniversary', 'graduation', 'other')
      .default('other')
      .optional()
  }),

  // Validação de feedback
  feedback: Joi.object({
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({
        'number.min': 'Rating deve ser entre 1 e 5',
        'number.max': 'Rating deve ser entre 1 e 5'
      }),
    
    message: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Mensagem deve ter pelo menos 10 caracteres',
        'string.max': 'Mensagem não pode ter mais que 1000 caracteres'
      }),
    
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Email deve ter formato válido'
      }),
    
    productId: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
  })
};

// Middleware de validação usando express-validator
const validationRules = {
  // Validação de busca
  searchValidation: [
    query('query')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Query deve ter entre 1 e 200 caracteres')
      .escape(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit deve ser um número entre 1 e 50')
      .toInt(),
    
    query('precoMin')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço mínimo deve ser 0 ou maior')
      .toFloat(),
    
    query('precoMax')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Preço máximo deve ser 0 ou maior')
      .toFloat(),
    
    query('categoria')
      .optional()
      .isIn(['all', 'electronics', 'clothing', 'books', 'home', 'sports', 'toys'])
      .withMessage('Categoria inválida'),
    
    query('marketplace')
      .optional()
      .isIn(['all', 'amazon', 'mercadolivre', 'shopee', 'aliexpress'])
      .withMessage('Marketplace inválido')
  ],

  // Validação de recomendações
  recommendValidation: [
    body('age')
      .isInt({ min: 0, max: 120 })
      .withMessage('Idade deve ser entre 0 e 120 anos'),
    
    body('gender')
      .isIn(['male', 'female', 'unisex'])
      .withMessage('Gênero deve ser male, female ou unisex'),
    
    body('budget')
      .isFloat({ min: 1, max: 1000000 })
      .withMessage('Orçamento deve ser entre R$ 1 e R$ 1.000.000'),
    
    body('interests')
      .optional()
      .isArray({ min: 1, max: 10 })
      .withMessage('Interesses deve ser um array com 1 a 10 itens'),
    
    body('occasion')
      .optional()
      .isIn(['birthday', 'christmas', 'valentine', 'anniversary', 'graduation', 'other'])
      .withMessage('Ocasião inválida')
  ],

  // Validação de feedback
  feedbackValidation: [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating deve ser entre 1 e 5'),
    
    body('message')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Mensagem deve ter entre 10 e 1000 caracteres')
      .escape(),
    
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email deve ter formato válido')
      .normalizeEmail(),
    
    body('productId')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Product ID inválido')
  ]
};

// Classe principal de validação
class ValidationService {
  
  // Validar usando Joi
  validateWithJoi(schema, data) {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      advancedLogger.logSecurity('Validation failed', { errors, data });
      
      return { isValid: false, errors, data: null };
    }

    return { isValid: true, errors: null, data: value };
  }

  // Sanitizar HTML
  sanitizeHtml(input) {
    if (typeof input !== 'string') return input;
    
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard'
    });
  }

  // Sanitizar objeto recursivamente
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeHtml(obj);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => this.sanitizeObject(item));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = this.sanitizeHtml(value);
      }
    }
    
    return sanitized;
  }

  // Middleware para validação express-validator
  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }));

      advancedLogger.logSecurity('Express validation failed', {
        errors: errorMessages,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages,
        timestamp: new Date().toISOString()
      });
    }

    next();
  }

  // Middleware de sanitização
  sanitizeMiddleware(req, res, next) {
    // Sanitizar query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitizar body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitizar params
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  }

  // Validar parâmetros de busca
  validateSearchParams(params) {
    return this.validateWithJoi(validationSchemas.search, params);
  }

  // Validar parâmetros de recomendação
  validateRecommendParams(params) {
    return this.validateWithJoi(validationSchemas.recommend, params);
  }

  // Validar feedback
  validateFeedback(feedback) {
    return this.validateWithJoi(validationSchemas.feedback, feedback);
  }

  // Detectar tentativas de ataque
  detectMaliciousInput(input) {
    const maliciousPatterns = [
      /<script.*?>.*?<\/script>/gi,
      /javascript:/gi,
      /onload=/gi,
      /onerror=/gi,
      /onclick=/gi,
      /eval\(/gi,
      /document\.cookie/gi,
      /SELECT.*FROM/gi,
      /INSERT.*INTO/gi,
      /DROP.*TABLE/gi,
      /UNION.*SELECT/gi
    ];

    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(inputStr)) {
        advancedLogger.logSecurity('Malicious input detected', {
          input: inputStr,
          pattern: pattern.toString()
        });
        return true;
      }
    }

    return false;
  }

  // Middleware de proteção contra ataques
  securityMiddleware(req, res, next) {
    const allInput = {
      query: req.query,
      body: req.body,
      params: req.params
    };

    if (this.detectMaliciousInput(allInput)) {
      advancedLogger.logSecurity('Malicious request blocked', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Malicious input detected',
        timestamp: new Date().toISOString()
      });
    }

    next();
  }
}

// Exportar instância única
const validationService = new ValidationService();

module.exports = {
  validationService,
  validationSchemas,
  validationRules,
  ValidationService
};
