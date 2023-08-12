  export interface ErrorMessage {
    debugMessage: string,
    message: string,
    status: string,
    subErrors: Array<ErrorMessage> | null,
    timestamp: string
  };


  export interface FormError {
    field: string|number,
    message: string
  }
