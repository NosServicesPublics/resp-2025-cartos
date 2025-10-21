/**
 * Structured error classes for the Atlas Composer application
 */

export class AtlasComposerError extends Error {
  public readonly code: string
  public readonly userMessage: string
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    code: string,
    userMessage: string,
    context?: Record<string, any>,
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.userMessage = userMessage
    this.context = context
  }
}

export class DataLoadError extends AtlasComposerError {
  constructor(
    dataSource: string,
    cause?: Error,
    context?: Record<string, any>,
  ) {
    const message = `Failed to load data from ${dataSource}${cause ? `: ${cause.message}` : ''}`
    const userMessage = `Impossible de charger les données depuis ${dataSource}. Veuillez vérifier votre connexion internet et réessayer.`

    super(message, 'DATA_LOAD_ERROR', userMessage, {
      dataSource,
      cause: cause?.message,
      ...context,
    })
  }
}

export class ServiceInitializationError extends AtlasComposerError {
  constructor(
    serviceId: string,
    cause?: Error,
    context?: Record<string, any>,
  ) {
    const message = `Failed to initialize service ${serviceId}${cause ? `: ${cause.message}` : ''}`
    const userMessage = `Erreur lors de l'initialisation du service de carte "${serviceId}". Veuillez recharger la page.`

    super(message, 'SERVICE_INIT_ERROR', userMessage, {
      serviceId,
      cause: cause?.message,
      ...context,
    })
  }
}

export class ValidationError extends AtlasComposerError {
  constructor(
    field: string,
    value: any,
    expected: string,
    context?: Record<string, any>,
  ) {
    const message = `Validation failed for field "${field}": expected ${expected}, got ${typeof value}`
    const userMessage = `Données invalides détectées. Veuillez recharger la page ou contacter le support.`

    super(message, 'VALIDATION_ERROR', userMessage, {
      field,
      value,
      expected,
      ...context,
    })
  }
}

export class GeodataError extends AtlasComposerError {
  constructor(
    operation: string,
    cause?: Error,
    context?: Record<string, any>,
  ) {
    const message = `Geographic data operation failed: ${operation}${cause ? `: ${cause.message}` : ''}`
    const userMessage = `Erreur lors du traitement des données géographiques. Veuillez recharger la page.`

    super(message, 'GEODATA_ERROR', userMessage, {
      operation,
      cause: cause?.message,
      ...context,
    })
  }
}

export class ConfigurationError extends AtlasComposerError {
  constructor(
    configType: string,
    issue: string,
    context?: Record<string, any>,
  ) {
    const message = `Configuration error in ${configType}: ${issue}`
    const userMessage = `Erreur de configuration détectée. Veuillez contacter le support technique.`

    super(message, 'CONFIG_ERROR', userMessage, {
      configType,
      issue,
      ...context,
    })
  }
}

/**
 * Error handling utilities
 */
export class ErrorHandler {
  /**
   * Safely execute an async operation with error handling
   */
  static async safeAsync<T>(
    operation: () => Promise<T>,
    errorFactory: (error: Error) => AtlasComposerError,
  ): Promise<T> {
    try {
      return await operation()
    }
    catch (error) {
      const wrappedError = errorFactory(error instanceof Error ? error : new Error(String(error)))
      console.error('Safe async operation failed:', wrappedError)
      throw wrappedError
    }
  }

  /**
   * Safely execute a sync operation with error handling
   */
  static safe<T>(
    operation: () => T,
    errorFactory: (error: Error) => AtlasComposerError,
  ): T {
    try {
      return operation()
    }
    catch (error) {
      const wrappedError = errorFactory(error instanceof Error ? error : new Error(String(error)))
      console.error('Safe operation failed:', wrappedError)
      throw wrappedError
    }
  }

  /**
   * Log error with context for debugging
   */
  static logError(error: AtlasComposerError): void {
    console.group(`🚨 ${error.name}`)
    console.error('Message:', error.message)
    console.error('Code:', error.code)
    console.error('User Message:', error.userMessage)
    if (error.context) {
      console.error('Context:', error.context)
    }
    console.error('Stack:', error.stack)
    console.groupEnd()
  }

  /**
   * Create a user-friendly error message from any error
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof AtlasComposerError) {
      return error.userMessage
    }
    if (error instanceof Error) {
      return 'Une erreur inattendue s\'est produite. Veuillez recharger la page.'
    }
    return 'Erreur inconnue. Veuillez recharger la page.'
  }

  /**
   * Check if error should be retried automatically
   */
  static isRetryable(error: AtlasComposerError): boolean {
    return error.code === 'DATA_LOAD_ERROR'
  }
}
