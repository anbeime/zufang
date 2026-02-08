'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  price: string;
  area?: number;
  photos?: string[];
}

interface RoomTypeGroup {
  roomType: string;
  rooms: Room[];
}

interface CheckInClientContentProps {
  initialRoomGroups: RoomTypeGroup[];
}

const ROOM_TYPE_NAMES: { [key: string]: string } = {
  single: '单房',
  family: '家庭房',
  deluxe: '豪华房',
  suite: '套房',
};

export default function CheckInClientContent({ initialRoomGroups }: CheckInClientContentProps) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'select' | 'form' | 'success'>('select');
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomGroups, setRoomGroups] = useState<RoomTypeGroup[]>(initialRoomGroups);
  const [isScanned, setIsScanned] = useState(false);

  // 拍照相关状态
  const [showCamera, setShowCamera] = useState(false);
  const [capturingRoomId, setCapturingRoomId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    roomId: '',
    deposit: '1000',
  });

  // 检查URL参数，获取手机号（从个人二维码扫码）
  const phone = searchParams.get('phone');
  useEffect(() => {
    if (phone) {
      setFormData(prev => ({ ...prev, phone }));
      setIsScanned(true);
    }
  }, [phone]);

  // 组件卸载时清理摄像头资源
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setFormData(prev => ({
      ...prev,
      roomId: room.id,
      deposit: room.price,
    }));
    setStep('form');
  };

  const handleBackToSelect = () => {
    setStep('select');
  };

  // 开启摄像头
  const openCamera = async (roomId: string) => {
    setCapturingRoomId(roomId);
    setShowCamera(true);
    setCapturedPhoto(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
        };
      }
    } catch (error) {
      console.error('无法访问摄像头:', error);
      alert('无法访问摄像头，请确保已授予摄像头权限');
      closeCamera();
    }
  };

  // 关闭摄像头
  const closeCamera = () => {
    setShowCamera(false);
    setCapturingRoomId(null);
    setIsStreaming(false);
    setCapturedPhoto(null);

    // 停止视频流
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // 拍照
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // 验证视频尺寸
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('视频尚未准备好');
      return;
    }

    // 设置画布尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 绘制视频帧到画布
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    }

    // 获取照片数据
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoData);
  };

  // 确认上传照片
  const confirmUpload = async () => {
    if (!capturedPhoto || !capturingRoomId) return;

    setLoading(true);

    try {
      // 将 base64 转换为 File 对象
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      const file = new File([blob], 'room_photo.jpg', { type: 'image/jpeg' });

      // 上传照片
      const formData = new FormData();
      formData.append('photo', file);

      const uploadRes = await fetch(`/api/rooms/${capturingRoomId}/upload-photo`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (uploadData.success) {
        // 添加照片到房间列表
        const photosRes = await fetch(`/api/rooms/${capturingRoomId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrl: uploadData.photoUrl }),
        });

        const photosData = await photosRes.json();

        if (photosData.success) {
          // 更新房间组的照片
          setRoomGroups(prev =>
            prev.map(group => ({
              ...group,
              rooms: group.rooms.map(room =>
                room.id === capturingRoomId
                  ? { ...room, photos: photosData.photos }
                  : room
              ),
            }))
          );

          alert('照片上传成功！');
          closeCamera();
        } else {
          alert('照片添加失败');
        }
      } else {
        alert(uploadData.error || '上传失败');
      }
    } catch (error) {
      console.error('上传照片失败:', error);
      alert('上传照片失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      alert('请填写姓名');
      return;
    }

    if (!formData.phone) {
      alert('请填写手机号');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        alert(data.error || '入住失败');
      }
    } catch (error) {
      alert('入住失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <a href="/" className="text-gray-600 hover:text-gray-900">← 返回首页</a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 步骤1：选择房间 */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">选择房间</h2>
                <p className="text-gray-600">请选择您心仪的房型（就像选座位一样）</p>
              </div>

              {roomGroups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">😔</div>
                  <p className="text-gray-600">暂无可用房间</p>
                </div>
              ) : (
                roomGroups.map((group) => (
                  <div key={group.roomType} className="mb-6 last:mb-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {ROOM_TYPE_NAMES[group.roomType] || group.roomType}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {group.rooms.length} 间可用
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.rooms.map((room) => {
                        const isSelected = selectedRoom?.id === room.id;
                        const hasPhotos = room.photos && room.photos.length > 0;
                        return (
                          <button
                            key={room.id}
                            onClick={() => handleSelectRoom(room)}
                            className={`relative border-2 rounded-xl overflow-hidden hover:shadow-md transition-all text-left ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400'
                            }`}
                          >
                            {/* 照片展示 */}
                            {hasPhotos ? (
                              <div className="w-full h-32 bg-gray-100">
                                <img
                                  src={room.photos![0]}
                                  alt={`${room.roomNumber}房间`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <span className="text-4xl">🏠</span>
                              </div>
                            )}

                            {/* 房间信息 */}
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-2xl font-bold text-blue-600">
                                    ￥{parseFloat(room.price).toFixed(0)}/月
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {room.roomNumber}号房
                                    {isSelected && <span className="ml-2 text-blue-600 font-semibold">✓</span>}
                                  </div>
                                  {room.area && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {room.area}㎡
                                    </div>
                                  )}
                                </div>
                              </div>
                              {hasPhotos && (
                                <div className="mt-2 text-xs text-blue-600 font-medium">
                                  📷 {room.photos!.length}张实景照片
                                </div>
                              )}
                              {!hasPhotos && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCamera(room.id);
                                  }}
                                  className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-1"
                                >
                                  <span>📷</span>
                                  <span>拍照上传</span>
                                </button>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <a
              href="/"
              className="block w-full px-4 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-medium border border-gray-200 text-center"
            >
              返回首页
            </a>
          </div>
        )}

        {/* 步骤2：填写信息 */}
        {step === 'form' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="mb-6">
              <button
                onClick={handleBackToSelect}
                className="text-gray-600 hover:text-gray-900 mb-2 inline-block"
              >
                ← 返回选择房间
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-2">填写入住信息</h2>
              <p className="text-gray-600">
                已选：{selectedRoom?.roomNumber}号房（{ROOM_TYPE_NAMES[selectedRoom?.roomType || 'single'] || selectedRoom?.roomType}）
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的姓名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                {isScanned && (
                  <div className="mb-2 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                    <span>✓</span>
                    <span>扫码已自动识别您的手机号</span>
                  </div>
                )}
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入手机号"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">押金金额</label>
                <input
                  type="text"
                  value={`￥${formData.deposit}`}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {loading ? '处理中...' : '确认入住'}
              </button>

              <button
                type="button"
                onClick={handleBackToSelect}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                返回
              </button>
            </form>
          </div>
        )}

        {/* 步骤3：入住成功 */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">入住成功</h1>
            <p className="text-gray-600 mb-8">欢迎入住！您的手机号已作为登录凭证</p>

            <a
              href="/"
              className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg"
            >
              返回首页
            </a>
          </div>
        )}
      </div>

      {/* 摄像头拍照弹窗 */}
      {showCamera && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
        >
          <div className="w-full max-w-2xl p-4">
            {/* 视频容器 - 必须有尺寸约束 */}
            <div className="bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
              />
              {!isStreaming && !capturedPhoto && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div>正在启动摄像头...</div>
                  </div>
                </div>
              )}
            </div>

            {/* 拍照预览 */}
            {capturedPhoto && (
              <div className="mt-4 bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img src={capturedPhoto} alt="拍摄的照片" className="w-full h-full object-cover" />
              </div>
            )}

            {/* 隐藏的画布用于截图 */}
            <canvas ref={canvasRef} className="hidden" />

            {/* 操作按钮 */}
            <div className="mt-6 flex gap-3 justify-center">
              {!capturedPhoto ? (
                <>
                  <button
                    onClick={closeCamera}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={takePhoto}
                    disabled={!isStreaming}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    拍照
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setCapturedPhoto(null);
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium"
                  >
                    重拍
                  </button>
                  <button
                    onClick={confirmUpload}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? '上传中...' : '确认上传'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
