// 租户数据类型定义
export interface Tenant {
  id: string;
  roomNumber: string;      // 房号
  name: string;            // 店名/住户名
  electricityUsage: number; // 电表度数
  electricBillStatus: '已结清' | '未结清' | '欠费'; // 电费状态
  rentStatus: '已交' | '未交' | '欠费'; // 房租状态
  balance: number;         // 余额
  type: '商户' | '家庭';   // 租户类型
}

// 返现券类型
export interface Coupon {
  amount: number;
  minSpend: number;
  description: string;
}

// 系统配置
export interface SystemConfig {
  baseRate: number;        // 基础电价（元/度）
  couponEnabled: boolean;  // 是否启用返现券
}
