/**
 * 测试带 <br> 标签的私钥是否能正确生成JWT
 */

const { generateQWeatherTokenFromKey } = require('./utils/qweather-jwt')

// 模拟云托管环境变量（带<br>标签）
const privateKeyWithBr = '-----BEGIN PRIVATE KEY-----<br>MC4CAQAwBQYDK2VwBCIEIHTz0h6b9VninF2+131n0ekKzDRi0NvKRARA7obeqAbm<br>-----END PRIVATE KEY-----<br>'

// 正确的私钥格式（带换行符）
const privateKeyCorrect = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIHTz0h6b9VninF2+131n0ekKzDRi0NvKRARA7obeqAbm
-----END PRIVATE KEY-----
`

const kid = 'CE5AYF96K5'
const sub = '288AH4E373'

console.log('============================================================')
console.log('测试JWT生成 - 不同私钥格式')
console.log('============================================================\n')

// 测试1: 带<br>标签的私钥
console.log('1️⃣  测试带<br>标签的私钥...')
try {
  // 手动替换 <br> 为 \n（模拟 qweather-jwt.js 中的处理）
  const processedKey = privateKeyWithBr.replace(/<br>/g, '\n').replace(/<br\/>/g, '\n')
  console.log('处理后的私钥:')
  console.log(processedKey)
  console.log('私钥长度:', processedKey.length)
  
  const token = generateQWeatherTokenFromKey(kid, sub, processedKey)
  console.log('✅ JWT生成成功!')
  console.log('Token:', token.substring(0, 50) + '...')
} catch (error) {
  console.log('❌ JWT生成失败:', error.message)
}

console.log('\n2️⃣  测试正确格式的私钥...')
try {
  const token = generateQWeatherTokenFromKey(kid, sub, privateKeyCorrect)
  console.log('✅ JWT生成成功!')
  console.log('Token:', token.substring(0, 50) + '...')
} catch (error) {
  console.log('❌ JWT生成失败:', error.message)
}

console.log('\n3️⃣  测试实际调用和风天气API...')
const axios = require('axios')

async function testRealAPI() {
  try {
    // 使用处理后的私钥生成token
    const processedKey = privateKeyWithBr.replace(/<br>/g, '\n').replace(/<br\/>/g, '\n')
    const token = generateQWeatherTokenFromKey(kid, sub, processedKey)
    
    console.log('使用生成的JWT调用和风天气API...')
    const response = await axios.get('https://devapi.qweather.com/v7/weather/now', {
      params: {
        location: '101010100'  // 北京
      },
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
      validateStatus: () => true
    })
    
    console.log('状态码:', response.status)
    if (response.status === 200) {
      console.log('✅ API调用成功!')
      console.log('天气数据:', JSON.stringify(response.data, null, 2))
    } else {
      console.log('❌ API调用失败')
      console.log('响应:', JSON.stringify(response.data, null, 2))
    }
  } catch (error) {
    console.log('❌ API调用异常:', error.message)
  }
}

testRealAPI().then(() => {
  console.log('\n============================================================')
})

