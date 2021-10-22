import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { io } from "socket.io-client";

import { api } from "../../services/api";
import { Message, MessageProps } from "./Message";
import { styles } from "./styles";

let messagesQueue: MessageProps[] = [];
const socket = io(String(api.defaults.baseURL));
socket.on("new_message", (message: MessageProps) => {
  messagesQueue.push(message);
});

export function MessageList() {
  const [currentMessages, setCurrentMessages] = useState<MessageProps[]>([]);

  useEffect(() => {
    async function loadMessages() {
      const messagesResponse = await api.get<MessageProps[]>("/messages/last3");
      setCurrentMessages(messagesResponse.data);
    }
    loadMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setCurrentMessages((oldMessages) => [
          messagesQueue[0],
          oldMessages[0],
          oldMessages[1],
        ]);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="never"
    >
      {currentMessages.map((message, index) => (
        <Message key={message.id} data={message} />
      ))}
    </ScrollView>
  );
}
