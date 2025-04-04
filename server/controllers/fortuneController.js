const axios = require('axios');
const moment = require('moment');
const NodeCache = require('node-cache');
const { calculateLuckyNumber, generateDailyFortune } = require('../utils/fortuneUtils');

// 缓存设置 (24小时)
const fortuneCache = new NodeCache({ stdTTL: 86400 });

/**
 * DeepSeek API调用函数 - 使用火山引擎API
 */
async function callDeepSeekAPI(prompt) {
  // 设置重试次数和计数器
  const MAX_RETRIES = 3;
  let retries = 0;
  
  // 创建axios请求配置，包含超时设置
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    timeout: 10000 // 10秒超时
  };
  
  // 构建请求体
  const requestBody = {
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
    top_p: 0.9,
    max_tokens: 800
  };
  
  // 重试逻辑
  while (retries < MAX_RETRIES) {
    try {
      console.log(`尝试调用DeepSeek API (尝试${retries + 1}/${MAX_RETRIES})...`);
      
      const response = await axios.post(
        'https://spark-api.deepseek.com/v1/chat/completions',
        requestBody,
        config
      );
      
      // 检查状态码
      if (response.status !== 200) {
        throw new Error(`API返回非成功状态码: ${response.status}`);
      }
      
      // 检查响应数据结构
      if (!response.data || 
          !response.data.choices || 
          !response.data.choices[0] || 
          !response.data.choices[0].message ||
          !response.data.choices[0].message.content) {
        throw new Error('API返回数据格式异常');
      }
      
      console.log('DeepSeek API调用成功');
      return response.data.choices[0].message.content;
    } catch (error) {
      retries++;
      console.error(`DeepSeek API调用失败 (尝试${retries}/${MAX_RETRIES}):`, error.message);
      
      if (error.response) {
        // 服务器返回了错误响应
        console.error('错误响应:', error.response.status, error.response.data);
      } else if (error.request) {
        // 请求发送但没有收到响应
        console.error('未收到响应，请求超时或网络问题');
      }
      
      // 如果还有重试次数，等待后重试
      if (retries < MAX_RETRIES) {
        // 指数退避策略：等待时间随重试次数增加
        const waitTime = 1000 * Math.pow(2, retries);
        console.log(`等待${waitTime}毫秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // 超过重试次数，抛出错误
        throw new Error(`DeepSeek API调用失败，已尝试${MAX_RETRIES}次: ${error.message}`);
      }
    }
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
      
      示例格式如下：
      [
        {
          "date": "2023-01-01",
          "score": 8,
          "description": "今日财运不错，有意外收获的可能...",
          "advice": "可以考虑小额投资，把握机会...",
          "luckyNumber": 6,
          "activities": "股票投资、项目合作、签订合同"
        },
        ...其他日期数据
      ]
      
      请确保返回的是可以直接解析的JSON数组，不要有其他格式的文本。
    `;
    
    // 调用API或生成模拟数据
    let fortuneData;
    
    if (process.env.USE_MOCK_DATA === 'true') {
      // 使用模拟数据（用于开发和测试）
      console.log('使用模拟数据');
      fortuneData = nextWeek.map(date => generateDailyFortune(date, name, birthdate, luckyNumber));
    } else {
      try {
        // 调用DeepSeek API
        console.log('尝试调用DeepSeek API...');
        const apiResponse = await callDeepSeekAPI(prompt);
        console.log('API响应:', apiResponse.substring(0, 200) + '...');
        
        // 尝试解析API返回的JSON
        try {
          fortuneData = JSON.parse(apiResponse);
          console.log('成功解析JSON响应');
        } catch (parseError) {
          console.error('JSON解析失败，尝试提取JSON部分:', parseError);
          
          // 如果解析失败，使用正则表达式尝试提取JSON部分
          const jsonMatch = apiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            console.log('通过正则表达式提取到JSON部分');
            fortuneData = JSON.parse(jsonMatch[0]);
          } else {
            console.warn('无法从API响应中提取JSON，使用模拟数据');
            // 如果仍然失败，使用模拟数据
            fortuneData = nextWeek.map(date => generateDailyFortune(date, name, birthdate, luckyNumber));
          }
        }
      } catch (apiError) {
        console.error('API调用完全失败，使用模拟数据:', apiError);
        fortuneData = nextWeek.map(date => generateDailyFortune(date, name, birthdate, luckyNumber));
      }
    }
    
    // 确保数据格式正确
    if (!Array.isArray(fortuneData)) {
      console.warn('API返回的数据不是数组，使用模拟数据');
      fortuneData = nextWeek.map(date => generateDailyFortune(date, name, birthdate, luckyNumber));
    }
    
    // 验证每个日期对象的格式
    fortuneData = fortuneData.map((item, index) => {
      // 如果对象缺少必要字段，使用模拟数据
      if (!item.date || !item.score || !item.description || !item.advice || !item.luckyNumber || !item.activities) {
        console.warn(`第${index}个日期数据格式不完整，替换为模拟数据`);
        return generateDailyFortune(nextWeek[index], name, birthdate, luckyNumber);
      }
      return item;
    });
    
    // 存入缓存
    fortuneCache.set(cacheKey, fortuneData);
    
    res.json(fortuneData);
  } catch (error) {
    console.error('财运预测接口错误:', error);
    res.status(500).json({ message: '获取财运数据失败', error: error.message });
  }
}; 