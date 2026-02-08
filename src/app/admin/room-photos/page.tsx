'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: string;
  roomType: string;
  photos: string[];
  price: string;
}

const ROOM_TYPE_NAMES: { [key: string]: string } = {
  single: '单房',
  family: '家庭房',
  deluxe: '豪华房',
  suite: '套房',
};

export default function RoomPhotosManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const loadRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success) {
        // 只显示住宅房间（2-4楼）
        const roomRooms = data.data.filter((r: Room) => r.type === 'room');
        setRooms(roomRooms);
      }
    } catch (error) {
      console.error('加载房间失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedRoom || !file) {
      alert('请选择房间和照片');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/rooms/${selectedRoom.id}/photos`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert('照片上传成功');
        setFile(null);
        // 重新加载房间数据
        await loadRooms();
        // 更新选中的房间
        const updatedRoom = rooms.find(r => r.id === selectedRoom.id);
        if (updatedRoom) {
          setSelectedRoom({
            ...updatedRoom,
            photos: data.data.photos,
          });
        }
      } else {
        alert(data.error || '上传失败');
      }
    } catch (error) {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!selectedRoom) return;

    if (!confirm('确定要删除这张照片吗？')) return;

    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/photos?index=${index}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        alert('照片删除成功');
        // 更新本地状态
        setSelectedRoom({
          ...selectedRoom,
          photos: data.data.photos,
        });
        // 更新列表中的房间
        setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, photos: data.data.photos } : r));
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">📷</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">房间照片管理</h1>
                <p className="text-xs text-gray-500">上传和管理房间展示照片</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← 返回后台
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：房间列表 */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">选择房间</h2>
            </div>
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {room.roomNumber}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedRoom?.id === room.id
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300'
                      }`}>
                        {selectedRoom?.id === room.id && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {ROOM_TYPE_NAMES[room.roomType] || room.roomType} · {room.floor}楼
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      ￥{parseFloat(room.price).toFixed(0)}/月
                    </div>
                    {room.photos && room.photos.length > 0 && (
                      <div className="mt-2 text-xs text-blue-600">
                        📷 已上传 {room.photos.length} 张照片
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：照片管理 */}
          {selectedRoom && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedRoom.roomNumber} - 照片管理
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {ROOM_TYPE_NAMES[selectedRoom.roomType]} · {selectedRoom.floor}楼
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* 上传区域 */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📤</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">上传照片</h3>
                    <p className="text-sm text-gray-500 mb-4">支持 JPG、PNG 格式，最大 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer font-medium"
                    >
                      选择照片
                    </label>
                  </div>
                  {file && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {file && (
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 font-medium"
                    >
                      {uploading ? '上传中...' : '确认上传'}
                    </button>
                  )}
                </div>

                {/* 已上传照片 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    已上传照片 ({(selectedRoom.photos || []).length}/10)
                  </h3>
                  {(selectedRoom.photos || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-6xl mb-4">📷</div>
                      <p>暂无照片</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {(selectedRoom.photos || []).map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`照片 ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleDeletePhoto(index)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                          >
                            ✕
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!selectedRoom && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">👈</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">请选择房间</h3>
              <p className="text-gray-500">在左侧列表中选择一个房间来管理照片</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
