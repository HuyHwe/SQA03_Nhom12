package com.jober.webclient.service;

import org.springframework.http.ResponseEntity;

public interface UserService {
    ResponseEntity login(String body);
    ResponseEntity logout();
    ResponseEntity getListUser();
    ResponseEntity createUser();
    ResponseEntity deleteUsers();
    ResponseEntity updateUsers();
}
