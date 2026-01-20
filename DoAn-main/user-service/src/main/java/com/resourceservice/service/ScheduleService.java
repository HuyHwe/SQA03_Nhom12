package com.resourceservice.service;

import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.request.ScheduleRqDTO;
import com.resourceservice.dto.request.ScheduleInputDTO;
import com.resourceservice.dto.request.ScheduleParamDTO;
import com.resourceservice.dto.request.StatusRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
public interface ScheduleService {
    ResponseEntity saveSchedule(ScheduleRqDTO scheduleRqDTO);

    ResponseEntity getScheduleById(Long scheduleId);

    ResponseEntity getScheduleByStatus(ScheduleParamDTO scheduleParamDTO);

    ResponseEntity getCalendar(ScheduleInputDTO scheduleInputDTO);

    ResponseEntity getCalendarById(Long id);

    ResponseEntity deleteByIds(List<Long> scheduleIds);
    ResponseEntity<ResponseObject> getApplicationStatus(StatusRequest statusRequest);
}
