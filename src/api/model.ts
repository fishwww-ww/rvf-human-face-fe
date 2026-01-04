import { get, post } from "./request";

// 类型定义
export interface PingResponse {
  status: "ok";
}

export interface GetModelResponse {
  models: string[];
}

export interface PredictResponse {
  label: "real" | "fake";
  confidence: number;
  probs: {
    fake: number;
    real: number;
  };
  model: string;
}

export interface TrainResponse {
  status: "ok" | "error";
  epochs?: number;
  images?: {
    "train_loss_curve.png": string;
    "train_acc_curve.png": string;
    "train_feature_maps.png": string;
    "train_gradcam.png": string;
  };
  stdout?: string;
  message?: string;
  stderr?: string;
}

export interface PredictParams {
  image: File;
  model?: string;
}

export interface TrainParams {
  epoch?: number;
}

/**
 * 健康检查接口
 * @returns 返回服务状态
 */
export function ping(): Promise<PingResponse> {
  return get<PingResponse>("/ping", null).then((res) => res.data);
}

/**
 * 获取模型列表接口
 * @returns 返回所有模型文件名列表
 */
export function getModel(): Promise<GetModelResponse> {
  // 响应拦截器已经返回了 response.data，所以 get 返回的就是后端数据本身 { models: [...] }
  // 但由于类型定义是 CommonResponse<T>，需要使用类型断言
  return get<GetModelResponse>("/getModel", null) as unknown as Promise<GetModelResponse>;
}

/**
 * 图像预测接口
 * @param params - 预测参数，包含图像文件和可选的模型名称
 * @returns 返回预测结果
 */
export function predict(params: PredictParams): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append("image", params.image);
  if (params.model) {
    formData.append("model", params.model);
  }

  // axios 会自动检测 FormData 并设置正确的 Content-Type
  // 响应拦截器已经返回了 response.data，所以这里需要访问 res.data
  return post<PredictResponse>("/predict", formData) as unknown as Promise<PredictResponse>;
}

/**
 * 训练接口
 * @param params - 训练参数，包含可选的训练轮数
 * @returns 返回训练结果和可视化图片
 */
export function train(params?: TrainParams): Promise<TrainResponse> {
  // 可以通过 JSON 或 FormData 传递参数，这里使用 JSON 格式
  const data = params?.epoch ? { epoch: params.epoch } : {};
  // 响应拦截器已经返回了 response.data，所以这里需要访问 res.data
  return post<TrainResponse>("/train", data) as unknown as Promise<TrainResponse>;
}
