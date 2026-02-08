/**
 * 文件存储工具
 * 支持 Vercel Blob 和 Cloudflare R2 (S3 兼容)
 */

// 使用 Vercel Blob（推荐）
export async function uploadToVercelBlob(file: File, folder: string = 'uploads'): Promise<string> {
  try {
    // 动态导入 @vercel/blob（需要先安装：npm install @vercel/blob）
    const { put } = await import('@vercel/blob');
    
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });
    
    return blob.url;
  } catch (error) {
    console.error('Vercel Blob upload failed:', error);
    throw new Error('文件上传失败');
  }
}

// 使用 Cloudflare R2 / AWS S3
export async function uploadToS3(file: File, folder: string = 'uploads'): Promise<string> {
  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'auto',
      endpoint: process.env.AWS_ENDPOINT, // Cloudflare R2 endpoint
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${folder}/${Date.now()}-${file.name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // 返回公开访问 URL
    if (process.env.AWS_ENDPOINT) {
      // Cloudflare R2
      return `${process.env.AWS_ENDPOINT}/${process.env.AWS_S3_BUCKET}/${key}`;
    } else {
      // AWS S3
      return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new Error('文件上传失败');
  }
}

// 统一上传接口（自动选择存储方式）
export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
  // 优先使用 Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return uploadToVercelBlob(file, folder);
  }
  
  // 备选使用 S3/R2
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return uploadToS3(file, folder);
  }
  
  throw new Error('未配置文件存储服务');
}

// 删除文件
export async function deleteFile(url: string): Promise<void> {
  try {
    if (url.includes('vercel-storage.com')) {
      // Vercel Blob
      const { del } = await import('@vercel/blob');
      await del(url);
    } else {
      // S3/R2
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'auto',
        endpoint: process.env.AWS_ENDPOINT,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      // 从 URL 提取 key
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1);

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
        })
      );
    }
  } catch (error) {
    console.error('Delete file failed:', error);
    throw new Error('文件删除失败');
  }
}
