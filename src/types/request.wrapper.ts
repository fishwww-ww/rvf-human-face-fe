export interface CommonResponse<T> {
    data: T;
    message: string;
    code: number;
  }
  
  export interface RequestResponse<D> {
    data: D;
    requestId: string;
  }
  
  export interface RequestError {
    code: number;
    message: string;
  }