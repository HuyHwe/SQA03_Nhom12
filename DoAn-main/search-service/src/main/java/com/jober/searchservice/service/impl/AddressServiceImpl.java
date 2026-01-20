package com.jober.searchservice.service.impl;

import com.jober.searchservice.model.District;
import com.jober.searchservice.model.Province;
import com.jober.searchservice.model.Ward;
import com.jober.searchservice.repository.DistrictRepo;
import com.jober.searchservice.repository.ProvinceRepo;
import com.jober.searchservice.repository.WardRepo;
import com.jober.searchservice.service.AddressService;
import com.jober.utilsservice.errors.ResponseEntitySerializable;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;

@Service
public class AddressServiceImpl implements AddressService {
    @Autowired
    private ProvinceRepo provinceRepo;
    @Autowired
    private DistrictRepo districtRepo;
    @Autowired
    private WardRepo wardRepo;
    private ResponseObject responseObject = null;
    @Override
    public ResponseEntitySerializable<ResponseObject> getProvinces() {
        HttpStatus httpStatus = null;
        List<Province> provinces = provinceRepo.findAll();
        if (provinces != null && !provinces.isEmpty()) {

            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    new Long(provinces.size()),
                    provinces.size(), 0, provinces);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntitySerializable(responseObject, httpStatus);
    }

    @Override
    public ResponseEntitySerializable<ResponseObject> getDistrictsByProvinceCode(String provinceCode) {
        HttpStatus httpStatus = null;
        List<District> districts = districtRepo.findByProvinceCode(provinceCode);
        if (districts != null && !districts.isEmpty()) {
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    new Long(districts.size()),
                    districts.size(), 0, districts);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntitySerializable(responseObject, httpStatus);
    }

    @Override
    public ResponseEntitySerializable<ResponseObject> getWardsByProvinceCode(String provinceCode) {
        HttpStatus httpStatus = null;
        List<Ward> wards = wardRepo.findByProvinceCode(provinceCode);
        if (wards != null && !wards.isEmpty()) {
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    new Long(wards.size()),
                    wards.size(), 0, wards);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.OK;
            responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntitySerializable(responseObject, httpStatus);
    }
}
