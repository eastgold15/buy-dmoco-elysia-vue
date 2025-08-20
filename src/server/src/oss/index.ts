/**
 * 华为云OSS服务模块
 * 使用Bun原生S3 API实现文件上传和管理
 */

// import { env, S3Client } from "bun";
import { envConfig } from "../config/env";

// 使用条件导入避免SSR错误
let S3Client: any;
try {
  if (typeof Bun !== 'undefined') {
    const bunModule = await import('bun');
    S3Client = bunModule.S3Client;
  }
} catch (error) {
  console.warn('Bun S3Client not available in SSR environment');
}

// 华为云OSS配置接口
interface HuaweiOSSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
  region?: string;
}

// 从环境变量获取华为云OSS配置
const getOSSConfig = (): HuaweiOSSConfig => {
  return {
    accessKeyId: envConfig.get('HUAWEI_ACCESS_KEY_ID') || "",
    secretAccessKey: envConfig.get('HUAWEI_SECRET_ACCESS_KEY') || "",
    bucket: envConfig.get('HUAWEI_BUCKET') || "",
    endpoint: envConfig.get('HUAWEI_ENDPOINT') || "",
    region: envConfig.get('HUAWEI_REGION') || "cn-north-4"
  };
};

// 创建华为云OSS客户端
const createOSSClient = () => {
  const config = getOSSConfig();

  if (!config.accessKeyId || !config.secretAccessKey || !config.bucket || !config.endpoint) {
    throw new Error("华为云OSS配置不完整，请检查环境变量");
  }

  if (!S3Client) {
    throw new Error("S3Client不可用，可能在SSR环境中");
  }

  return new S3Client({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    bucket: config.bucket,
    endpoint: config.endpoint,
    region: config.region
  });
};

// OSS服务类
export class HuaweiOSSService {
  private client: S3Client;
  private config: HuaweiOSSConfig;

  constructor() {
    this.config = getOSSConfig();
    try {
      this.client = createOSSClient();
    } catch (error) {
      console.warn('OSS客户端初始化失败:', error);
      this.client = null as any;
    }
  }

  /**
   * 上传文件到OSS
   * @param file 文件内容 (Buffer, Uint8Array, string等)
   * @param key 文件在OSS中的路径
   * @param contentType 文件类型
   * @returns 上传后的文件URL
   */
  async uploadFile(
    file: Buffer | Uint8Array | string | Blob,
    key: string,
    contentType?: string
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OSS客户端不可用');
    }
    
    try {
      const s3File = this.client.file(key);

      // 上传文件
      await s3File.write(file, {
        type: contentType || "application/octet-stream"
      });

      // 返回文件的公共访问URL
      return this.getPublicUrl(key);
    } catch (error) {
      console.error("文件上传失败:", error);
      throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 上传图片文件
   * @param imageFile 图片文件
   * @param folder 存储文件夹 (如: 'news', 'products', 'advertisements')
   * @param filename 文件名 (可选，不提供则自动生成)
   * @returns 上传后的图片URL
   */
  async uploadImage(
    imageFile: Buffer | Uint8Array | Blob,
    folder: string,
    filename?: string
  ): Promise<string> {
    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const finalFilename = filename || `${timestamp}_${randomStr}.jpg`;

    // 构建文件路径
    const key = `images/${folder}/${finalFilename}`;

    // 确定内容类型
    let contentType = "image/jpeg";
    if (filename) {
      const ext = filename.toLowerCase().split('.').pop();
      switch (ext) {
        case 'png':
          contentType = "image/png";
          break;
        case 'gif':
          contentType = "image/gif";
          break;
        case 'webp':
          contentType = "image/webp";
          break;
        default:
          contentType = "image/jpeg";
      }
    }

    return await this.uploadFile(imageFile, key, contentType);
  }

  /**
   * 删除文件
   * @param key 文件在OSS中的路径
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('OSS客户端不可用');
    }
    
    try {
      const s3File = this.client.file(key);
      await s3File.delete();
    } catch (error) {
      console.error("文件删除失败:", error);
      throw new Error(`文件删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查文件是否存在
   * @param key 文件在OSS中的路径
   * @returns 文件是否存在
   */
  async fileExists(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('OSS客户端不可用');
    }
    
    try {
      const s3File = this.client.file(key);
      return await s3File.exists();
    } catch (error) {
      console.error("检查文件存在性失败:", error);
      return false;
    }
  }

  /**
   * 生成预签名URL用于直接上传
   * @param key 文件在OSS中的路径
   * @param expiresIn 过期时间(秒)
   * @param contentType 文件类型
   * @returns 预签名URL
   */
  generatePresignedUploadUrl(
    key: string,
    expiresIn: number = 3600,
    contentType?: string
  ): string {
    if (!this.client) {
      throw new Error('OSS客户端不可用');
    }
    
    const s3File = this.client.file(key);
    return s3File.presign({
      method: "PUT",
      expiresIn,
      type: contentType || "application/octet-stream"
    });
  }

  /**
   * 生成预签名下载URL
   * @param key 文件在OSS中的路径
   * @param expiresIn 过期时间(秒)
   * @returns 预签名下载URL
   */
  generatePresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): string {
    if (!this.client) {
      throw new Error('OSS客户端不可用');
    }
    
    const s3File = this.client.file(key);
    return s3File.presign({
      method: "GET",
      expiresIn
    });
  }

  /**
   * 获取文件的公共访问URL
   * @param key 文件在OSS中的路径
   * @returns 公共访问URL
   */
  getPublicUrl(key: string): string {
    // 华为云OSS的公共访问URL格式
    const { endpoint, bucket } = this.config;
    return `${endpoint}/${bucket}/${key}`;
  }

  /**
   * 获取文件信息
   * @param key 文件在OSS中的路径
   * @returns 文件统计信息
   */
  async getFileStats(key: string) {
    if (!this.client) {
      throw new Error('OSS客户端不可用');
    }
    
    try {
      const s3File = this.client.file(key);
      return await s3File.stat();
    } catch (error) {
      console.error("获取文件信息失败:", error);
      throw new Error(`获取文件信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 导出单例实例
export const ossService = new HuaweiOSSService();

// 导出便捷方法
export const uploadImage = ossService.uploadImage.bind(ossService);
export const uploadFile = ossService.uploadFile.bind(ossService);
export const deleteFile = ossService.deleteFile.bind(ossService);
export const fileExists = ossService.fileExists.bind(ossService);
export const getPublicUrl = ossService.getPublicUrl.bind(ossService);

export default ossService;