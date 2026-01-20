package com.jober.webclient.service.impl;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Cookies provide a way to exchange the information between the server and the browser to manage sessions (logins, shopping carts, game scores), remember user preferences (themes, privacy policy acceptance), and to track the user behavior across the site
 */
public class CookieService {
    public void setCookie(HttpServletResponse response, String key, String value) {
    // create a cookie
        Cookie cookie = new Cookie(key, value);
        cookie.setMaxAge(7 * 24 * 60 * 60); // expires in 7 days
        cookie.setSecure(true); // Secure Cookie
        cookie.setHttpOnly(true); // HttpOnly Cookie
        cookie.setPath("/"); // global cookie accessible every where -> cookie scope
        //add cookie to response
        response.addCookie(cookie);
    }
    public String readAllCookies(HttpServletRequest request) {

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                    .map(c -> c.getName() + "=" + c.getValue()).collect(Collectors.joining(", "));
        }
        return "No cookies";
    }

    /**
     * To delete a cookie, set the Max-Age directive to 0 and unset its value. You must also pass the same other cookie properties you used to set it. Don't set the Max-Age directive value to -1. Otherwise, it will be treated as a session cookie by the browser
     * @param response
     * @param key
     * @param value
     */
    public void deleteCookie(HttpServletResponse response, String key, String value) {
        // create a cookie
        Cookie cookie = new Cookie(key, null);
        cookie.setMaxAge(0);
        cookie.setSecure(true);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        //add cookie to response
        response.addCookie(cookie);
    }
}
