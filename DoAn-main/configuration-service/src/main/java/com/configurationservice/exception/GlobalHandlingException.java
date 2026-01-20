package com.configurationservice.exception;

import com.configurationservice.dto.response.ErrorResponse;
import com.configurationservice.dto.response.ErrorResponseList;
import com.fasterxml.jackson.databind.JsonMappingException;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.ArrayList;
import java.util.List;

@ControllerAdvice
@Log4j2
public class GlobalHandlingException {

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseList> handleException(MethodArgumentNotValidException exception) {
        ErrorResponseList errorList = new ErrorResponseList();
        List<ErrorResponse> errors = new ArrayList<>();
        exception.getBindingResult().getFieldErrors().stream().forEach(p -> {
            ErrorResponse error = new ErrorResponse();
            error.setErrorCode(p.getDefaultMessage());
            error.setField(p.getField());
            error.setMessage(p.getDefaultMessage());
            errors.add(error);

        });
        errorList.setErrorList(errors);
        return new ResponseEntity<>(errorList, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = LogicErrorException.class)
    public ResponseEntity<ErrorResponseList> handleException(LogicErrorException exception) {
        ErrorResponseList errorList = new ErrorResponseList();
        List<ErrorResponse> errors = new ArrayList<>();
        exception.getErrorList().stream().forEach(p -> {
            ErrorResponse error = new ErrorResponse();
            error.setField(p.getField());
            error.setMessage(p.getMessage());
            error.setErrorCode(p.getErrorCode());
            errors.add(error);

        });
        errorList.setErrorList(errors);
        return new ResponseEntity<>(errorList, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = Exception.class)
//    public String handleException(Exception exception) {
    public ResponseEntity<ErrorResponseList> handleException(Exception exception) {
        log.error("An error has occur: " + exception);
        //todo change path FE
//        return "error/500";
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(value = HttpRequestMethodNotSupportedException.class)
    public String handleExceptionMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        log.error("An error has occur: " + exception);
        //todo change path FE
        return "error/403";
    }

    @ExceptionHandler(value = InvalidParameterException.class)
    public String handleException(InvalidParameterException exception) {
        log.error("An error has occur: " + exception);
        //todo change path FE
        return "error/404";
    }

    @ExceptionHandler(value = CommonException.class)
    public ResponseEntity<ErrorResponseList> handleCommonException(CommonException exception) {
        ErrorResponseList errorList = new ErrorResponseList();
        List<ErrorResponse> errors = new ArrayList<>();
        ErrorResponse errorBean = new ErrorResponse();
        errorBean.setMessage(exception.getMessage());
        errorBean.setErrorCode(exception.getErrorCode());
        errors.add(errorBean);
        errorList.setErrorList(errors);
        return new ResponseEntity<>(errorList, exception.getHttpStatus());
    }

    @ExceptionHandler(value = MethodArgumentTypeMismatchException.class)
    public String handleCommonException(MethodArgumentTypeMismatchException exception) {

        log.error("An error has occur: " + exception);
        //todo change path FE
        return "error/404";
    }

    @ExceptionHandler(value = HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseList> handleCommonException(HttpMessageNotReadableException exception) {
        Throwable throwable = exception.getCause();
        JsonMappingException jsonMappingException = ((JsonMappingException) throwable);
        List<JsonMappingException.Reference> references = jsonMappingException.getPath();
        ErrorResponseList errorList = new ErrorResponseList();
        List<ErrorResponse> errors = new ArrayList<>();
        ErrorResponse errorBean = new ErrorResponse();
        for (JsonMappingException.Reference reference : references) {
            if (reference.getFieldName() != null) {
                errorBean.setField(reference.getFieldName());
                errorBean.setErrorCode("json.mapping.type.error");
                errorBean.setMessage(jsonMappingException.getOriginalMessage());

            }
        }
        errors.add(errorBean);
        errorList.setErrorList(errors);
        return new ResponseEntity<>(errorList, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponseList> handleCommonException(NoHandlerFoundException exception) {
        ErrorResponseList errorList = new ErrorResponseList();
        List<ErrorResponse> errors = new ArrayList<>();
        ErrorResponse errorBean = new ErrorResponse();
        errorBean.setErrorCode("no.handler.error");
        errorBean.setMessage(exception.getMessage());
        errors.add(errorBean);
        errorList.setErrorList(errors);
        return new ResponseEntity<>(errorList, HttpStatus.BAD_REQUEST);
    }
}
