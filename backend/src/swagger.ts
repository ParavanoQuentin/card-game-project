import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aether Beasts API',
      version: '1.0.0',
      description: 'API documentation for the Aether Beasts card game backend',
      contact: {
        name: 'Aether Beasts Team',
        email: 'support@aetherbeasts.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.aetherbeasts.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user-123'
            },
            username: {
              type: 'string',
              example: 'player1'
            },
            email: {
              type: 'string',
              example: 'player1@example.com'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Card: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'card-123'
            },
            name: {
              type: 'string',
              example: 'Dragon'
            },
            mythology: {
              type: 'string',
              enum: ['greek', 'norse', 'egyptian', 'chinese'],
              example: 'greek'
            },
            cost: {
              type: 'integer',
              example: 5
            },
            power: {
              type: 'integer',
              example: 8
            },
            health: {
              type: 'integer',
              example: 10
            },
            type: {
              type: 'string',
              example: 'creature'
            },
            description: {
              type: 'string',
              example: 'A powerful dragon creature'
            },
            image: {
              type: 'string',
              example: '/images/cards/greek/dragon.svg'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'player1'
            },
            password: {
              type: 'string',
              example: 'password123'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'player1'
            },
            email: {
              type: 'string',
              example: 'player1@example.com'
            },
            password: {
              type: 'string',
              example: 'password123'
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
              example: 'oldpassword123'
            },
            newPassword: {
              type: 'string',
              example: 'newpassword123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Authentication successful'
            },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            },
            error: {
              type: 'string',
              example: 'Detailed error message'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK'
            },
            message: {
              type: 'string',
              example: 'Aether Beasts API is running'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'API health check endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Cards',
        description: 'Card game data and mythology'
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints (admin only)'
      },
      {
        name: 'Game',
        description: 'Game-related endpoints'
      }
    ]
  },
  apis: ['./src/index.ts', './src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
