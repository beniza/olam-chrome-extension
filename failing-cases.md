# Olam API - Failing Cases & Limitations Report

**Report Date:** November 5, 2025  
**Extension:** Olam Dictionary Chrome Extension  
**API Endpoint:** https://olam.in/api/dictionary  
**Tested By:** Chrome Extension Development Team  
**Total Tests Conducted:** 21

---

## Executive Summary

During comprehensive testing of the Olam Dictionary API, we identified several cases where the API returns unexpected or potentially incorrect results. This document catalogs these issues for the benefit of Olam.in developers and the community.

**Key Findings:**
- ✅ Single-word searches work excellently
- ❌ Multi-word phrases return empty results (expected limitation)
- ⚠️ One mixed-language case returns unexpected results (possible bug)

---

## Test Methodology

### Tools & Approach
- **Script**: Node.js HTTPS module for direct API calls
- **Test Cases**: 21 comprehensive scenarios
- **Coverage**: Single words, multi-word phrases, mixed languages, special characters
- **Validation**: Compared expected vs actual API responses

### API Call Pattern
```javascript
const url = `https://olam.in/api/dictionary/${fromLang}/${toLang}/${encodeURIComponent(query)}`;
// All calls: GET requests with proper URL encoding
// Rate limiting: 500ms delay between requests
```

---

## Category 1: Expected Limitations (Not Bugs)

### 1.1 Multi-Word English Phrases

**Status:** ⚪ Expected Behavior (API Design Limitation)

The API is designed for single-word lookups and does not support phrase translation.

| Test Query | Direction | Expected | Actual | Status |
|------------|-----------|----------|--------|--------|
| `hello world` | EN→ML | 0 entries | 0 entries | ✅ Expected |
| `good morning friend` | EN→ML | 0 entries | 0 entries | ✅ Expected |
| `the quick brown fox` | EN→ML | 0 entries | 0 entries | ✅ Expected |

**URL Examples:**
```
https://olam.in/api/dictionary/english/malayalam/hello%20world
https://olam.in/api/dictionary/english/malayalam/good%20morning%20friend
```

**Response:**
```json
{
  "data": {
    "entries": [],
    "total": 0,
    "page": 0,
    "per_page": 0,
    "total_pages": 0
  }
}
```

**Impact:** Low - Users understand dictionary is word-based, not phrase-based.

---

### 1.2 Multi-Word Malayalam Phrases

**Status:** ⚪ Expected Behavior (API Design Limitation)

Similar to English, Malayalam multi-word queries return empty results.

| Test Query | Direction | Expected | Actual | Status |
|------------|-----------|----------|--------|--------|
| `വീട് പുസ്തകം` | ML→ML | 0 entries | 0 entries | ✅ Expected |
| `നല്ല രാവിലെ സുഹൃത്ത്` | ML→ML | 0 entries | 0 entries | ✅ Expected |

**URL Examples:**
```
https://olam.in/api/dictionary/malayalam/malayalam/%E0%B4%B5%E0%B5%80%E0%B4%9F%E0%B5%8D%20%E0%B4%AA%E0%B5%81%E0%B4%B8%E0%B5%8D%E0%B4%A4%E0%B4%95%E0%B4%82
```

**Impact:** Low - Expected behavior for dictionary API.

---

## Category 2: Unexpected Behavior (Potential Issues)

### 2.1 Mixed Language: Malayalam + English (ML→ML)

**Status:** ⚠️ **UNEXPECTED BEHAVIOR - POSSIBLE BUG**

When searching Malayalam→Malayalam with mixed content, the API sometimes returns results when it should return empty.

#### Test Case: `വീട് hello`

**Query:** `വീട് hello` (Malayalam word + space + English word)  
**Direction:** malayalam → malayalam  
**Expected:** 0 entries (multi-word query)  
**Actual:** 6 entries  
**Status:** ⚠️ Inconsistent with other multi-word behavior

**URL:**
```
https://olam.in/api/dictionary/malayalam/malayalam/%E0%B4%B5%E0%B5%80%E0%B4%9F%E0%B5%8D%20hello
```

**Actual Response:**
```json
{
  "data": {
    "entries": [
      {
        "guid": "...",
        "content": ["പണമിട", "-വിട"],
        "relations": [ /* ... */ ]
      }
      // ... 5 more entries
    ],
    "query": {
      "q": "വീട് hello",
      "from_lang": "malayalam",
      "to_lang": "malayalam"
    },
    "total": 6
  }
}
```

**Analysis:**
- The returned entries appear to be related to "വീട്" (house)
- The English word "hello" seems to be ignored
- This contradicts the behavior for other multi-word queries
- Inconsistent with queries like `വീട് പുസ്തകം` which return 0 results

**Comparison with Similar Cases:**

| Query | Direction | Contains | Result | Consistent? |
|-------|-----------|----------|--------|-------------|
| `വീട് hello` | ML→ML | ML + EN | ✅ 6 entries | ⚠️ No |
| `hello വീട്` | EN→ML | EN + ML | ❌ 0 entries | ✅ Yes |
| `വീട് പുസ്തകം` | ML→ML | ML + ML | ❌ 0 entries | ✅ Yes |
| `പുസ്തകം book നല്ല` | ML→ML | ML + EN + ML | ❌ 0 entries | ✅ Yes |

**Hypothesis:**
The API might be using different parsing logic for ML→ML direction that:
1. Stops parsing at the first non-Malayalam character, OR
2. Ignores non-Malayalam characters in certain positions, OR
3. Has a special case handling that treats trailing English text differently

**Recommendation:**
This inconsistency should be reviewed to ensure uniform behavior across all multi-word scenarios. Either:
- **Option A**: All multi-word queries should return 0 results (current behavior for most cases)
- **Option B**: API should explicitly document which multi-word patterns are supported

---

### 2.2 Other Mixed Language Cases

**Status:** ✅ Consistent Behavior (Return Empty)

All other mixed language combinations correctly return empty results:

| Query | Direction | Result | Status |
|-------|-----------|--------|--------|
| `hello വീട്` | EN→ML | 0 entries | ✅ Consistent |
| `test പുസ്തകം world` | EN→ML | 0 entries | ✅ Consistent |
| `പുസ്തകം book നല്ല` | ML→ML | 0 entries | ✅ Consistent |
| `വീട് and പുസ്തകം` | ML→ML | 0 entries | ✅ Consistent |
| `hello, വീട്!` | EN→ML | 0 entries | ✅ Consistent |
| `test-പുസ്തകം` | EN→ML | 0 entries | ✅ Consistent |

---

## Category 3: Special Characters

### 3.1 Special Characters in English Queries

**Status:** ✅ Working as Designed

Special characters are properly URL-encoded and then ignored by the API.

**Test Case:** `test!@#`

**Query:** `test!@#`  
**URL:** `https://olam.in/api/dictionary/english/malayalam/test!%40%23`  
**Result:** 35 entries (same as searching for "test")  

**Analysis:**
- Special characters are properly URL-encoded
- API ignores special characters and searches for the word
- Consistent with user expectations for dictionary lookups

**Status:** ✅ No issues

---

### 3.2 Punctuation with Mixed Content

**Test Case:** `hello, വീട്!`

**Query:** `hello, വീട്!`  
**URL:** `https://olam.in/api/dictionary/english/malayalam/hello%2C%20%E0%B4%B5%E0%B5%80%E0%B4%9F%E0%B5%8D!`  
**Result:** 0 entries  

**Status:** ✅ Expected (multi-word with punctuation)

---

## Summary of Issues

### High Priority

None identified. The API performs well for its primary use case (single-word lookups).

### Medium Priority

1. **Inconsistent Mixed Language Handling**: `വീട് hello` (ML→ML) returns results while other similar patterns don't
   - **Impact**: Low (rare user scenario)
   - **Reproducibility**: 100% reproducible
   - **Workaround**: Client-side can handle by checking for multi-word queries
   - **Recommendation**: Standardize multi-word behavior across all language combinations

### Low Priority

None identified. All other behaviors are consistent and expected.

---

## Test Statistics

| Category | Tests | Pass | Fail | Unexpected |
|----------|-------|------|------|------------|
| Single Word | 7 | 7 | 0 | 0 |
| Multi-Word English | 3 | 0 | 0 | 0* |
| Multi-Word Malayalam | 2 | 0 | 0 | 0* |
| Mixed Language | 6 | 0 | 0 | 1** |
| Special Characters | 3 | 3 | 0 | 0 |
| **TOTAL** | **21** | **10** | **0** | **1** |

\* Expected to return 0 results (API design)  
\** `വീട് hello` returns results inconsistently

---

## Recommendations for API Developers

### Short Term
1. **Document Multi-Word Behavior**: Clearly state that API is single-word only
2. **Investigate Mixed Case**: Review why `വീട് hello` returns results in ML→ML mode
3. **API Response Consistency**: Ensure uniform behavior across all language directions

### Long Term
1. **Consider Phrase Support**: Evaluate adding multi-word phrase lookup capability
2. **Error Messages**: Return explicit error message for unsupported query types
3. **Query Validation**: Server-side validation for malformed queries

---

## Testing Resources

All test results are available in our repository:

- **Raw Test Results**: `.local/api-test-results.json` (10KB)
- **Analysis Report**: `.local/api-analysis-report.md`
- **Corner Case Analysis**: `.local/corner-cases-analysis.md` (7KB)
- **Testing Script**: `.local/fetch-api-samples.js` (reusable Node.js script)

**Repository:** [olam-chrome-extension](https://github.com/beniza/olam-chrome-extension)

---

## Contact & Collaboration

We're happy to:
- Provide additional test cases
- Collaborate on API improvements
- Share our testing methodology
- Contribute to Olam.in's open-source projects

**Extension Developers:** Chrome Extension Team  
**Testing Date:** November 5, 2025  
**API Version Tested:** Current production API (as of Nov 2025)

---

## Appendix: Complete Test List

### Single Word Tests (7)
1. ✅ `hello` - 3 entries
2. ✅ `test` - 35 entries
3. ✅ `book` - 84 entries
4. ✅ `run` - 146 entries
5. ✅ `set` - 222 entries
6. ✅ `വീട്` - 6 entries
7. ✅ `പുസ്തകം` - 1 entry

### Edge Cases (3)
8. ✅ `xyzabc` - 0 entries (non-existent)
9. ✅ `test!@#` - 35 entries (special chars ignored)
10. ✅ `hello world` - 0 entries (multi-word)

### Multi-Word English (3)
11. ⚪ `good morning friend` - 0 entries
12. ⚪ `the quick brown fox` - 0 entries

### Multi-Word Malayalam (2)
13. ⚪ `വീട് പുസ്തകം` - 0 entries
14. ⚪ `നല്ല രാവിലെ സുഹൃത്ത്` - 0 entries

### Mixed Language (6)
15. ⚪ `hello വീട്` - 0 entries
16. ⚪ `test പുസ്തകം world` - 0 entries
17. ⚠️ **`വീട് hello` - 6 entries (unexpected)**
18. ⚪ `പുസ്തകം book നല്ല` - 0 entries
19. ⚪ `വീട് and പുസ്തകം` - 0 entries
20. ⚪ `hello, വീട്!` - 0 entries
21. ⚪ `test-പുസ്തകം` - 0 entries

**Legend:**
- ✅ Working as expected
- ⚪ Expected limitation (not a bug)
- ⚠️ Unexpected behavior (needs review)

---

**Document Version:** 1.0  
**Last Updated:** November 5, 2025  
**Status:** Ready for submission to Olam.in developers
