import { Tenant, SystemConfig } from '@/types/tenant';

// 模拟租户数据
export const mockTenants: Tenant[] = [
  {
    id: '1',
    roomNumber: 'A101',
    name: '张三拉面',
    electricityUsage: 450,
    electricBillStatus: '未结清',
    rentStatus: '已交',
    balance: 500,
    type: '商户',
  },
  {
    id: '2',
    roomNumber: 'A102',
    name: '李四理发',
    electricityUsage: 120,
    electricBillStatus: '已结清',
    rentStatus: '已交',
    balance: 800,
    type: '商户',
  },
  {
    id: '3',
    roomNumber: 'B201',
    name: '王五百货',
    electricityUsage: 680,
    electricBillStatus: '未结清',
    rentStatus: '欠费',
    balance: 50,
    type: '商户',
  },
  {
    id: '4',
    roomNumber: '101',
    name: '张先生家',
    electricityUsage: 150,
    electricBillStatus: '未结清',
    rentStatus: '未交',
    balance: 200,
    type: '家庭',
  },
  {
    id: '5',
    roomNumber: '202',
    name: '李奶奶家',
    electricityUsage: 80,
    electricBillStatus: '已结清',
    rentStatus: '已交',
    balance: 350,
    type: '家庭',
  },
  {
    id: '6',
    roomNumber: '305',
    name: '王小姐家',
    electricityUsage: 320,
    electricBillStatus: '未结清',
    rentStatus: '已交',
    balance: 100,
    type: '家庭',
  },
];

// 模拟系统配置
export const mockSystemConfig: SystemConfig = {
  baseRate: 1.0,
  couponEnabled: true,
};

// 计算返现券逻辑
export const calculateCoupon = (bill: number) => {
  if (bill >= 500) {
    return { amount: 70, minSpend: 140, description: '70元券(满140用)' };
  } else if (bill >= 300) {
    return { amount: 30, minSpend: 60, description: '30元券(满60用)' };
  } else if (bill >= 100) {
    return { amount: 5, minSpend: 10, description: '5元券(满10用)' };
  }
  return null;
};
