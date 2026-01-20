package com.resourceservice.utilsmodule.utils;

import com.resourceservice.service.impl.S3ServiceImpl;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PDFTextLocator extends PDFTextStripper {
    private static List<String> keyStrings;
    private static List<float[]> coordinates;
    private static List<Float> fontSizes;
    private static List<int[]> pages;
    public static Logger LOGGER = LoggerFactory.getLogger(S3ServiceImpl.class);
    public PDFTextLocator() throws IOException {
        coordinates = new ArrayList<>();
        fontSizes = new ArrayList<>();
        pages = new ArrayList<>();
    }
    public static byte[] findAndCoverPdf (byte[] bytes, String[] regexList) throws IOException{
        PDDocument document = PDDocument.load(bytes);
        PDFTextStripper stripper = new PDFTextStripper();
        PDFTextStripper coorStripper = new PDFTextLocator();
        String text = stripper.getText(document);
        List<String> highlightText = getMatchString(text, regexList);
        int oldSize = 0;
        for (int i = 0; i < document.getNumberOfPages(); i++) {
            getCoordinates(document, highlightText, i, coorStripper);
            if(coordinates != null && coordinates.size() > oldSize) {
                pages.add(new int[]{i, coordinates.size()});
            }
            oldSize = coordinates != null? coordinates.size(): 0;
        }
        //Find highlight text coordinates
        //Cover the highlight text in pdf file
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        highlightText(bytes, byteArrayOutputStream);
        return byteArrayOutputStream.toByteArray();
    }
    private static void getCoordinates(PDDocument document, List<String> phrase, int page, PDFTextStripper stripper) throws  IOException {
        keyStrings = phrase;
        stripper.setSortByPosition(true);
        stripper.setStartPage(page+1);
        stripper.setEndPage(page+1);
        stripper.writeText(document, new OutputStreamWriter(new ByteArrayOutputStream()));
    }

    @Override
    protected void writeString(String s, List<TextPosition> textPositions) throws IOException {
        for (String keyString
                :keyStrings) {
            if(s.contains(keyString)) {
                TextPosition text = textPositions.get(0);
                if(text != null) {
                    coordinates.add(new float[]{text.getXDirAdj(), text.getYDirAdj()});
                    fontSizes.add(text.getFontSizeInPt());
                }
            }
        }
    }
    private static void highlightText(byte[] bytes, ByteArrayOutputStream byteArrayOutputStream) throws IOException {
        try (PDDocument document = PDDocument.load(bytes)) {
            int numOfHighlighted = 0;
            for (int[] p:
                    pages) {
                for (int i = numOfHighlighted; i < numOfHighlighted + p[1]; i++) {
                    highlightTextOnPage(document, document.getPage(p[0]), keyStrings.get(i), coordinates.get(i), fontSizes.get(i));
                }
                numOfHighlighted = numOfHighlighted + p[1];
            }
            document.save(byteArrayOutputStream);
        }
    }
    private static String extractTextFromPage(PDDocument document, PDPage page) throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setStartPage(document.getPages().indexOf(page) + 1);
        stripper.setEndPage(document.getPages().indexOf(page) + 1);
        return stripper.getText(document);
    }
    private static void highlightTextOnPage(PDDocument document, PDPage page, String textToHighlight, float[] coor, float fontSize) throws IOException {
        PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);

        // Set the highlight color to black
        contentStream.setNonStrokingColor(0f, 0f, 0f);

        // Find and cover the text with a black rectangle
        PDFont font = PDType1Font.HELVETICA_BOLD; // Use a default font
        float textWidth = font.getStringWidth(textToHighlight) / 1100 * fontSize;
        if(textToHighlight.length() > 12) {
            textWidth = font.getStringWidth(textToHighlight) / 1100 * (fontSize-2);
        }
        contentStream.setFont(font, fontSize);
        float offset = 5.0f;
        contentStream.setLineWidth(1.5f); // Adjust the line width as needed
        contentStream.addRect(coor[0],page.getMediaBox().getHeight()-coor[1], textWidth, fontSize + offset); // Add a rectangle covering the text area
        contentStream.fill();
        contentStream.close();
    }
    private static List<String> getMatchString(String text, String[] regexes) {
        List<String> highlightList = new ArrayList<>();
        String[] list = text.split("\n");
        LOGGER.info("getMatchString list length: " + list.length);
        List<String> compoundLink = new ArrayList<>();
        for (int i = 0; i < list.length; i++) {
            LOGGER.info("getMatchString list[" + i + "] content: " + list[i]);
            if (Pattern.compile("(http(cs?)://)?(www\\.)?linkedin").matcher(list[i]).find()) {
                compoundLink.add(list[i]);
                if ((i+1) < list.length) {
                    compoundLink.add(list[i+1]);
                } else {
                    LOGGER.info("getMatchString i + 1 - 1: " + i);
                }
            }
            if (Pattern.compile("(?:https?:\\/\\/)?(?:www\\.)?(mbasic.facebook|m\\.facebook|facebook|fb)\\.(com|me)").matcher(list[i]).find()) {
                if ((i+1) < list.length  && !list[i+1].isEmpty()) {
                    compoundLink.add(list[i+1].substring(1));
                } else {
                    LOGGER.info("getMatchString i + 1 - 1: " + i);
                }
            }
        }
        LOGGER.info("getMatchString compoundLink: " + compoundLink);

        for (String regex:
                regexes) {
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(text);
            if (matcher.find()) {
//                System.out.println(matcher.group());
                highlightList.add(matcher.group());
            }
        }
        highlightList.addAll(compoundLink);
        highlightList.forEach((s)->LOGGER.info(s));
        return highlightList;
    }
}
