package com.jober.webclient.controller;
import com.jober.webclient.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import javax.servlet.http.HttpServletRequest;

@Controller
public class UserCtrl {
    @Autowired
    UserService userService;

    @RequestMapping(method = RequestMethod.POST, value = "/login")
    public ResponseEntity login(@RequestBody String body, HttpServletRequest request) {
        ResponseEntity responseEntity = userService.login(body);
        return responseEntity;
    }
    @RequestMapping(method = RequestMethod.POST, value = "/logout")
    public ResponseEntity logout() {
        ResponseEntity responseEntity = userService.logout();
        clearSession();
        return responseEntity;
    }

    private void clearSession() {

    }
}
