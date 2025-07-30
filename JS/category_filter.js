// ===== 카테고리 필터 JavaScript 파일 (category-filter.js) =====

// 필터 관련 전역 변수
window.FilterModule = {
  currentFilter: 'all',
  allCards: [],
  isInitialized: false,
  animationDuration: 300
};

// ===== 필터 카테고리 정의 =====
const FILTER_CATEGORIES = {
  // 공통 필터
  all: {
    name: '전체',
    icon: '📋',
    description: '모든 혜택 보기'
  },
  
  urgent: {
    name: '마감임박',
    icon: '🔴',
    description: '신청 마감이 임박한 혜택',
    selector: '.badge.urgent, .deadline-countdown'
  },
  
  popular: {
    name: '인기',
    icon: '🔥',
    description: '신청자가 많은 인기 혜택',
    selector: '.badge.popular'
  },
  
  new: {
    name: '신규',
    icon: '✨',
    description: '새로 추가된 혜택',
    selector: '.badge.new'
  },
  
  recommended: {
    name: '추천',
    icon: '👍',
    description: '성공률이 높은 추천 혜택',
    selector: '.badge.recommended'
  },
  
  // 청년 전용 필터
  housing: {
    name: '주거',
    icon: '🏠',
    description: '월세, 전세 등 주거 관련 지원',
    keywords: ['월세', '주거', '임대', '전세', '보증금']
  },
  
  job: {
    name: '취업',
    icon: '💼',
    description: '취업, 구직 관련 지원',
    keywords: ['취업', '구직', '일자리', '고용', '채용']
  },
  
  savings: {
    name: '저축',
    icon: '💰',
    description: '적금, 계좌 등 자산형성 지원',
    keywords: ['계좌', '적금', '저축', '자산', '투자']
  },
  
  education: {
    name: '교육',
    icon: '📚',
    description: '교육, 훈련 관련 지원',
    keywords: ['교육', '훈련', '배움', '강의', '자격증']
  },
  
  health: {
    name: '의료',
    icon: '🏥',
    description: '의료비, 건강검진 지원',
    keywords: ['의료', '건강', '병원', '치료', '검진']
  },
  
  culture: {
    name: '문화',
    icon: '🎭',
    description: '문화, 예술, 여가 활동 지원',
    keywords: ['문화', '예술', '영화', '공연', '레저']
  },
  
  // 신생아/가족 전용 필터
  childcare: {
    name: '육아',
    icon: '👶',
    description: '육아, 양육 관련 지원',
    keywords: ['육아', '양육', '아동', '보육', '돌봄']
  },
  
  maternity: {
    name: '임신출산',
    icon: '🤱',
    description: '임신, 출산 관련 지원',
    keywords: ['임신', '출산', '산모', '신생아']
  },
  
  // 시니어 전용 필터
  pension: {
    name: '연금',
    icon: '💳',
    description: '연금, 수당 관련 지원',
    keywords: ['연금', '수당', '급여']
  },
  
  senior_health: {
    name: '건강관리',
    icon: '🩺',
    description: '건강검진, 의료비 지원',
    keywords: ['건강', '의료', '검진', '치료']
  },
  
  // 사업자 전용 필터
  startup: {
    name: '창업',
    icon: '🚀',
    description: '창업 지원금, 사업 시작',
    keywords: ['창업', '사업', '개업', '스타트업']
  },
  
  business_loan: {
    name: '사업자금',
    icon: '💸',
    description: '사업 운영 자금 지원',
    keywords: ['자금', '대출', '융자', '운영비']
  },
  
  technology: {
    name: '기술개발',
    icon: '🔬',
    description: 'R&D, 기술개발 지원',
    keywords: ['기술', '연구', 'R&D', '개발', '혁신']
  }
};

// ===== 필터 초기화 =====
function initializeFilters() {
  if (FilterModule.isInitialized) return;
  
  try {
    // 모든 혜택 카드 수집
    collectAllCards();
    
    // 현재 페이지에 맞는 필터 설정
    setupPageSpecificFilters();
    
    // 필터 이벤트 리스너 설정
    setupFilterEventListeners();
    
    FilterModule.isInitialized = true;
    console.log('🔍 필터 모듈 초기화 완료:', FilterModule.allCards.length, '개 카드');
    
  } catch (error) {
    console.error('필터 초기화 실패:', error);
  }
}

// ===== 모든 카드 수집 =====
function collectAllCards() {
  const cards = document.querySelectorAll('.benefit-card, .quick-card');
  FilterModule.allCards = Array.from(cards).map(card => {
    return {
      element: card,
      title: card.querySelector('.benefit-title, .quick-title')?.textContent?.toLowerCase() || '',
      desc: card.querySelector('.benefit-desc, .quick-desc')?.textContent?.toLowerCase() || '',
      target: card.querySelector('.benefit-target')?.textContent?.toLowerCase() || '',
      amount: card.querySelector('.benefit-amount')?.textContent?.toLowerCase() || '',
      category: card.getAttribute('data-category') || '',
      badges: Array.from(card.querySelectorAll('.badge')).map(badge => badge.className),
      keywords: extractCardKeywords(card)
    };
  });
}

// ===== 카드 키워드 추출 =====
function extractCardKeywords(card) {
  const texts = [
    card.querySelector('.benefit-title, .quick-title')?.textContent || '',
    card.querySelector('.benefit-desc, .quick-desc')?.textContent || '',
    card.querySelector('.benefit-target')?.textContent || '',
    card.querySelector('.benefit-amount')?.textContent || ''
  ];
  
  return texts.join(' ').toLowerCase();
}

// ===== 페이지별 필터 설정 =====
function setupPageSpecificFilters() {
  const currentPage = getCurrentPageType();
  const filterContainer = document.querySelector('.quick-filters');
  
  if (!filterContainer) return;
  
  // 페이지별 필터 목록 정의
  const pageFilters = {
    youth: ['all', 'housing', 'job', 'savings', 'education', 'urgent'],
    baby: ['all', 'childcare', 'maternity', 'health', 'urgent'],
    student: ['all', 'education', 'health', 'culture', 'urgent'],
    career: ['all', 'job', 'education', 'health', 'urgent'],
    senior: ['all', 'pension', 'senior_health', 'culture', 'urgent'],
    business: ['all', 'startup', 'business_loan', 'technology', 'urgent'],
    emergency: ['all', 'urgent', 'health', 'housing'],
    disability: ['all', 'health', 'job', 'housing', 'urgent'],
    women: ['all', 'childcare', 'job', 'health', 'urgent'],
    rural: ['all', 'business_loan', 'technology', 'urgent'],
    culture: ['all', 'culture', 'education', 'urgent']
  };
  
  const filters = pageFilters[currentPage] || ['all', 'urgent', 'popular', 'new'];
  
  // 필터 버튼 생성
  filterContainer.innerHTML = filters.map(filterId => {
    const filter = FILTER_CATEGORIES[filterId];
    if (!filter) return '';
    
    const isActive = filterId === FilterModule.currentFilter ? 'active' : '';
    return `
      <button class="filter-btn ${isActive}" 
              data-filter="${filterId}"
              title="${filter.description}">
        ${filter.icon} ${filter.name}
      </button>
    `;
  }).join('');
}

// ===== 현재 페이지 타입 감지 =====
function getCurrentPageType() {
  const path = window.location.pathname;
  const pageTypes = ['baby', 'student', 'youth', 'career', 'senior', 'disability', 'women', 'rural', 'culture', 'emergency', 'business'];
  
  for (const type of pageTypes) {
    if (path.includes(type)) return type;
  }
  
  return 'main';
}

// ===== 필터 이벤트 리스너 설정 =====
function setupFilterEventListeners() {
  // 필터 버튼 클릭 이벤트
  document.addEventListener('click', (e) => {
    if (e.target.matches('.filter-btn[data-filter]')) {
      const filterId = e.target.getAttribute('data-filter');
      applyFilter(filterId);
      
      // 버튼 활성화 상태 변경
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');
    }
  });
  
  // 키보드 단축키
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case '1': applyFilter('all'); break;
        case '2': applyFilter('urgent'); break;
        case '3': applyFilter('popular'); break;
        case '4': applyFilter('new'); break;
      }
    }
  });
}

// ===== 메인 필터 적용 함수 =====
function filterBenefits(filterId) {
  applyFilter(filterId);
}

// ===== 필터 적용 =====
function applyFilter(filterId) {
  if (!FilterModule.isInitialized) {
    initializeFilters();
  }
  
  FilterModule.currentFilter = filterId;
  
  // 필터링 시작 표시
  showFilterProgress();
  
  // 약간의 지연으로 부드러운 전환 효과
  setTimeout(() => {
    const matchingCards = getMatchingCards(filterId);
    displayFilteredCards(matchingCards);
    updateFilterStats(matchingCards.length);
    
    // 필터 적용 이벤트 추적
    trackFilterUsage(filterId, matchingCards.length);
  }, 150);
}

// ===== 매칭 카드 찾기 =====
function getMatchingCards(filterId) {
  if (filterId === 'all') {
    return FilterModule.allCards;
  }
  
  const filter = FILTER_CATEGORIES[filterId];
  if (!filter) return FilterModule.allCards;
  
  return FilterModule.allCards.filter(card => {
    // CSS 선택자 기반 필터링
    if (filter.selector) {
      return card.element.querySelector(filter.selector) !== null;
    }
    
    // 키워드 기반 필터링
    if (filter.keywords) {
      return filter.keywords.some(keyword => 
        card.keywords.includes(keyword.toLowerCase())
      );
    }
    
    // 카테고리 기반 필터링
    if (card.category) {
      return card.category.includes(filterId);
    }
    
    return false;
  });
}

// ===== 필터된 카드 표시 =====
function displayFilteredCards(matchingCards) {
  // 모든 카드 숨기기
  FilterModule.allCards.forEach(card => {
    card.element.style.transition = `all ${FilterModule.animationDuration}ms ease`;
    card.element.style.opacity = '0';
    card.element.style.transform = 'scale(0.8)';
  });
  
  // 매칭되는 카드만 표시
  setTimeout(() => {
    FilterModule.allCards.forEach(card => {
      const isMatching = matchingCards.includes(card);
      
      if (isMatching) {
        card.element.style.display = 'flex';
        setTimeout(() => {
          card.element.style.opacity = '1';
          card.element.style.transform = 'scale(1)';
        }, 50);
      } else {
        card.element.style.display = 'none';
      }
    });
    
    // 결과가 없는 경우 메시지 표시
    if (matchingCards.length === 0) {
      showNoResultsMessage();
    } else {
      hideNoResultsMessage();
    }
    
  }, FilterModule.animationDuration);
}

// ===== 필터 진행 표시 =====
function showFilterProgress() {
  const container = document.querySelector('.benefit-grid, .quick-access-grid');
  if (!container) return;
  
  // 로딩 오버레이 추가
  let overlay = container.querySelector('.filter-loading');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'filter-loading';
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner-icon">🔍</div>
        <div class="loading-text">필터 적용 중...</div>
      </div>
    `;
    container.appendChild(overlay);
  }
  
  overlay.style.display = 'flex';
  
  // 일정 시간 후 자동 제거
  setTimeout(() => {
    overlay.style.display = 'none';
  }, FilterModule.animationDuration + 100);
}

// ===== 결과 없음 메시지 =====
function showNoResultsMessage() {
  const container = document.querySelector('.benefit-grid, .quick-access-grid');
  if (!container) return;
  
  let message = container.querySelector('.no-filter-results');
  if (!message) {
    message = document.createElement('div');
    message.className = 'no-filter-results';
    container.appendChild(message);
  }
  
  const filterName = FILTER_CATEGORIES[FilterModule.currentFilter]?.name || '해당 조건';
  
  message.innerHTML = `
    <div class="no-results-content">
      <div class="no-results-icon">🔍</div>
      <div class="no-results-title">"${filterName}" 조건에 맞는 혜택이 없습니다</div>
      <div class="no-results-desc">다른 필터를 선택하거나 전체 보기를 이용해보세요</div>
      <button class="no-results-btn" onclick="applyFilter('all')">전체 보기</button>
    </div>
  `;
  
  message.style.display = 'block';
}

function hideNoResultsMessage() {
  const message = document.querySelector('.no-filter-results');
  if (message) {
    message.style.display = 'none';
  }
}

// ===== 필터 통계 업데이트 =====
function updateFilterStats(count) {
  // 필터 결과 개수 표시
  const filterButtons = document.querySelectorAll('.filter-btn');
  const activeButton = document.querySelector('.filter-btn.active');
  
  if (activeButton && FilterModule.currentFilter !== 'all') {
    const originalText = activeButton.textContent;
    const filterName = FILTER_CATEGORIES[FilterModule.currentFilter]?.name || '';
    
    // 임시로 개수 표시
    activeButton.textContent = `${filterName} (${count})`;
    
    // 3초 후 원래 텍스트로 복원
    setTimeout(() => {
      activeButton.textContent = originalText;
    }, 3000);
  }
  
  // 페이지 제목에 개수 표시
  updatePageTitle(count);
}

// ===== 페이지 제목 업데이트 =====
function updatePageTitle(count) {
  const sectionTitle = document.querySelector('.section-title');
  if (!sectionTitle) return;
  
  const originalTitle = sectionTitle.getAttribute('data-original-title') || sectionTitle.textContent;
  
  if (!sectionTitle.getAttribute('data-original-title')) {
    sectionTitle.setAttribute('data-original-title', originalTitle);
  }
  
  if (FilterModule.currentFilter === 'all') {
    sectionTitle.textContent = originalTitle;
  } else {
    const filterName = FILTER_CATEGORIES[FilterModule.currentFilter]?.name || '필터';
    sectionTitle.textContent = `${originalTitle} - ${filterName} (${count}개)`;
  }
}

// ===== 고급 필터 기능 =====
function applyAdvancedFilter(options) {
  const {
    minAmount = 0,
    maxAmount = Infinity,
    successRate = 0,
    departments = [],
    excludeUrgent = false
  } = options;
  
  const matchingCards = FilterModule.allCards.filter(card => {
    // 금액 범위 체크
    const amount = extractAmountFromText(card.amount);
    if (amount < minAmount || amount > maxAmount) return false;
    
    // 성공률 체크
    const rate = extractSuccessRate(card.element);
    if (rate < successRate) return false;
    
    // 부서 필터
    if (departments.length > 0) {
      if (!departments.some(dept => card.desc.includes(dept.toLowerCase()))) {
        return false;
      }
    }
    
    // 긴급 제외
    if (excludeUrgent) {
      if (card.element.querySelector('.badge.urgent, .deadline-countdown')) {
        return false;
      }
    }
    
    return true;
  });
  
  displayFilteredCards(matchingCards);
  return matchingCards.length;
}

// ===== 헬퍼 함수들 =====
function extractAmountFromText(text) {
  const matches = text.match(/(\d+(?:,\d+)*)/);
  return matches ? parseInt(matches[1].replace(/,/g, '')) : 0;
}

function extractSuccessRate(element) {
  const rateElement = element.querySelector('.success-rate');
  if (rateElement) {
    const match = rateElement.textContent.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }
  return 0;
}

// ===== 필터 상태 저장/복원 =====
function saveFilterState() {
  const state = {
    currentFilter: FilterModule.currentFilter,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem('filterState', JSON.stringify(state));
  } catch (error) {
    console.warn('필터 상태 저장 실패:', error);
  }
}

function restoreFilterState() {
  try {
    const state = localStorage.getItem('filterState');
    if (state) {
      const { currentFilter, timestamp } = JSON.parse(state);
      
      // 24시간 이내의 상태만 복원
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          applyFilter(currentFilter);
        }, 500);
      }
    }
  } catch (error) {
    console.warn('필터 상태 복원 실패:', error);
  }
}

// ===== 이벤트 추적 =====
function trackFilterUsage(filterId, resultCount) {
  const eventData = {
    type: 'filter_usage',
    filterId: filterId,
    resultCount: resultCount,
    page: getCurrentPageType(),
    timestamp: new Date().toISOString()
  };
  
  console.log('필터 사용 이벤트:', eventData);
  
  // 필터 사용 통계 업데이트
  updateFilterStats_internal(filterId);
}

function updateFilterStats_internal(filterId) {
  try {
    const stats = JSON.parse(localStorage.getItem('filterStats') || '{}');
    
    if (!stats.usage) stats.usage = {};
    if (!stats.usage[filterId]) stats.usage[filterId] = 0;
    stats.usage[filterId]++;
    
    stats.lastUsed = new Date().toISOString();
    stats.totalUsage = (stats.totalUsage || 0) + 1;
    
    localStorage.setItem('filterStats', JSON.stringify(stats));
  } catch (error) {
    console.warn('필터 통계 업데이트 실패:', error);
  }
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
  // 페이지 로드 후 약간 지연시켜 초기화
  setTimeout(() => {
    initializeFilters();
    restoreFilterState();
    console.log('📊 카테고리 필터 모듈 초기화 완료');
  }, 800);
});

// ===== 전역 함수 노출 =====
window.filterBenefits = filterBenefits;
window.applyFilter = applyFilter;
window.applyAdvancedFilter = applyAdvancedFilter;
window.saveFilterState = saveFilterState;