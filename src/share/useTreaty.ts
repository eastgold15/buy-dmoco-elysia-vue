import { treaty } from '@elysiajs/eden'
import type { EndApp } from '@/server/+app'

// 在客户端使用当前域名和端口
const baseUrl = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.host}`
  : 'http://localhost:9004'

console.log("treaty的url", baseUrl)

const client = treaty<EndApp>(baseUrl) 

// 测试连接的异步函数
export const testConnection = async () => {
  try {
    const data = await client.api.get()
    console.log("treaty的client", data)
    return data
  } catch (error) {
    console.error("Treaty连接测试失败:", error)
    return null
  }
}

testConnection()

export default client