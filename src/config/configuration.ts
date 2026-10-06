export default () => ({
    port: parseInt(process.env.PORT || '3002', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },

    rabbitmq: {
        host: process.env.RABBITMQ_HOST,
        port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
        username: process.env.RABBITMQ_USERNAME,
        password: process.env.RABBITMQ_PASSWORD,
        queue: process.env.RABBITMQ_QUEUE,
        exchange: process.env.RABBITMQ_EXCHANGE,
        routingKey: process.env.RABBITMQ_ROUTING_KEY,
    },

    jwt: {
        // Spring Boot often Base64-encodes the JWT secret
        // Decode it if it's Base64, otherwise use as-is
        secret: process.env.JWT_SECRET
            ? (() => {
                try {
                    // Try to decode as Base64
                    const decoded = Buffer.from(process.env.JWT_SECRET, 'base64');
                    // Check if it's valid Base64 by re-encoding and comparing
                    if (decoded.toString('base64') === process.env.JWT_SECRET) {
                        return decoded;
                    }
                    // Not Base64, use as-is
                    return process.env.JWT_SECRET;
                } catch {
                    // If decoding fails, use as-is
                    return process.env.JWT_SECRET;
                }
            })()
            : undefined,
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },

    // Log level configuration (used by CustomLoggerService)
    logLevel: process.env.LOG_LEVEL || 'info',

    onesignal: {
        appId: process.env.ONESIGNAL_APP_ID,
        restApiKey: process.env.ONESIGNAL_REST_API_KEY,
    },
});
