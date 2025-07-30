// ===== 검색 기능 JavaScript 파일 (search.js) =====

// 검색 관련 전역 변수
window.SearchModule = {
  searchData: [],
  isInitialized: false,
  currentQuery: '',
  searchHistory: [],
  maxHistory: 10
};

// ===== 검색 데이터 구조 =====
const SEARCH_DATABASE = {
  // 신생아 가정 (0-2세)
  baby: [
    {
      id: 'baby_01',
      title: '아동수당',
      desc: '복지로',
      target: '만 8세 미만',
      amount: '월 10만원',
      icon: '🍼',
      keywords: '아동수당 육아 신생아 어린이 양육비 복지로',
      category: 'baby',
      url: 'https://index001.joyzam.com/2025/06/blog-post_4.html',
      difficulty: 1,
      successRate: 94,
      badges: ['popular'],
      status: 'available'
    },
    {
      id: 'baby_02',
      title: '첫만남이용권',
      desc: '복지로',
      target: '신생아 가정',
      amount: '100만원',
      icon: '👶',
      keywords: '첫만남이용권 신생아 출산 복지로 100만원',
      category: 'baby',
      url: 'https://index001.joyzam.com/2025/07/2025_2.html',
      difficulty: 1,
      successRate: 92,
      badges: ['new'],
      status: 'available'
    }
    // ... 더 많은 데이터
  ],
  
  // 청년 독립기 (19-34세)
  youth: [
    {
      id: 'youth_01',
      title: '청년 월세 지원',
      desc: '복지로',
      target: '만 19~34세',
      amount: '월 20만원',
      icon: '🏠',
      keywords: '청년 월세 지원 주거 임대료 복지로 19 34세',
      category: 'youth',
      url: 'https://index001.joyzam.com/2025/06/blog-post_78.html',
      difficulty: 2,
      successRate: 83,
      badges: ['popular'],
      status: 'available'
    },
    {
      id: 'youth_02',
      title: '청년도약계좌',
      desc: '서민금융진흥원',
      target: '만 19~34세',
      amount: '최대 5000만원',
      icon: '📈',
      keywords: '청년도약계좌 저축 적금 서민금융진흥원 5000만원',
      category: 'youth',
      url: 'https://index001.joyzam.com/2025/06/blog-post_87.html',
      difficulty: 1,
      successRate: 79,
      badges: ['limited'],
      status: 'available'
    }
    // ... 더 많은 데이터
  ]
  
  // ... 다른 카테고리들
};

// ===== 검색 데이터 초기화 =====
function initializeSearchData() {
  if (SearchModule.isInitialized) return;
  
  try {
    // 모든 카테고리의 데이터를 하나의 배열로 합치기
    SearchModule.searchData = [];
    
    Object.keys(SEARCH_DATABASE).forEach(category => {
      SearchModule.searchData = SearchModule.searchData.concat(SEARCH_DATABASE[category]);
    });
    
    // 현재 페이지의 카드들도 동적으로 추가
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach((card, index) => {
      const cardData = extractCardData(card, index);
      if (cardData) {
        SearchModule.searchData.push(cardData);
      }
    });
    
    // 검색 기록 로드
    loadSearchHistory();
    
    SearchModule.isInitialized = true;
    console.log('검색 데이터 초기화 완료:', SearchModule.searchData.length, '개 항목');
    
  } catch (error) {
    console.error('검색 데이터 초기화 실패:', error);
  }
}

// ===== 카드 데이터 추출 =====
function extractCardData(card, index) {
  try {
    const title = card.querySelector('.benefit-title')?.textContent?.trim() || '';
    const desc = card.querySelector('.benefit-desc')?.textContent?.trim() || '';
    const target = card.querySelector('.benefit-target')?.textContent?.trim() || '';
    const amount = card.querySelector('.benefit-amount')?.textContent?.trim() || '';
    const icon = card.querySelector('.benefit-icon')?.textContent?.trim() || '';
    const href = card.getAttribute('href') || '';
    const category = card.getAttribute('data-category') || getCurrentPageCategory();
    
    if (!title) return null;
    
    return {
      id: `dynamic_${index}`,
      title,
      desc,
      target,
      amount,
      icon,
      keywords: `${title} ${desc} ${target} ${amount}`.toLowerCase(),
      category,
      url: href,
      element: card,
      difficulty: calculateDifficulty(card),
      successRate: extractSuccessRate(card),
      badges: extractBadges(card),
      status: 'available'
    };
  } catch (error) {
    console.warn('카드 데이터 추출 실패:', error);
    return null;
  }
}

// ===== 헬퍼 함수들 =====
function getCurrentPageCategory() {
  const path = window.location.pathname;
  const categories = ['baby', 'student', 'youth', 'career', 'senior', 'disability', 'women', 'rural', 'culture', 'emergency', 'business'];
  
  for (const cat of categories) {
    if (path.includes(cat)) return cat;
  }
  
  return 'general';
}

function calculateDifficulty(card) {
  const stars = card.querySelectorAll('.difficulty-star.filled').length;
  return Math.max(1, stars);
}

function extractSuccessRate(card) {
  const rateElement = card.querySelector('.success-rate');
  if (rateElement) {
    const match = rateElement.textContent.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

function extractBadges(card) {
  const badges = [];
  const badgeElements = card.querySelectorAll('.badge');
  badgeElements.forEach(badge => {
    badges.push(badge.textContent.trim());
  });
  return badges;
}

// ===== 메인 검색 함수 =====
function performSearch() {
  const query = document.getElementById('searchInput')?.value?.trim()?.toLowerCase();
  if (!query) {
    hideSearchResults();
    return;
  }
  
  SearchModule.currentQuery = query;
  
  // 검색 기록에 추가
  addToSearchHistory(query);
  
  // 검색 실행
  const results = executeSearch(query);
  
  // 결과 표시
  displaySearchResults(results, query);
  
  // 검색 이벤트 추적
  trackSearchEvent(query, results.length);
}

// ===== 검색 실행 =====
function executeSearch(query) {
  const results = [];
  const queryWords = query.split(' ').filter(word => word.length > 0);
  
  SearchModule.searchData.forEach(item => {
    let score = 0;
    
    // 제목 매칭 (가중치 3)
    if (item.title.toLowerCase().includes(query)) {
      score += 30;
    }
    
    // 키워드 매칭 (가중치 2)
    queryWords.forEach(word => {
      if (item.keywords.includes(word)) {
        score += 20;
      }
    });
    
    // 타겟 매칭 (가중치 1)
    if (item.target.toLowerCase().includes(query)) {
      score += 10;
    }
    
    // 금액 매칭 (가중치 1)
    if (item.amount.toLowerCase().includes(query)) {
      score += 10;
    }
    
    // 부분 문자열 매칭
    queryWords.forEach(word => {
      if (item.title.toLowerCase().includes(word)) score += 5;
      if (item.desc.toLowerCase().includes(word)) score += 3;
      if (item.target.toLowerCase().includes(word)) score += 3;
    });
    
    if (score > 0) {
      results.push({ ...item, searchScore: score });
    }
  });
  
  // 점수순으로 정렬하고 상위 8개만 반환
  return results
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, 8);
}

// ===== 검색 결과 표시 =====
function displaySearchResults(results, query) {
  const resultsContainer = document.getElementById('searchResults');
  if (!resultsContainer) return;
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <div class="no-results-text">"${query}"에 대한 검색 결과가 없습니다</div>
        <div class="no-results-suggestion">다른 키워드로 검색해보세요</div>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = results.map(item => `
      <div class="search-result-item" onclick="selectSearchResult('${item.id}', '${item.url}', '${item.category}')">
        <div class="search-result-icon">${item.icon}</div>
        <div class="search-result-info">
          <div class="search-result-title">${highlightSearchText(item.title, query)}</div>
          <div class="search-result-meta">
            <span class="search-result-amount">${item.amount}</span>
            <span class="search-result-separator">•</span>
            <span class="search-result-desc">${item.desc}</span>
            ${item.successRate > 0 ? `<span class="search-result-separator">•</span><span class="search-result-rate">성공률 ${item.successRate}%</span>` : ''}
          </div>
          <div class="search-result-target">${item.target}</div>
        </div>
        <div class="search-result-score">${Math.round(item.searchScore)}점</div>
      </div>
    `).join('');
  }
  
  resultsContainer.classList.add('show');
}

// ===== 검색어 하이라이팅 =====
function highlightSearchText(text, query) {
  if (!query) return text;
  
  const queryWords = query.split(' ').filter(word => word.length > 0);
  let highlightedText = text;
  
  queryWords.forEach(word => {
    const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
  });
  
  return highlightedText;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ===== 검색 결과 선택 =====
function selectSearchResult(itemId, url, category) {
  // 검색 결과 숨기기
  hideSearchResults();
  
  // 검색창 비우기
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  
  // 선택 이벤트 추적
  trackSearchSelection(itemId, SearchModule.currentQuery);
  
  // 외부 링크인 경우 새 창에서 열기
  if (url.startsWith('http')) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // 내부 페이지로 이동
    window.location.href = url;
  }
}

// ===== 검색 결과 숨기기 =====
function hideSearchResults() {
  const resultsContainer = document.getElementById('searchResults');
  if (resultsContainer) {
    resultsContainer.classList.remove('show');
  }
}

// ===== 검색 기록 관리 =====
function addToSearchHistory(query) {
  if (!query || SearchModule.searchHistory.includes(query)) return;
  
  SearchModule.searchHistory.unshift(query);
  
  // 최대 개수 제한
  if (SearchModule.searchHistory.length > SearchModule.maxHistory) {
    SearchModule.searchHistory = SearchModule.searchHistory.slice(0, SearchModule.maxHistory);
  }
  
  saveSearchHistory();
}

function saveSearchHistory() {
  try {
    localStorage.setItem('searchHistory', JSON.stringify(SearchModule.searchHistory));
  } catch (error) {
    console.warn('검색 기록 저장 실패:', error);
  }
}

function loadSearchHistory() {
  try {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      SearchModule.searchHistory = JSON.parse(history);
    }
  } catch (error) {
    console.warn('검색 기록 로드 실패:', error);
    SearchModule.searchHistory = [];
  }
}

function clearSearchHistory() {
  SearchModule.searchHistory = [];
  saveSearchHistory();
}

// ===== 검색 이벤트 추적 =====
function trackSearchEvent(query, resultCount) {
  const eventData = {
    type: 'search',
    query: query,
    resultCount: resultCount,
    timestamp: new Date().toISOString(),
    page: getCurrentPageCategory()
  };
  
  console.log('검색 이벤트:', eventData);
  
  // 검색 통계 업데이트
  updateSearchStats(query, resultCount);
}

function trackSearchSelection(itemId, query) {
  const eventData = {
    type: 'search_selection',
    itemId: itemId,
    query: query,
    timestamp: new Date().toISOString(),
    page: getCurrentPageCategory()
  };
  
  console.log('검색 선택 이벤트:', eventData);
}

function updateSearchStats(query, resultCount) {
  try {
    const stats = JSON.parse(localStorage.getItem('searchStats') || '{}');
    
    if (!stats.queries) stats.queries = {};
    if (!stats.queries[query]) stats.queries[query] = 0;
    stats.queries[query]++;
    
    stats.totalSearches = (stats.totalSearches || 0) + 1;
    stats.lastSearchTime = new Date().toISOString();
    
    localStorage.setItem('searchStats', JSON.stringify(stats));
  } catch (error) {
    console.warn('검색 통계 업데이트 실패:', error);
  }
}

// ===== 실시간 검색 제안 =====
function showSearchSuggestions() {
  const query = document.getElementById('searchInput')?.value?.trim()?.toLowerCase();
  
  if (!query || query.length < 2) {
    hideSearchResults();
    return;
  }
  
  // 디바운스된 검색 실행
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    performSearch();
  }, 300);
}

// ===== 검색 이벤트 리스너 설정 =====
function setupSearchEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  // 입력 시 실시간 검색
  searchInput.addEventListener('input', showSearchSuggestions);
  
  // 엔터키로 검색
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
  
  // 포커스 시 최근 검색어 표시
  searchInput.addEventListener('focus', () => {
    if (!searchInput.value && SearchModule.searchHistory.length > 0) {
      showRecentSearches();
    }
  });
  
  // 검색창 외부 클릭 시 결과 숨기기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      hideSearchResults();
    }
  });
}

// ===== 최근 검색어 표시 =====
function showRecentSearches() {
  const resultsContainer = document.getElementById('searchResults');
  if (!resultsContainer || SearchModule.searchHistory.length === 0) return;
  
  resultsContainer.innerHTML = `
    <div class="recent-searches">
      <div class="recent-searches-header">
        <span class="recent-searches-title">최근 검색어</span>
        <button class="recent-searches-clear" onclick="clearSearchHistory()">전체삭제</button>
      </div>
      ${SearchModule.searchHistory.map(query => `
        <div class="recent-search-item" onclick="selectRecentSearch('${query}')">
          <span class="recent-search-icon">🕒</span>
          <span class="recent-search-text">${query}</span>
        </div>
      `).join('')}
    </div>
  `;
  
  resultsContainer.classList.add('show');
}

function selectRecentSearch(query) {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = query;
    performSearch();
  }
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
  // 검색 기능 초기화는 약간 지연시켜 다른 요소들이 로드된 후 실행
  setTimeout(() => {
    initializeSearchData();
    setupSearchEventListeners();
    console.log('🔍 검색 모듈 초기화 완료');
  }, 500);
});

// ===== 전역 함수 노출 =====
window.performSearch = performSearch;
window.selectSearchResult = selectSearchResult;
window.clearSearchHistory = clearSearchHistory;
window.selectRecentSearch = selectRecentSearch;