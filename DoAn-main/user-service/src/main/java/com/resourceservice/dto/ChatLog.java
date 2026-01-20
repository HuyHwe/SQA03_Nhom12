package com.resourceservice.dto;

import lombok.*;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.Objects;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "chat_log", schema = "public", catalog = "gpt_chat")
public class ChatLog {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    @Column(name = "id")
    private Integer id;
    @Basic
    @Column(name = "sender")
    private int sender;
    @Basic
    @Column(name = "message")
    private String message;
    @Basic
    @Column(name = "time_send")
    private Timestamp timeSend;
    @Basic
    @Column(name = "is_customer_send")
    private Boolean isCustomerSend;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ChatLog chatLog = (ChatLog) o;
        return id == chatLog.id && sender == chatLog.sender && Objects.equals(message, chatLog.message) && Objects.equals(timeSend, chatLog.timeSend) && Objects.equals(isCustomerSend, chatLog.isCustomerSend);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, sender, message, timeSend, isCustomerSend);
    }
}
