import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import ApiCall, { baseUrl } from "../../../config/index";


const SOCKET_URL = `${baseUrl}/ws/chat`;

export default function useChatSocket(onMessageReceived) {
  const stompClientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  

  useEffect(() => {
    console.log("🧩 Подключаемся к:", SOCKET_URL);

    // ✅ Используем именно фабрику, чтобы избежать ошибки "did not receive factory"
    // const stompClient = Stomp.over(() => new SockJS(SOCKET_URL));
    const sock = new SockJS(SOCKET_URL);
    console.log("🚀 SockJS instance:", sock);

    sock.onopen = () => console.log("✅ SockJS TCP connected");
    sock.onerror = (e) => console.error("❌ SockJS error:", e);
    sock.onclose = (e) => console.warn("⚠️ SockJS closed:", e);

    const stompClient = Stomp.over(() => sock);

    stompClient.debug = (str) => console.log(str);

    stompClient.connect(
      {},
      (frame) => {
        console.log("✅ STOMP Connected:", frame);
        stompClientRef.current = stompClient;
        setConnected(true);
      },
      (error) => {
        console.error("❌ STOMP connection error:", error);
        setConnected(false);
      }
    );

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("🧩 STOMP: Disconnecting...");
        stompClientRef.current.disconnect(() => {
          console.log("🧩 STOMP: Disconnected");
        });
      }
      setConnected(false);
    };
  }, []);

  const sendMessage = (destination, body) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn("⚠️ STOMP client not ready yet");
      return false;
    }
    console.log("📤 Отправляем:", destination, body);
    stompClientRef.current.send(destination, {}, JSON.stringify(body));
    return true;
  };

  const subscribeToChat = (chatId) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      console.warn("⚠️ STOMP client not ready yet");
      return;
    }

    console.log(`📡 Подписка на /topic/chat/${chatId}`);
    return stompClientRef.current.subscribe(
      `/topic/chat/${chatId}`,
      (message) => {
        try {
          const parsed = JSON.parse(message.body);
          console.log("📩 Получено сообщение:", parsed);
          onMessageReceived(parsed);
        } catch (e) {
          console.error("Ошибка парсинга:", e);
        }
      }
    );
  };

  return { sendMessage, subscribeToChat, connected };
}
