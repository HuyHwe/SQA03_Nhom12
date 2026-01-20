package com.jober.utilsservice.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Calendar;
import java.util.Date;

public class DateFormaterUtility {
    public static String DATE_FORMAT_1 = "yyyy-MM-dd'T'HH:mm:ss";
    public static Logger LOGGER = LoggerFactory.getLogger(DateFormaterUtility.class);

    //    Date in db
    public static String DATE_FORMAT_2 = "yyyy-MM-dd";
    private static SimpleDateFormat formatter = null;
    public static String getCreationDate(Date date, String form) {
        formatter = new SimpleDateFormat(form);
        String strDate = formatter.format(date);
        return strDate;
    }

    public static LocalDateTime getLocalDate(String date, String form) {
        try {
            final DateTimeFormatter dtf = DateTimeFormatter.ofPattern(form);
            LocalDateTime lDate = LocalDateTime.parse(date,dtf);
            return lDate;
        } catch (DateTimeParseException e) {
            LOGGER.error("getLocalDate: " + e);
        }
        return null;
    }
    public static LocalDateTime getLocalDate(Date date, String form) {
        if (form == null) form = DATE_FORMAT_1;
        String dateStr = getCreationDate(date, DATE_FORMAT_1);
        final DateTimeFormatter dtf = DateTimeFormatter.ofPattern(form);
        LocalDateTime lDate = LocalDateTime.parse(dateStr,dtf);
        return lDate;
    }

    public static LocalDateTime convertToLocalDateTimeViaInstant(Date date) {
        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }
    public static LocalDateTime getFirstDateFromSpecificYear(int year) {
//        LocalDateTime specificDate = LocalDateTime.of(2014, Month.JANUARY, 1, 10, 10, 30);
        LocalDateTime specificDate = LocalDateTime.of(year, Month.JANUARY, 1, 0, 0, 0);
        return specificDate;
    }
    public static LocalDateTime getEndDateFromSpecificYear(int year) {
        LocalDateTime specificDate = LocalDateTime.of(year, Month.DECEMBER, 31, 0, 0, 0);
        return specificDate;
    }

    public static LocalDateTime getFirstDateFromSpecificYearMonth(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month );
        LocalDateTime firstOfMonth = yearMonth.atDay( 1 ).atStartOfDay();
        return firstOfMonth;
    }
    public static LocalDateTime getEndDateFromSpecificYearMonth(int year, int month) {
        YearMonth yearMonth = YearMonth.of( year, month );
        LocalDateTime lastOfMonth = yearMonth.atEndOfMonth().atStartOfDay();
        return lastOfMonth;
    }

    public static void main(String[] args) {
        System.out.println(getFirstDateFromSpecificYearMonth(2023, 2));
        System.out.println(getEndDateFromSpecificYearMonth(2023, 2));
    }
}
