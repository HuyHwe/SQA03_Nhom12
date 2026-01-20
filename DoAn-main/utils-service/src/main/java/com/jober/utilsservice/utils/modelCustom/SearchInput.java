package com.jober.utilsservice.utils.modelCustom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import java.util.List;

/**
format
{
	"fetch": [],
	"filter": {
	  "matchingAnd": {
	    "propName": ["values"]
	  },
	  "matchingOr": {
	    "propName": ["values"]
	  }
	},
	"sort": [{
		"prop": "",
		"type": "ASC/DSC"
	}],
	"paging": {
		"page": 1,
		"size": 100
	}
}*/
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SearchInput {
	private List<String> fetch;
	private Filter filter;
	private List<SortItem> sortItems;
	private Paging paging;
	private boolean isGetAll;

	/*private @NonNull List<String> fetch;
    private @Nullable Filter filter;
    private @NonNull List<SortItem> sortItems;
    private @NonNull Paging paging;*/

	/*public static void main(String[] args) {
		SearchInput searchInput = new SearchInput();
		Map matching = new HashMap();
		matching.put("matchingAnd", "sdfdfd");
		Filter filter1 = new Filter();
		filter1.setMatchingAnd(matching);
		filter1.setMatchingOr(matching);
		Sort sort = new Sort("phone", "ASC");
		Paging paging1 = new Paging(1, 100);

		searchInput.setFetch(Arrays.asList("fetch1", "fetch2"));
		searchInput.setPaging(paging1);
		searchInput.setSorts(Arrays.asList(sort));
		searchInput.setFilter(filter1);
	}*/
}
