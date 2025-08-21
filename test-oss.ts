/**
 * OSS服务测试脚本
 * 测试华为云OSS服务的各项功能
 */

import { ossService } from './src/server/src/routes/oss/index.ts';

async function testOSSService() {
  console.log('🧪 开始测试OSS服务...');
  
  try {
    // 测试1: 上传文件
    console.log('\n📤 测试文件上传...');
    const testContent = 'Hello, OSS Test!';
    const testKey = 'test/test-file.txt';
    const uploadResult = await ossService.uploadFile(
      Buffer.from(testContent),
      testKey,
      'text/plain'
    );
    console.log('✅ 文件上传成功:', uploadResult);
    
    // 测试2: 检查文件是否存在
    console.log('\n🔍 测试文件存在性检查...');
    const exists = await ossService.fileExists(testKey);
    console.log('✅ 文件存在性检查:', exists);
    
    // 测试3: 获取文件信息
    console.log('\n📊 测试获取文件信息...');
    const fileStats = await ossService.getFileStats(testKey);
    console.log('✅ 文件信息:', fileStats);
    
    // 测试4: 生成预签名URL
    console.log('\n🔗 测试生成预签名URL...');
    const uploadUrl = ossService.generatePresignedUploadUrl(testKey, 3600);
    const downloadUrl = ossService.generatePresignedDownloadUrl(testKey, 3600);
    console.log('✅ 预签名上传URL:', uploadUrl);
    console.log('✅ 预签名下载URL:', downloadUrl);
    
    // 测试5: 获取公共URL
    console.log('\n🌐 测试获取公共URL...');
    const publicUrl = ossService.getPublicUrl(testKey);
    console.log('✅ 公共URL:', publicUrl);
    
    // 测试6: 上传图片
    console.log('\n🖼️ 测试图片上传...');
    const imageBuffer = Buffer.from('fake-image-data');
    const imageUrl = await ossService.uploadImage(
      imageBuffer,
      'test-images',
      'test.jpg'
    );
    console.log('✅ 图片上传成功:', imageUrl);
    
    // 测试7: 删除文件
    console.log('\n🗑️ 测试文件删除...');
    await ossService.deleteFile(testKey);
    console.log('✅ 文件删除成功');
    
    // 验证删除后文件不存在
    const existsAfterDelete = await ossService.fileExists(testKey);
    console.log('✅ 删除后文件存在性:', existsAfterDelete);
    
    console.log('\n🎉 所有OSS服务测试完成!');
    
  } catch (error) {
    console.error('❌ OSS服务测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testOSSService().catch(console.error);