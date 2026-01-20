package com.resourceservice.utilsmodule.utils;

import org.apache.poi.ss.usermodel.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class ExcelTextLocator {
    public static byte[] findAndCover(InputStream is, String[] regexList) {
        Workbook workbook = null;
        try {
            workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);
            int rows = sheet.getPhysicalNumberOfRows();
            for (int i = 0; i < rows; i++) {
                Row row = sheet.getRow(i);
                row.cellIterator().forEachRemaining(cell -> {
                    String s = cell.getStringCellValue();
                    if (isMatchString(regexList, s.replace("\n","").replace("\r",""))) {
                        cell.setCellValue(getReplaceString(s));
                        if(cell.getHyperlink() != null) {
                            cell.removeHyperlink();
                        }
                    }
                });
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    static boolean isMatchString(String[] regexList,String cellValue) {
        for (String regex: regexList) {
            if (cellValue.matches(regex)) {
                return true;
            }
        }
        return false;
    }
    static String getReplaceString(String textToFind) {
        if(textToFind.matches("^[^a-zA-Z]*$")) {
            return "x".repeat(textToFind.length());
        }
        else if (textToFind.contains("@")) {
            int index = textToFind.indexOf("@");
            return "x".repeat(index)+textToFind.substring(index);
        }
        else {
            int index = textToFind.lastIndexOf("/") + 1;
            return textToFind.substring(0,index)+"x".repeat(textToFind.length() - index);
        }
    }
}
