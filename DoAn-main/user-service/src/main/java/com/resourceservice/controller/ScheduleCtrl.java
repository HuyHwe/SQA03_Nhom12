package com.resourceservice.controller;
import com.jober.utilsservice.utils.modelCustom.Response;
import com.jober.utilsservice.utils.modelCustom.ResponseObject;
import com.resourceservice.dto.request.ScheduleRqDTO;
import com.resourceservice.dto.request.ScheduleInputDTO;
import com.resourceservice.dto.request.ScheduleParamDTO;
import com.resourceservice.dto.request.StatusRequest;
import com.resourceservice.repository.ScheduleRepo;
import com.resourceservice.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("bs-user/schedule")
public class ScheduleCtrl {
    @Autowired
    ScheduleRepo scheduleRepo;

    @Autowired
    ScheduleService scheduleService;

    @RequestMapping(method = RequestMethod.POST, value = "/_save")
    public ResponseEntity<ResponseObject> saveSchedule(@RequestBody ScheduleRqDTO scheduleRqDTO) {
        return scheduleService.saveSchedule(scheduleRqDTO);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/get_by_id")
    public ResponseEntity<ResponseObject> getScheduleById(@RequestParam(name = "id") Long id) {
        ResponseEntity responseEntity = scheduleService.getScheduleById(id);
        return responseEntity;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/_search")
    public ResponseEntity<ResponseObject> getScheduleByStatus(@RequestBody ScheduleParamDTO scheduleParamDTO) {
        ResponseEntity responseEntity = scheduleService.getScheduleByStatus(scheduleParamDTO);
        return responseEntity;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/_calendar")
    public ResponseEntity<ResponseObject> getCalendar(@RequestBody ScheduleInputDTO scheduleInputDTO) {
        ResponseEntity responseEntity = scheduleService.getCalendar(scheduleInputDTO);
        return responseEntity;
    }

    @RequestMapping(method = RequestMethod.POST, value = "/_delete")
    public ResponseEntity<Response> getCalendar(@RequestBody List<Long> ids) {
        ResponseEntity responseEntity = scheduleService.deleteByIds(ids);
        return responseEntity;
    }
    @RequestMapping(method = RequestMethod.POST, value = "/_status")
    public ResponseEntity<ResponseObject> getApplicationStatus(@RequestBody StatusRequest statusRequest) {
        ResponseEntity responseEntity = scheduleService.getApplicationStatus(statusRequest);
        return responseEntity;
    }
}
