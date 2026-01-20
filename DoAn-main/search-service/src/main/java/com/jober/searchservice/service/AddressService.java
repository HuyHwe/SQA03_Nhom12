package com.jober.searchservice.service;

import com.jober.searchservice.model.Province;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;

import java.util.List;

public interface AddressService {
    ResponseEntitySerializable<ResponseObject> getProvinces();
    ResponseEntitySerializable<ResponseObject> getDistrictsByProvinceCode(String provinceCode);
    ResponseEntitySerializable<ResponseObject> getWardsByProvinceCode(String provinceCode);
}
