package com.resourceservice.dto.request;

import com.resourceservice.utilsmodule.utils.modelCustom.SearchInputCommon;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Calendar;
import java.util.List;

@Getter
@Setter
public class ScheduleParamDTO extends SearchInputCommon {
    private List<Long> ids;
    private String status;
    private Long userId;
    private LocalDateTime startDate = getCurrentWeekStartDate();
    private LocalDateTime endDate = getCurrentWeekEndDate();

    public static LocalDateTime getCurrentWeekStartDate() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        return startOfWeek.withHour(0).withMinute(0).withSecond(0).withNano(0);
    }

    public static LocalDateTime getCurrentWeekEndDate() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfWeek = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        return endOfWeek.withHour(23).withMinute(59).withSecond(59).withNano(999999999);
    }
}
