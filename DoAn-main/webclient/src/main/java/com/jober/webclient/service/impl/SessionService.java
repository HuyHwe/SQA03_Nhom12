package com.jober.webclient.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.annotation.WebListener;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

@Service
@WebListener
public class SessionService implements HttpSessionListener {
    @Autowired
    HttpSession session;
    public static Logger LOGGER = LoggerFactory.getLogger(SessionService.class);

    @SuppressWarnings("unchecked")
    public <T> T get(String name) {
        return (T) session.getAttribute(name);
    }

    public <T> T get(String name, T defaultValue) {
        T value = get(name);
        return value != null? value : defaultValue;
    }

    public void set(String name, Object value) {
        session.setAttribute(name, value);
    }

    public void remove(String name) {
        session.removeAttribute(name);
    }

    public void setSessionTimeout() {
//        30ms
        session.setMaxInactiveInterval(30*60);
    }

//    this is called when logout
//    destroy/invalidate session
    public void resetSession() {
        session.invalidate();
    }

    @Override
    public void sessionCreated(HttpSessionEvent se) {
//       todo 30ms
        se.getSession().setMaxInactiveInterval(5*60);
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
//        call logout in here
        LOGGER.info("sessionDestroyed");
//        userCtrl.logout();
    }
}
