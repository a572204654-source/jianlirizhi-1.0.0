const mysql = require('mysql2/promise');
const config = require('./index');

// 输出数据库连接配置信息（隐藏密码）
console.log('==================================');
console.log('数据库连接配置:');
console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
console.log(`地址: ${config.database.host}:${config.database.port}`);
console.log(`数据库: ${config.database.database}`);
console.log(`用户: ${config.database.user}`);
console.log(`连接类型: ${process.env.NODE_ENV === 'production' ? '内网' : '外网'}`);
console.log('==================================');

// 创建数据库连接池
const pool = mysql.createPool(config.database);

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ 数据库连接失败:', error.message);
    return false;
  }
}

// 执行查询
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 执行事务
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};

