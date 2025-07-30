// ===== 메인 JavaScript 파일 (main.js) =====

// 전역 변수
window.WelfareGuide = {
  currentPage: '',
  isOnline: navigator.onLine,
  config: {
    baseUrl: window.location.origin,
    apiEndpoint: '/api/benefits',
    cacheExpiry: 300000 // 5분
  }
};

// ===== 네비게이션 데이터 =====
const NAVIGATION_DATA = {
  tabs: [
    { id: 'baby', name: '신생아 가정', subtitle: '0-2세', icon: '👶', url: './pages/baby.html' },
    { id: 'student', name: '학령기 가정', subtitle: '3-18세', icon: '🎒', url: './pages/student.html' },
    { id: 'youth', name: '청년 독립기', subtitle: '19-34세', icon: '🎓', url: './pages/youth.html' },
    { id: 'career', name: '경력 발전기', subtitle: '35-54세', icon: '💼', url: './pages/career.html' },
    { id: 'senior', name: '은퇴 준비기', subtitle: '55세+', icon: '🌅', url: './pages/senior.html' },
    { id: 'disability', name: '장애인 지원', subtitle: '전연령', icon: '🦽', url: './pages/disability.html' },
    { id: 'women', name: '여성/가족', subtitle: '생애전반', icon: '👩', url: './pages/women.html' },
    { id: 'rural', name: '농어촌', subtitle: '농어업인', icon: '🌾', url: './pages/rural.html' },
    { id: 'culture', name: '문화/여가', subtitle: '문화생활', icon: '🎭', url: './pages/culture.html' },
    { id: 'emergency', name: '긴급상황', subtitle: '즉시지원', icon: '🆘', url: './pages/emergency.html' },
    { id: 'business', name: '사업자 지원', subtitle: '창업/운영', icon: '🏪', url: './pages/business.html' }
  ]
};

// ===== 공통 컴포넌트 로딩 =====
function loadCommonComponents() {
  loadHeader();
  loadNavigation();
  loadFooter();
}

// 헤더 로딩
function loadHeader() {
  const headerElement = document.getElementById('main-header');
  if (!headerElement) return;

  const isMainPage = window.location.pathname.endsWith('index.html') || 
                     window.location.pathname.endsWith('/');
  
  const baseUrl = isMainPage ? './' : '../';
  
  headerElement.innerHTML = `
    <div class="header-content">
      <h1 class="site-title">
        <a href="${baseUrl}index.html" style="text-decoration: none; color: inherit;">
          🎯 생애주기별 복지 혜택 가이드<br />
          <small style="font-size:12px;opacity:0.8;">당신의 인생 단계에 맞는 맞춤 지원</small>
        </a>
      </h1>
      
      <div class="search-container">
        <div class="search-box">
          <input 
            class="search-input" 
            id="searchInput" 
            placeholder="지원금 검색 (예: 청년, 출산, 창업...)" 
            type="text" 
          />
          <button class="search-btn" onclick="performSearch()" title="검색">
            🔍
          </button>
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>
    </div>
  `;
}

// 네비게이션 로딩
function loadNavigation() {
  const navElement = document.getElementById('main-navigation');
  if (!navElement) return;

  const isMainPage = window.location.pathname.endsWith('index.html') || 
                     window.location.pathname.endsWith('/');
  const baseUrl = isMainPage ? './' : '../';
  
  const currentPath = window.location.pathname;
  
  const tabsHtml = NAVIGATION_DATA.tabs.map(tab => {
    const isActive = currentPath.includes(tab.id) ? 'active' : '';
    const url = isMainPage ? tab.url : `${baseUrl}pages/${tab.id}.html`;
    
    return `
      <li class="tab-item">
        <a class="tab-link ${isActive}" href="${url}">
          ${tab.icon} ${tab.name}
          <span class="tab-subtitle">${tab.subtitle}</span>
        </a>
      </li>
    `;
  }).join('');

  navElement.innerHTML = `
    <nav class="tab-container">
      <ul class="tab-list">
        ${tabsHtml}
      </ul>
    </nav>
  `;
}

// 푸터 로딩
function loadFooter() {
  const footerElement = document.getElementById('main-footer');
  if (!footerElement) return;

  footerElement.innerHTML = `
    <p>📞 문의사항이 있으시면 보건복지부 상담센터 129번으로 연락주세요</p>
    <p style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
      본 사이트는 정부 지원금 정보 제공을 목적으로 하며, 신청은 각 기관 공식 사이트에서 진행하시기 바랍니다
    </p>
    
    <!-- 연결 상태 표시 -->
    <div class="connection-status">
      <div class="connection-dot" id="connectionDot"></div>
      <span id="connectionText">온라인</span>
    </div>
  `;
  
  updateConnectionStatus();
}

// ===== 페이지 이동 함수 =====
function goToPage(pageId) {
  const tab = NAVIGATION_DATA.tabs.find(t => t.id === pageId);
  if (tab) {
    // 현재 페이지 정보 저장
    localStorage.setItem('previousPage', window.location.href);
    localStorage.setItem('targetPage', pageId);
    
    // 페이지 이동
    window.location.href = tab.url;
  }
}

// ===== 연결 상태 관리 =====
function updateConnectionStatus() {
  const dot = document.getElementById('connectionDot');
  const text = document.getElementById('connectionText');
  
  if (!dot || !text) return;
  
  if (WelfareGuide.isOnline) {
    dot.classList.remove('offline');
    text.textContent = '온라인';
  } else {
    dot.classList.add('offline');
    text.textContent = '오프라인';
  }
}

// ===== 로컬 스토리지 관리 =====
function saveUserPreferences(data) {
  try {
    localStorage.setItem('userPreferences', JSON.stringify(data));
  } catch (error) {
    console.warn('사용자 설정 저장 실패:', error);
  }
}

function getUserPreferences() {
  try {
    const data = localStorage.getItem('userPreferences');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn('사용자 설정 로드 실패:', error);
    return {};
  }
}

// ===== 페이지 추적 =====
function trackPageView(pageId) {
  // 간단한 페이지 뷰 추적 (실제로는 Google Analytics 등 사용)
  const timestamp = new Date().toISOString();
  const viewData = {
    page: pageId,
    timestamp: timestamp,
    userAgent: navigator.userAgent,
    referrer: document.referrer
  };
  
  console.log('페이지 뷰:', viewData);
  
  // 방문 기록 저장
  const visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '[]');
  visitHistory.push(viewData);
  
  // 최근 10개만 유지
  if (visitHistory.length > 10) {
    visitHistory.shift();
  }
  
  localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
}

// ===== 오류 처리 =====
function handleError(error, context = '') {
  console.error(`오류 발생 ${context}:`, error);
  
  // 사용자에게 친화적인 오류 메시지 표시
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-notification';
  errorMessage.innerHTML = `
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <span class="error-text">일시적인 오류가 발생했습니다. 페이지를 새로고침해 주세요.</span>
      <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(errorMessage);
  
  // 5초 후 자동 제거
  setTimeout(() => {
    if (errorMessage.parentElement) {
      errorMessage.remove();
    }
  }, 5000);
}

// ===== 메인 페이지 초기화 =====
function initializeMainPage() {
  WelfareGuide.currentPage = 'main';
  
  // 이전 방문 페이지 복원
  const targetPage = localStorage.getItem('targetPage');
  if (targetPage) {
    localStorage.removeItem('targetPage');
    // 필요시 특정 섹션으로 스크롤
  }
  
  // 페이지 뷰 추적
  trackPageView('main');
  
  console.log('메인 페이지 초기화 완료');
}

// ===== 카테고리 페이지 초기화 =====
function initializeCategoryPage(categoryId) {
  WelfareGuide.currentPage = categoryId;
  
  // 페이지별 설정 로드
  const preferences = getUserPreferences();
  if (preferences.lastCategory === categoryId) {
    // 이전 필터 설정 복원 등
  }
  
  // 페이지 뷰 추적
  trackPageView(categoryId);
  
  console.log(`${categoryId} 페이지 초기화 완료`);
}

// ===== 유틸리티 함수들 =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ===== 이벤트 리스너 설정 =====
function setupGlobalEventListeners() {
  // 온라인/오프라인 상태 감지
  window.addEventListener('online', () => {
    WelfareGuide.isOnline = true;
    updateConnectionStatus();
  });
  
  window.addEventListener('offline', () => {
    WelfareGuide.isOnline = false;
    updateConnectionStatus();
  });
  
  // 키보드 단축키
  document.addEventListener('keydown', (e) => {
    // F5: 새로고침
    if (e.key === 'F5') {
      e.preventDefault();
      location.reload();
    }
    
    // Ctrl + H: 홈으로
    if (e.ctrlKey && e.key === 'h') {
      e.preventDefault();
      window.location.href = '../index.html';
    }
  });
  
  // 전역 에러 핸들러
  window.addEventListener('error', (e) => {
    handleError(e.error, 'Global');
  });
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
  try {
    setupGlobalEventListeners();
    console.log('🎯 복지 혜택 가이드 시스템 초기화 완료');
  } catch (error) {
    handleError(error, 'Initialization');
  }
});

// ===== 전역 함수 노출 =====
window.goToPage = goToPage;
window.trackPageView = trackPageView;
window.initializeMainPage = initializeMainPage;
window.initializeCategoryPage = initializeCategoryPage;
window.loadCommonComponents = loadCommonComponents;