package com.jober.searchservice.controller;

import com.jober.searchservice.service.AddressService;
import com.jober.searchservice.service.impl.AddressServiceImpl;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("bs-address")
public class AddressServiceCtrl {
    public static final String APPLICATION_JSON_UTF8_VALUE = "application/json;charset=UTF-8";
    @Autowired
    AddressService addressService;
    @RequestMapping(method = RequestMethod.GET, value = "/_provinces",  produces = APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntitySerializable<ResponseObject> getProvinces() {
        ResponseEntitySerializable responseEntity = addressService.getProvinces();
        return responseEntity;
    }

    @RequestMapping(method = RequestMethod.GET, value = "/_districts",  produces = APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntitySerializable<ResponseObject> getDistricts(@RequestParam String provinceCode) {
        ResponseEntitySerializable responseEntity = addressService.getDistrictsByProvinceCode(provinceCode);
        return responseEntity;
    }
    @RequestMapping(method = RequestMethod.GET, value = "/_wards",  produces = APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntitySerializable<ResponseObject> getWards(@RequestParam String provinceCode) {
        ResponseEntitySerializable responseEntity = addressService.getWardsByProvinceCode(provinceCode);
        return responseEntity;
    }
}
