package com.jober.searchservice.repository;

import com.jober.searchservice.model.SearchingSuggestion;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SearchingSuggestionRepo<T, ID> extends JpaRepository<SearchingSuggestion, ID> {
    @Query(value = "SELECT s from SearchingSuggestion s ORDER BY s.id DESC")
    Page<SearchingSuggestion> findSearchingSuggestion(Pageable pageable);
    /**
     * get all data without condition
     * @return
     */
    @Query(value = "SELECT s from SearchingSuggestion s ORDER BY s.id DESC")
    List<SearchingSuggestion> findSearchingSuggestion();
//    job, add, name, year, salary
    @Query(value = "SELECT s FROM SearchingSuggestion s  WHERE (s.val LIKE %:val% AND s.object = :object)  ORDER BY s.id DESC")
    List<SearchingSuggestion> findSearchingSuggestionByCondition(String val, String object);

    @Query(value = "SELECT s FROM SearchingSuggestion s  WHERE (s.val =:val AND s.object = :object) ORDER BY s.id DESC")
    SearchingSuggestion findSearchingSuggestionByMatchCondition(String val, String object);
}
