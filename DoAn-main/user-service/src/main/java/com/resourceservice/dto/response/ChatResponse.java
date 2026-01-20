package com.resourceservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChatResponse {
    @JsonProperty("response")
    private String reply;

    public ChatResponse() {
    }

    public ChatResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}