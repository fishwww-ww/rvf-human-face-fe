import type { CommonResponse } from "../types/request.wrapper";
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  timeout: 10000,
});

// instance.interceptors.request.use(

// );

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Sentry.captureException(error);

    if (error.response?.status) {
      switch (error.response.status) {
        case 401: {
          //unauthorized
          console.log("[Request]未登陆", error.response.data);
          break;
        }
        case 400: {
          console.log("[Request]业务错误", error.response.data);
          break;
        }
        case 402: {
          console.log("[Request]您的账号已被禁用", error.response.data);
          break;
        }
        case 403: {
          //forbidden
          console.log("[Request]访问未经授权的资源", error.response.data);
          break;
        }
        case 500: {
          console.log("[Request]internal server error", error.response.data);
          break;
        }
        default: {
          console.log(
            "[Request]请求正常返回，但是出现未知错误",
            error.response.data ||
              error.response.data.message ||
              error.response.data.toString() ||
              error.message
          );
        }
      }
    } else {
      console.log(
        "[Request]请求失败，未知错误",
        error.response?.data?.toString() || error.message || ""
      );
      return Promise.reject({
        code: 500000,
        message:
          error.response?.data?.toString() || error.message || "unsorted error",
      });
    }
    return Promise.reject(error.response.data);
  }
);

export function get<T>(
  url: string,
  params: Record<string, unknown> | null = null
): Promise<CommonResponse<T>> {
  return instance.get(url, {
    params,
  });
}

/**
 * post请求
 * @param url - 请求地址
 * @param data - 请求数据
 */
export function post<T>(url: string, data = {}): Promise<CommonResponse<T>> {
  return instance.post(url, data);
}

/**
 * put请求
 * @param url - 请求地址
 * @param data - 请求数据
 */
export function put<T>(url: string, data = {}): Promise<CommonResponse<T>> {
  return instance.put(url, data);
}

/**
 * patch请求
 * @param url - 请求地址
 * @param data - 请求数据
 */
export function patch<T>(url: string, data = {}): Promise<CommonResponse<T>> {
  return instance.patch(url, data);
}

/**
 * delete请求
 * @param url - 请求地址
 * @param data - 请求数据
 */
export function del<T>(url: string, data = {}): Promise<CommonResponse<T>> {
  return instance.delete(url, { data });
}
