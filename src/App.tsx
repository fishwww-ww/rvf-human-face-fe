import { useState } from "react";
import { useRequest } from "ahooks";
import {
  Card,
  InputNumber,
  Button,
  Select,
  Typography,
  Spin,
  Notification,
} from "@douyinfe/semi-ui";
import { getModel, predict, train, type TrainResponse } from "./api/model";

const { Title, Text, Paragraph } = Typography;

function App() {
  // 训练相关状态
  const [epoch, setEpoch] = useState<number>(2);

  // 预测相关状态
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // 获取模型列表
  const {
    data: modelListData,
    loading: modelListLoading,
    run: fetchModels,
  } = useRequest(
    async () => {
      const response = await getModel();
      return response;
    },
    {
      manual: true,
      onError: (error) => {
        Notification.error({
          title: "获取模型列表失败",
          content: error?.message || "未知错误",
          duration: 3,
        });
      },
    }
  );

  // 训练请求
  const {
    data: trainData,
    loading: trainLoading,
    run: runTrain,
  } = useRequest(
    async () => {
      const response = await train({ epoch });
      return response;
    },
    {
      manual: true,
      onSuccess: (data: TrainResponse) => {
        if (data.status === "ok") {
          Notification.success({
            title: "训练完成",
            content: `训练已完成，共 ${data.epochs} 轮`,
            duration: 3,
          });
        } else {
          Notification.error({
            title: "训练失败",
            content: data.message || "训练过程中出现错误",
            duration: 5,
          });
        }
      },
      onError: (error) => {
        Notification.error({
          title: "训练失败",
          content: error?.message || "未知错误",
          duration: 5,
        });
      },
    }
  );

  // 预测请求
  const {
    data: predictData,
    loading: predictLoading,
    run: runPredict,
  } = useRequest(
    async () => {
      if (!uploadedFile) {
        throw new Error("请先上传图片");
      }
      const response = await predict({
        image: uploadedFile,
        model: selectedModel || undefined,
      });
      return response;
    },
    {
      manual: true,
      onSuccess: () => {
        Notification.success({
          title: "预测完成",
          content: "预测结果已生成",
          duration: 3,
        });
      },
      onError: (error) => {
        Notification.error({
          title: "预测失败",
          content: error?.message || "未知错误",
          duration: 3,
        });
      },
    }
  );

  const handleTrain = () => {
    if (epoch && epoch > 0) {
      runTrain();
    } else {
      Notification.warning({
        title: "参数错误",
        content: "请输入有效的训练轮数（大于0）",
        duration: 3,
      });
    }
  };

  const handlePredict = () => {
    if (!uploadedFile) {
      Notification.warning({
        title: "缺少文件",
        content: "请先上传图片文件",
        duration: 3,
      });
      return;
    }
    runPredict();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    } else {
      setUploadedFile(null);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        background: "var(--semi-color-bg-0)",
      }}
    >
      <Title heading={1} style={{ marginBottom: "24px", textAlign: "center" }}>
        人脸真伪检测系统
      </Title>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* 训练模块 */}
        <Card
          title="模型训练"
          bodyStyle={{ padding: "20px", overflow: "visible" }}
          style={{ overflow: "visible" }}
        >
          <div style={{ marginBottom: "16px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              训练轮数 (Epoch)
            </Text>
            <InputNumber
              value={epoch}
              onChange={(value) => setEpoch(value as number)}
              min={1}
              style={{ width: "100%" }}
              placeholder="请输入训练轮数"
            />
          </div>

          <Button
            theme="solid"
            type="primary"
            onClick={handleTrain}
            loading={trainLoading}
            disabled={trainLoading}
            style={{ width: "100%", marginBottom: "20px" }}
          >
            开始训练
          </Button>

          {trainLoading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="large" />
              <Text style={{ display: "block", marginTop: "12px" }}>
                训练中，请稍候...
              </Text>
            </div>
          )}

          {trainData && !trainLoading && (
            <div>
              <Title
                heading={4}
                style={{ marginTop: "20px", marginBottom: "12px" }}
              >
                训练结果
              </Title>

              {trainData.status === "ok" ? (
                <>
                  <Paragraph>
                    <Text strong>状态：</Text>
                    <Text type="success">训练成功</Text>
                  </Paragraph>
                  {trainData.epochs && (
                    <Paragraph>
                      <Text strong>训练轮数：</Text>
                      <Text>{trainData.epochs}</Text>
                    </Paragraph>
                  )}

                  {trainData.stdout && (
                    <div style={{ marginTop: "12px", marginBottom: "16px" }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: "8px" }}
                      >
                        训练输出：
                      </Text>
                      <div
                        style={{
                          background: "var(--semi-color-fill-0)",
                          padding: "12px",
                          borderRadius: "4px",
                          maxHeight: "200px",
                          overflow: "auto",
                          fontSize: "12px",
                          fontFamily: "monospace",
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {trainData.stdout}
                        </pre>
                      </div>
                    </div>
                  )}

                  {trainData.images && (
                    <div style={{ marginTop: "16px", overflow: "visible" }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: "12px" }}
                      >
                        训练可视化：
                      </Text>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "16px",
                          overflow: "visible",
                        }}
                      >
                        {Object.entries(trainData.images).map(
                          ([key, base64Data]) => (
                            <div
                              key={key}
                              style={{
                                border: "1px solid var(--semi-color-border)",
                                borderRadius: "8px",
                                padding: "12px",
                                background: "var(--semi-color-bg-1)",
                                display: "flex",
                                flexDirection: "column",
                                overflow: "visible",
                                minHeight: "200px",
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  display: "block",
                                  marginBottom: "12px",
                                  fontSize: "14px",
                                }}
                              >
                                {key
                                  .replace(".png", "")
                                  .replace(/_/g, " ")
                                  .replace(/train /gi, "")
                                  .split(" ")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(" ")}
                              </Text>
                              <div
                                style={{
                                  width: "100%",
                                  flex: 1,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "flex-start",
                                  overflow: "visible",
                                  minHeight: "150px",
                                }}
                              >
                                <img
                                  src={base64Data}
                                  alt={key}
                                  style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    objectFit: "contain",
                                    display: "block",
                                  }}
                                  onClick={() => {
                                    const newWindow = window.open();
                                    if (newWindow) {
                                      newWindow.document.write(
                                        `<img src="${base64Data}" style="max-width: 100%; height: auto;" />`
                                      );
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <Paragraph>
                    <Text strong>状态：</Text>
                    <Text type="danger">训练失败</Text>
                  </Paragraph>
                  {trainData.message && (
                    <Paragraph>
                      <Text strong>错误信息：</Text>
                      <Text type="danger">{trainData.message}</Text>
                    </Paragraph>
                  )}
                  {trainData.stderr && (
                    <div style={{ marginTop: "12px" }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: "8px" }}
                      >
                        错误输出：
                      </Text>
                      <div
                        style={{
                          background: "var(--semi-color-fill-0)",
                          padding: "12px",
                          borderRadius: "4px",
                          maxHeight: "200px",
                          overflow: "auto",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          color: "var(--semi-color-danger)",
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {trainData.stderr}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* 预测模块 */}
        <Card
          title="图像预测"
          bodyStyle={{ padding: "20px", overflow: "visible" }}
          style={{ overflow: "visible" }}
        >
          <div style={{ marginBottom: "16px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              选择模型
            </Text>
            <Select
              placeholder="点击加载模型列表"
              value={selectedModel}
              onChange={(value) => setSelectedModel(value as string)}
              onFocus={fetchModels}
              loading={modelListLoading}
              style={{ width: "100%" }}
              filter
              showClear
            >
              {modelListData?.models?.map((model) => (
                <Select.Option key={model} value={model}>
                  {model}
                </Select.Option>
              ))}
            </Select>
            {modelListData?.models && modelListData.models.length === 0 && (
              <Text
                type="tertiary"
                style={{
                  fontSize: "12px",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                暂无可用模型
              </Text>
            )}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              上传图片
            </Text>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-upload-input"
            />
            <Button
              theme="light"
              style={{ width: "100%" }}
              onClick={() => {
                const input = document.getElementById(
                  "file-upload-input"
                ) as HTMLInputElement;
                input?.click();
              }}
            >
              选择图片文件
            </Button>
            {uploadedFile && (
              <Text
                type="tertiary"
                style={{
                  fontSize: "12px",
                  marginTop: "8px",
                  display: "block",
                }}
              >
                已选择: {uploadedFile.name}
              </Text>
            )}
          </div>

          {uploadedFile && (
            <div style={{ marginBottom: "16px", overflow: "visible" }}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                图片预览：
              </Text>
              <div
                style={{
                  border: "1px solid var(--semi-color-border)",
                  borderRadius: "8px",
                  padding: "12px",
                  background: "var(--semi-color-bg-1)",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  overflow: "visible",
                  minHeight: "200px",
                }}
              >
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="预览"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "600px",
                    width: "auto",
                    height: "auto",
                    borderRadius: "4px",
                    objectFit: "contain",
                    cursor: "pointer",
                    display: "block",
                  }}
                  onClick={() => {
                    const newWindow = window.open();
                    if (newWindow && uploadedFile) {
                      const url = URL.createObjectURL(uploadedFile);
                      newWindow.document.write(
                        `<img src="${url}" style="max-width: 100%; height: auto;" />`
                      );
                    }
                  }}
                />
              </div>
            </div>
          )}

          <Button
            theme="solid"
            type="primary"
            onClick={handlePredict}
            loading={predictLoading}
            disabled={predictLoading || !uploadedFile}
            style={{ width: "100%", marginBottom: "20px" }}
          >
            开始预测
          </Button>

          {predictLoading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="large" />
              <Text style={{ display: "block", marginTop: "12px" }}>
                预测中，请稍候...
              </Text>
            </div>
          )}

          {predictData && !predictLoading && (
            <div>
              <Title
                heading={4}
                style={{ marginTop: "20px", marginBottom: "12px" }}
              >
                预测结果
              </Title>

              <Paragraph>
                <Text strong>预测标签：</Text>
                <Text
                  type={predictData.label === "real" ? "success" : "danger"}
                  style={{ fontSize: "16px", fontWeight: "bold" }}
                >
                  {predictData.label === "real" ? "真实" : "虚假"}
                </Text>
              </Paragraph>

              <Paragraph>
                <Text strong>置信度：</Text>
                <Text>{(predictData.confidence * 100).toFixed(2)}%</Text>
              </Paragraph>

              <Paragraph>
                <Text strong>概率分布：</Text>
              </Paragraph>
              <div style={{ marginLeft: "16px", marginTop: "8px" }}>
                <Paragraph>
                  <Text>真实 (real): </Text>
                  <Text type="success">
                    {(predictData.probs.real * 100).toFixed(2)}%
                  </Text>
                </Paragraph>
                <Paragraph>
                  <Text>虚假 (fake): </Text>
                  <Text type="danger">
                    {(predictData.probs.fake * 100).toFixed(2)}%
                  </Text>
                </Paragraph>
              </div>

              {predictData.model && (
                <Paragraph>
                  <Text strong>使用的模型：</Text>
                  <Text>{predictData.model}</Text>
                </Paragraph>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default App;
