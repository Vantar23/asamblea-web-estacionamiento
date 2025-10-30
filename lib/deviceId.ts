// Generate a unique device ID that persists across sessions
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    // Generate a unique ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
}
