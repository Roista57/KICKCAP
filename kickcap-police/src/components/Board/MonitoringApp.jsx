import React, { useRef, useEffect, useState } from 'react';
import Text from '../Common/Text';
import styled from 'styled-components';

const s = {
  Container: styled.div`
    width: 400px;
    display: flex;
    flex-direction: column;
    justify-content: start;
  `,
};
const MonitoringApp = ({ idx }) => {
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = () => {
    // WebSocket 서버에 연결
    socketRef.current = new WebSocket(`wss://j11b102.p.ssafy.io/cctv/video?role=client&camera_idx=${idx}`);

    socketRef.current.binaryType = 'arraybuffer'; // 이진 데이터 수신을 위해 설정

    socketRef.current.onopen = () => {
      setIsConnected(true); // 연결 상태를 true로 설정
    };

    socketRef.current.onmessage = (event) => {
      const arrayBuffer = event.data;
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(blob);
      setAnnotatedImage(imageUrl);
    };

    socketRef.current.onclose = () => {
      setIsConnected(false); // 연결 상태를 false로 설정
      setAnnotatedImage(null); // 연결이 끊어지면 이미지 초기화

      // 10초 후에 재연결 시도
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 10000); //10000
    };

    socketRef.current.onerror = (error) => {};
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
      }
    };
  }, []);

  return (
    <>
      {annotatedImage ? (
        <s.Container>
          <img src={annotatedImage} alt="Received Frame" style={{ width: '400px', height: '400px' }} />
          <Text
            children={'CCTV 영상 정보입니다.'}
            textalian={'center'}
            display={'block'}
            size={'15px'}
            bold={'700'}
            color={'textBasic'}
            margin={'10px auto'}
          />
        </s.Container>
      ) : (
        <Text
          children={'영상 수신 중...'}
          textalian={'center'}
          display={'block'}
          size={'15px'}
          bold={'700'}
          color={'textBasic'}
          margin={'10px auto'}
        />
      )}
    </>
  );
};

export default MonitoringApp;
