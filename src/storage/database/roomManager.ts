import { eq, and, SQL, sql, desc } from "drizzle-orm";
import { db } from "./index";
import { rooms, insertRoomSchema } from "./shared/schema";
import type { Room, InsertRoom } from "./shared/schema";

export class RoomManager {
  async createRoom(data: InsertRoom): Promise<Room> {
    
    const validated = insertRoomSchema.parse(data);
    const [room] = await db.insert(rooms).values(validated).returning();
    return room;
  }

  async getRooms(options: {
    floor?: number;
    type?: string;
    roomType?: string;
    status?: string;
  } = {}): Promise<Room[]> {
    const { floor, type, roomType, status } = options;
    

    const conditions: SQL[] = [];
    if (floor !== undefined) conditions.push(eq(rooms.floor, floor));
    if (type !== undefined) conditions.push(eq(rooms.type, type));
    if (roomType !== undefined) conditions.push(eq(rooms.roomType, roomType));
    if (status !== undefined) conditions.push(eq(rooms.status, status));

    if (conditions.length > 0) {
      return db.select().from(rooms).where(and(...conditions)).orderBy(rooms.floor, rooms.roomNumber);
    }

    return db.select().from(rooms).orderBy(rooms.floor, rooms.roomNumber);
  }

  async getRoomById(id: string): Promise<Room | null> {
    
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room || null;
  }

  async getRoomByNumber(roomNumber: string): Promise<Room | null> {
    
    const [room] = await db.select().from(rooms).where(eq(rooms.roomNumber, roomNumber));
    return room || null;
  }

  async updateRoom(id: string, data: Partial<InsertRoom>): Promise<Room | null> {
    
    const [room] = await db
      .update(rooms)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(rooms.id, id))
      .returning();
    return room || null;
  }

  async updateRoomStatus(id: string, status: string): Promise<Room | null> {
    
    const [room] = await db
      .update(rooms)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(rooms.id, id))
      .returning();
    return room || null;
  }

  async deleteRoom(id: string): Promise<boolean> {
    
    const result = await db.delete(rooms).where(eq(rooms.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // 获取可用房间列表（按类型分组）
  async getAvailableRoomsByType(): Promise<{ roomType: string; rooms: Room[] }[]> {
    const allRooms = await this.getRooms({ type: 'room', status: 'available' });
    
    const grouped: { [key: string]: Room[] } = {};
    
    allRooms.forEach(room => {
      if (!grouped[room.roomType || 'single']) {
        grouped[room.roomType || 'single'] = [];
      }
      grouped[room.roomType || 'single'].push(room);
    });
    
    return Object.entries(grouped).map(([roomType, rooms]) => ({
      roomType,
      rooms
    }));
  }

  // 初始化房间数据（按用户配置）
  async initializeRooms() {
    
    const existingRooms = await db.select().from(rooms);

    if (existingRooms.length === 0) {
      // 二楼（4套）
      // 201、202：二房，800元
      await db.insert(rooms).values({
        roomNumber: '201',
        floor: 2,
        type: 'room',
        roomType: '二房',
        area: 50,
        baseRent: '800.00',
        price: '800.00',
        status: 'available',
      });
      await db.insert(rooms).values({
        roomNumber: '202',
        floor: 2,
        type: 'room',
        roomType: '二房',
        area: 50,
        baseRent: '800.00',
        price: '800.00',
        status: 'available',
      });
      
      // 203、204：二房一厅，700元
      await db.insert(rooms).values({
        roomNumber: '203',
        floor: 2,
        type: 'room',
        roomType: '二房一厅',
        area: 60,
        baseRent: '700.00',
        price: '700.00',
        status: 'available',
      });
      await db.insert(rooms).values({
        roomNumber: '204',
        floor: 2,
        type: 'room',
        roomType: '二房一厅',
        area: 60,
        baseRent: '700.00',
        price: '700.00',
        status: 'available',
      });
      
      // 三楼（8套）
      // 301-304：300元
      for (let i = 1; i <= 4; i++) {
        await db.insert(rooms).values({
          roomNumber: `30${i}`,
          floor: 3,
          type: 'room',
          roomType: '小单间',
          area: 25,
          baseRent: '300.00',
          price: '300.00',
          status: 'available',
        });
      }
      
      // 305-306：400元
      await db.insert(rooms).values({
        roomNumber: '305',
        floor: 3,
        type: 'room',
        roomType: '单间',
        area: 30,
        baseRent: '400.00',
        price: '400.00',
        status: 'available',
      });
      await db.insert(rooms).values({
        roomNumber: '306',
        floor: 3,
        type: 'room',
        roomType: '单间',
        area: 30,
        baseRent: '400.00',
        price: '400.00',
        status: 'available',
      });
      
      // 307-308：500元
      await db.insert(rooms).values({
        roomNumber: '307',
        floor: 3,
        type: 'room',
        roomType: '大单间',
        area: 35,
        baseRent: '500.00',
        price: '500.00',
        status: 'available',
      });
      await db.insert(rooms).values({
        roomNumber: '308',
        floor: 3,
        type: 'room',
        roomType: '大单间',
        area: 35,
        baseRent: '500.00',
        price: '500.00',
        status: 'available',
      });
      
      // 四楼（8套复式）
      // 401：400元
      await db.insert(rooms).values({
        roomNumber: '401',
        floor: 4,
        type: 'room',
        roomType: '小复式',
        area: 45,
        baseRent: '400.00',
        price: '400.00',
        status: 'available',
      });
      
      // 402-406：500元
      for (let i = 2; i <= 6; i++) {
        await db.insert(rooms).values({
          roomNumber: `40${i}`,
          floor: 4,
          type: 'room',
          roomType: '复式',
          area: 55,
          baseRent: '500.00',
          price: '500.00',
          status: 'available',
        });
      }
      
      // 407-408：700元
      await db.insert(rooms).values({
        roomNumber: '407',
        floor: 4,
        type: 'room',
        roomType: '大复式',
        area: 70,
        baseRent: '700.00',
        price: '700.00',
        status: 'available',
      });
      await db.insert(rooms).values({
        roomNumber: '408',
        floor: 4,
        type: 'room',
        roomType: '大复式',
        area: 70,
        baseRent: '700.00',
        price: '700.00',
        status: 'available',
      });
    }
  }
}

export const roomManager = new RoomManager();
