/**
 * 基于生日计算幸运数字
 */
exports.calculateLuckyNumber = (birthdate) => {
  // 简单的幸运数字计算算法
  const dateObj = new Date(birthdate);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  
  // 将所有数字相加然后取余
  let sum = day + month;
  for (let digit of year.toString()) {
    sum += parseInt(digit);
  }
  
  // 如果结果是两位数，继续相加直到得到一位数
  while (sum > 9) {
    let tempSum = 0;
    for (let digit of sum.toString()) {
      tempSum += parseInt(digit);
    }
    sum = tempSum;
  }
  
  return sum;
};

/**
 * 生成每日财运数据（模拟数据，用于测试或API失败时的备用方案）
 */
exports.generateDailyFortune = (date, name, birthdate, baseLuckyNumber) => {
  // 使用日期作为随机种子
  const dateObj = new Date(date);
  const dateSeed = dateObj.getDate() + (dateObj.getMonth() + 1) * 31;
  
  // 生成财运指数 (1-10)
  const scoreBase = Math.sin(dateSeed) * 5 + 5;
  const score = Math.max(1, Math.min(10, Math.round(scoreBase)));
  
  // 生成幸运数字
  const luckyNumberSeed = (baseLuckyNumber + dateSeed) % 9;
  const luckyNumber = luckyNumberSeed === 0 ? 9 : luckyNumberSeed;
  
  // 根据分数生成描述和建议
  let description, advice, activities;
  
  if (score >= 8) {
    description = `今天是${name}的财运高峰日！各项财务活动都有可能带来意外收获，尤其是与数字${luckyNumber}相关的财务决策会格外顺利。可能会收到意外之财或投资回报。`;
    advice = `把握难得的财运高峰，可以适度扩大投资规模，关注新的理财机会。`;
    activities = `投资股票、签订合同、谈判、创业计划、申请贷款`;
  } else if (score >= 5) {
    description = `今天${name}的财运平稳，日常收支情况正常，不会有大起大落。与熟悉的业务伙伴合作可能会带来稳定收益，避免冒险性投资。`;
    advice = `保持稳健的理财态度，适合处理日常财务事项和中长期规划。`;
    activities = `储蓄、购买保险、资产盘点、预算规划、调整投资组合`;
  } else {
    description = `今天${name}的财运较低迷，要特别注意避免冲动消费和高风险投资。财务决策需谨慎，尤其要避开与数字${(luckyNumber + 4) % 9 + 1}相关的交易。`;
    advice = `理财宜守不宜攻，把重点放在节流和风险防范上，避免大额支出。`;
    activities = `削减开支、避险操作、债务清理、推迟大额消费、修复信用记录`;
  }
  
  return {
    date,
    score,
    description,
    advice,
    luckyNumber,
    activities
  };
}; 