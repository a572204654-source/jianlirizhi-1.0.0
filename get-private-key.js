/**
 * 读取私钥并转换为 \n 格式
 */

const fs = require('fs')

// 读取私钥文件
const privateKey = fs.readFileSync('ed25519-private.pem', 'utf8')

// 转换为使用 \n 的格式
const privateKeyWithBackslashN = privateKey.replace(/\n/g, '\\n').trim()

console.log('私钥（使用 \\n 格式）:')
console.log('============================================================')
console.log(privateKeyWithBackslashN)
console.log('============================================================')

