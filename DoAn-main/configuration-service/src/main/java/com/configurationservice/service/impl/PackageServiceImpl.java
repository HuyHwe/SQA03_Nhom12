package com.configurationservice.service.impl;

import com.configurationservice.dto.input.PackageDTO;
import com.configurationservice.model.Package;
import com.configurationservice.repository.PackageRepo;
import com.configurationservice.service.PackageService;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.jober.utilsservice.constant.Constant.SUCCESS_CODE;
import static com.jober.utilsservice.constant.ResponseMessageConstant.*;
import static com.jober.utilsservice.constant.ResponseMessageConstant.FAILED;

@Service
public class PackageServiceImpl implements PackageService {
    @Autowired
    private PackageRepo packageRepo;
    private ResponseObject responseObject = null;
    private Response response = null;
    @Override
    public ResponseEntity getPackages() {
        HttpStatus httpStatus;
        List<Package> packages = packageRepo.findByOrderByType();
        if (packages != null && Optional.of(packages).isPresent()) {
            responseObject = new ResponseObject(FOUND, SUCCESS_CODE, SUCCESS,
                    new Long(packages.size()),
                    packages.size(), 1, packages);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.NOT_FOUND;
            responseObject = new ResponseObject(NOT_FOUND, SUCCESS_CODE, SUCCESS,
                    0L,
                    0, new ArrayList<>());
        }
        return new ResponseEntity(responseObject, httpStatus);
    }

    @Override
    @Transactional
    public ResponseEntity delete(List<Long> ids) {
        HttpStatus httpStatus;
        Integer delete = packageRepo.delete(ids);
        if (delete != 0) {
            response = new Response(DELETED, SUCCESS_CODE, DELETED);
            httpStatus = HttpStatus.OK;
        } else {
            httpStatus = HttpStatus.NOT_IMPLEMENTED;
            response = new Response(FAILED);
        }
        return new ResponseEntity(response, httpStatus);
    }

    @Override
    @Transactional
    public ResponseEntity update(PackageDTO packageParam) {
        HttpStatus httpStatus = null;
        Long id = packageParam.getId();
        Optional<Package> optional = packageRepo.findById(id);
        boolean isChange = false;
        if (optional.isPresent()) {
            Package aPackage = optional.get();
            if (packageParam.getType() != null && !packageParam.getType().equals(aPackage.getType())) {
                aPackage.setType(packageParam.getType());
                isChange = true;
            }
            if (packageParam.getPrice() != null && !packageParam.getPrice().equals(aPackage.getPrice())) {
                aPackage.setPrice(packageParam.getPrice());
                isChange = true;
            }
            if (!isChange) {
                response = new Response(NOT_UPDATED);
                httpStatus = HttpStatus.NOT_MODIFIED;
            } else {
                aPackage.setUpdateDate(LocalDateTime.now());
                aPackage = (Package) packageRepo.save(aPackage);
                if (aPackage != null) {
                    response = new Response(UPDATED, SUCCESS_CODE, UPDATED);
                    httpStatus = HttpStatus.OK;
                } else {
                    response = new Response(FAILED);
                    httpStatus = HttpStatus.NOT_MODIFIED;
                }
            }
        }
        return new ResponseEntity(response, httpStatus);
    }
}
