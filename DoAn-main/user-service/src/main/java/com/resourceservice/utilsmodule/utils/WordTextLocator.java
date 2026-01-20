package com.resourceservice.utilsmodule.utils;

import org.apache.poi.xwpf.usermodel.*;
import org.apache.xmlbeans.XmlCursor;
import org.apache.xmlbeans.XmlObject;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class WordTextLocator {
    static TextSegment searchText(XWPFParagraph paragraph, String searched, PositionInParagraph startPos) {
        int startRun = startPos.getRun(),
                startText = startPos.getText(),
                startChar = startPos.getChar();
        int beginRunPos = 0, candCharPos = 0;
        boolean newList = false;

        java.util.List<XWPFRun> runs = paragraph.getRuns();

        int beginTextPos = 0, beginCharPos = 0; //must be outside the for loop

        for (int runPos = startRun; runPos < runs.size(); runPos++) {
            int textPos = 0, charPos;
            CTR ctRun = runs.get(runPos).getCTR();
            XmlCursor c = ctRun.newCursor();
            c.selectPath("./*");
            try {
                while (c.toNextSelection()) {
                    XmlObject o = c.getObject();
                    if (o instanceof CTText) {
                        if (textPos >= startText) {
                            String candidate = ((CTText) o).getStringValue();
                            if (runPos == startRun) {
                                charPos = startChar;
                            } else {
                                charPos = 0;
                            }
                            for (; charPos < candidate.length(); charPos++) {
                                if ((candidate.charAt(charPos) == searched.charAt(0)) && (candCharPos == 0)) {
                                    beginTextPos = textPos;
                                    beginCharPos = charPos;
                                    beginRunPos = runPos;
                                    newList = true;
                                }
                                if (candidate.charAt(charPos) == searched.charAt(candCharPos)) {
                                    if (candCharPos + 1 < searched.length()) {
                                        candCharPos++;
                                    } else if (newList) {
                                        TextSegment segment = new TextSegment();
                                        segment.setBeginRun(beginRunPos);
                                        segment.setBeginText(beginTextPos);
                                        segment.setBeginChar(beginCharPos);
                                        segment.setEndRun(runPos);
                                        segment.setEndText(textPos);
                                        segment.setEndChar(charPos);
                                        return segment;
                                    }
                                } else {
                                    candCharPos = 0;
                                }
                            }
                        }
                        textPos++;
                    } else if (o instanceof CTProofErr) {
                        c.removeXml();
                    } else if (o instanceof CTRPr) {

                    } else {
                        candCharPos = 0;
                    }
                }
            } finally {
                c.dispose();
            }
        }
        return null;
    }

    static void replaceTextSegment(XWPFParagraph paragraph, String textToFind) {
        TextSegment foundTextSegment = null;
        PositionInParagraph startPos = new PositionInParagraph(0, 0, 0);
        foundTextSegment = searchText(paragraph, textToFind, startPos);
        XWPFRun beginRun = paragraph.getRuns().get(foundTextSegment.getBeginRun());
        beginRun.setText(getReplaceString(textToFind),foundTextSegment.getBeginChar());
        for (int runBetween = foundTextSegment.getEndRun() - 1; runBetween > foundTextSegment.getBeginRun(); runBetween--) {
            paragraph.removeRun(runBetween); // remove not needed runs
        }
    }

    static List<XmlObject> getCTPObjects(XWPFDocument doc) {
        List<XmlObject> result = new ArrayList<>();
        XmlCursor cursor = doc.getDocument().newCursor();
        cursor.selectPath("declare namespace w='http://schemas.openxmlformats.org/wordprocessingml/2006/main' .//*/w:p");
        while(cursor.hasNextSelection()) {
            cursor.toNextSelection();
            XmlObject obj = cursor.getObject();
            if (obj.selectPath("declare namespace w='http://schemas.openxmlformats.org/wordprocessingml/2006/main' ./w:r/w:t").length > 0) {
                result.add(obj);
            }
        }
        return result;
    }

    static void traverseAllParagraphsAndReplace(XWPFDocument doc, List<String> regexList) throws Exception {
        List<XmlObject> allCTPObjects = getCTPObjects(doc);
        for (XmlObject obj : allCTPObjects) {
            XWPFParagraph paragraph = null;
            if (obj instanceof CTP) {
                CTP p = (CTP)obj;
                paragraph = new XWPFParagraph(p, doc);
            } else {
                CTP p = CTP.Factory.parse(obj.xmlText());
                paragraph = new XWPFParagraph(p, doc);
            }
            if (paragraph != null) {
                for (String regex : regexList) {
                    Pattern pattern = Pattern.compile(regex);
                    Matcher matcher = pattern.matcher(paragraph.getText());
                    if (matcher.find()) {
                        replaceTextSegment(paragraph, matcher.group());
                    }
                }
            }
            obj.set(paragraph.getCTP());
        }
    }

    public static byte[] findAndCover(InputStream is, String[] regexList) {
        XWPFDocument doc = null;
        try {
            doc = new XWPFDocument(is);
            traverseAllParagraphsAndReplace(doc, List.of(regexList));
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.write(out);
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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
