package com.configurationservice.common;

import com.configurationservice.config.EnvProperties;
import lombok.extern.slf4j.Slf4j;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

import static com.jober.utilsservice.constant.Constant.LAT;
import static com.jober.utilsservice.constant.Constant.LNG;

@Component
@Slf4j
@PropertySource("classpath:env/application-dev.properties")
public class CommonUtils {

    @Autowired
    private EnvProperties envProperties;

    public Double distanceCalculate(double latLocal, double lonLocal,
                                    double latDestination, double lonDestination) {
        double distance = Math.acos(Math.sin(latLocal / 180 * Math.PI)
                * Math.sin(latDestination / 180 * Math.PI)
                + Math.cos(latLocal / 180 * Math.PI)
                * Math.cos(latDestination / 180 * Math.PI)
                * Math.cos(lonDestination / 180 * Math.PI - lonLocal / 180 * Math.PI)) * 6371;
        return distance;
    }

    public File convert(MultipartFile file) throws IOException {
        File convFile = new File(file.getOriginalFilename());
        try (InputStream is = file.getInputStream()) {
            Files.copy(is, convFile.toPath());
        }
        return convFile;
    }

    public Map<String, Double> convertAddressToCoordinate(String address) {

        Map<String, Double> coordinate = new HashMap<>();

        try {

            String apiKey = envProperties.getGoogleKey();

            String urlStr = String.format("https://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=true&key=%s",
                    address, apiKey);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.getForEntity(urlStr, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode location = root.path("results").get(0).get("geometry").get("location");

            String lat = location.get(LAT).toString();
            String lon = location.get(LNG).toString();

            coordinate.put(LAT, Double.parseDouble(lat));
            coordinate.put(LNG, Double.parseDouble(lon));

        } catch (Exception e) {
            log.error("CommonUtils");
//            set default
            coordinate.put(LAT, 21.0278);
            coordinate.put(LNG, 105.8342);
        }
        return coordinate;
    }

    public String convertCoordinateToAddress(Double lat, Double lon) {

        String address = "";

        try {

            String apiKey = envProperties.getGoogleKey();

            String urlStr = String.format("https://maps.googleapis.com/maps/api/geocode/json?latlng=%s,%s&key=%s",
                    lat, lon, apiKey);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.getForEntity(urlStr, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode location = root.path("results").get(0).get("formatted_address");

            address = location.toString();

        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return address;
    }
}
