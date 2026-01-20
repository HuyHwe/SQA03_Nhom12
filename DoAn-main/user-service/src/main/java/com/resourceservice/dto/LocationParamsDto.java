package com.resourceservice.dto;

import com.jober.utilsservice.utils.modelCustom.Coordinates;
import com.resourceservice.utilsmodule.utils.modelCustom.SearchInputCommon;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationParamsDto extends SearchInputCommon {

  List<Long> ids;
  private Long userId;
  private Coordinates coordinates;
}
