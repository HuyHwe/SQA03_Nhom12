package com.resourceservice.service.impl;

import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.SettingDTO;
import com.resourceservice.model.Settings;
import com.resourceservice.repository.SettingsRepo;
import com.resourceservice.service.SettingsService;
import com.resourceservice.utilsmodule.utils.Utility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static com.jober.utilsservice.constant.ResponseMessageConstant.FOUND;
import static com.jober.utilsservice.constant.ResponseMessageConstant.SUCCESS;
import static com.resourceservice.utilsmodule.constant.Constant.ACTIVE_FEE;
import static com.resourceservice.utilsmodule.constant.Constant.FEE_PER_SELECT_ONE_FREELANCER;

@Service
public class SettingsImpl implements SettingsService {
    @Autowired
    SettingsRepo settingsRepo;
    public static ResponseEntity responseEntity;
    public static ResponseObject responseObject = Utility.responseObject;
    @Override
    public ResponseEntity<ResponseObject> getSettings() {
        List<Settings> settingsList =  settingsRepo.findAll();
        if (settingsList != null && Optional.of(settingsList).isPresent()) {
            SettingDTO settingDTO = new SettingDTO();
            for (int i = 0; i < settingsList.size(); i ++) {
                Settings settingItem = settingsList.get(i);
                if (settingItem.getKeywords().equals(ACTIVE_FEE)) {
                    settingDTO.setActivefee(settingItem.getData());
                } else  if (settingItem.getKeywords().equals(FEE_PER_SELECT_ONE_FREELANCER)) {
                    settingDTO.setFeePerSelectOneFreelancer(settingItem.getData());
                }
            }
            responseObject = new ResponseObject(SUCCESS, String.valueOf(HttpStatus.OK), FOUND, 1L, 1, settingDTO);
            responseEntity = (new ResponseEntity(responseObject, HttpStatus.OK));
            return responseEntity;
        }
        return new ResponseEntity(null,null, HttpStatus.NOT_FOUND);
    }

    @Override
    public ResponseEntity<ResponseObject> updateSettings(Settings settings) {
        Settings updatedSetting = settingsRepo.save(settings.getData(), settings.getKeywords());
        if (updatedSetting != null && Optional.of(updatedSetting).isPresent()) {
            responseObject.setData(updatedSetting);
            responseObject.setCurrentCount(1);
            responseObject.setTotalCount(1L);
            responseObject.setMessage(FOUND);
            responseObject.setCode(String.valueOf(HttpStatus.OK));
            responseObject.setStatus(SUCCESS);
            responseEntity = (new ResponseEntity(responseObject, HttpStatus.OK));
            return responseEntity;
        }
        return new ResponseEntity(null,null, HttpStatus.NOT_MODIFIED);
    }
}
