import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';

export const useSocket = () => {
  const { currentUser } = useAuth();
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (currentUser?._id && !isConnectedRef.current) {
      socketService.connect(currentUser._id);
      isConnectedRef.current = true;
    }

    return () => {
      if (isConnectedRef.current) {
        socketService.disconnect();
        isConnectedRef.current = false;
      }
    };
  }, [currentUser?._id]);

  return {
    socket: socketService,
    isConnected: socketService.isConnected()
  };
};


