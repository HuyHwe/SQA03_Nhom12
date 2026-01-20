package com.configurationservice.controller;

import com.configurationservice.dto.input.PackageDTO;
import com.configurationservice.model.Package;
import com.configurationservice.repository.PackageRepo;
import com.configurationservice.service.impl.PackageServiceImpl;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("bs-configuration/package")
public class PackageCtrl {
    @Autowired
    private PackageServiceImpl packageService;
    @GetMapping(value = "/_search")
    public ResponseEntity<ResponseObject> getPackages() {
        return packageService.getPackages();
    }

    @PostMapping(value = "/_delete")
    public ResponseEntity<Response> deletePackageByIds(@RequestBody List<Long> ids) {
        return packageService.delete(ids);
    }

    @PostMapping(value = "/_update")
    public ResponseEntity<Response> update(@RequestBody PackageDTO updatedPackage) {
        return packageService.update(updatedPackage);
    }
}
