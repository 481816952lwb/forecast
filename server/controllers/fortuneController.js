const axios = require('axios');
const moment = require('moment');
const NodeCache = require('node-cache');
const { calculateLuckyNumber, generateDailyFortune } = require('../utils/fortuneUtils');

// 缓存设置 (24小时)
const fortuneCache = new NodeCache({ stdTTL: 86400 });

/**
 * DeepSeek API调用函数
 */
async function callDeepSeekAPI(prompt) {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一位专业的财运分析师，精通中国传统财运算法和现代财富管理知识。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    throw new Error('无法获取AI财运分析');
  }
}

/**
 * 获取财运预测
 */
exports.getFortunePredict = async (req, res) => {
  try {
    const { name, birthdate } = req.body;
    
    if (!name || !birthdate) {
      return res.status(400).json({ message: '姓名和生日是必须的' });
    }
    
    // 缓存键
    const cacheKey = `${name}_${birthdate}`;
    
    // 检查缓存
    const cachedResult = fortuneCache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    // 基于生日的数理计算
    const luckyNumber = calculateLuckyNumber(birthdate);
    
    // 生成日期序列
    const today = moment();
    const nextWeek = [];
    
    for (let i = 0; i < 7; i++) {
      const date = moment(today).add(i, 'days');
      nextWeek.push(date.format('YYYY-MM-DD'));
    }
    
    // 构建提示词
    const prompt = `
      请为姓名为"${name}"，生日为"${birthdate}"的用户分析未来7天（${nextWeek.join(', ')}）的财运。
      
      他的财运幸运数字是 ${luckyNumber}，请将这个信息考虑到你的分析中。
      
      对于每一天，请提供以下信息：
      1. 财运指数（1-10分）
      2. 财运描述（100字左右）
      3. 财运建议（50字左右）
      4. 每天的幸运数字（基于原本的幸运数字，但每天有所变化）
      5. 适合的理财活动（如投资、储蓄、避险等）
      
      请用严格的JSON格式返回结果，每天为一个对象，包含以上五个字段，组成一个数组。
      字段名称为：date, score, description, advice, luckyNumber, activities
    `;
    
    // 调用API或生成模拟数据
    let fortuneData;
    
    if (process.env.USE_MOCK_DATA === 'true') {
      // 使用模拟数据（用于开发和测试）
      fortuneData = nextWeek.map(date => generateDailyFortune(date, name, birthdate, luckyNumber));
    } else {
      // 调用DeepSeek API
      const apiResponse = await callDeepSeekAPI(prompt);
      try {
        // 尝试解析API返回的JSON
        fortuneData = JSON.parse(apiResponse);
      } catch (parseError) {
        // 如果解析失败，使用正则表达式尝试提取JSON部分
        const jsonMatch = apiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          fortuneData = JSON.parse(jsonMatch[0]);
        } else {
          // 如果仍然失败，使用模拟数据
          fortuneData = nextWeek.map(date => generateDailyFortune(date, name, birthdate, luckyNumber));
        }
      }
    }
    
    // 确保数据格式正确
    if (!Array.isArray(fortuneData)) {
      fortuneData = nextWeek.map(date => generateDailyFortune(date, name, birthdate, luckyNumber));
    }
    
    // 存入缓存
    fortuneCache.set(cacheKey, fortuneData);
    
    res.json(fortuneData);
  } catch (error) {
    console.error('财运预测接口错误:', error);
    res.status(500).json({ message: '获取财运数据失败', error: error.message });
  }
}; 