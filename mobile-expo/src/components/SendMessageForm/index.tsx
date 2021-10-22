import React, { useState } from "react";
import { Keyboard, TextInput, View } from "react-native";

import { api } from "../../services/api";
import { COLORS } from "../../theme";
import { Button } from "../Button";

import { styles } from "./styles";

export function SendMessageForm() {
  const [message, setMessage] = useState("");
  const [isMessageSending, setIsMessageSending] = useState(false);

  const handleMessageSubmit = async () => {
    const messageFormatted = message.trim();

    if (messageFormatted === "") return;

    setIsMessageSending(true);
    await api.post("/messages", { message: messageFormatted });

    setMessage("");
    Keyboard.dismiss();
    setIsMessageSending(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        keyboardAppearance="dark"
        placeholder="Digite sua expectativa para o evento"
        placeholderTextColor={COLORS.GRAY_PRIMARY}
        multiline
        maxLength={140}
        onChangeText={setMessage}
        value={message}
        style={styles.input}
        editable={!isMessageSending}
      />

      <Button
        title="ENVIAR MENSAGEM"
        backgroundColor={COLORS.PINK}
        color={COLORS.WHITE}
        isLoading={isMessageSending}
        onPress={handleMessageSubmit}
      />
    </View>
  );
}
