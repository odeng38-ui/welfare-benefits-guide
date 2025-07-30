// ===== 진단 기능 JavaScript 파일 (diagnosis.js) =====

// 진단 관련 전역 변수
window.DiagnosisModule = {
  currentDiagnosis: null,
  diagnosisHistory: [],
  maxHistory: 5,
  isProcessing: false
};

// ===== 진단 규칙 데이터베이스 =====
const DIAGNOSIS_RULES = {
  // 연령대별 기본 혜택
  ageGroups: {
    baby: {
      name: '신생아 가정 (0-2세)',
      icon: '👶',
      benefits: [
        {
          id: 'baby_childcare',
          name: '아동수당',
          amount: '월 10만원',
          department: '복지로',
          match: 100,
          description: '만 8세 미만 모든 아동에게 지급',
          requirements: ['국내 거주 아동', '소득 무관'],
          url: 'https://index001.joyzam.com/2025/06/blog-post_4.html'
        },
        {
          id: 'baby_firstmeet',
          name: '첫만남이용권',
          amount: '100만원',
          department: '복지로',
          match: 95,
          description: '출생신고된 아동에게 바우처 지급',
          requirements: ['2022년 이후 출생아', '출생신고 완료'],
          url: 'https://index001.joyzam.com/2025/07/2025_2.html'
        },
        {
          id: 'baby_maternity',
          name: '출산전후휴가급여',
          amount: '월 70만원',
          department: '고용보험',
          match: 90,
          description: '임신한 여성 근로자 대상',
          requirements: ['고용보험 가입', '180일 이상 근무'],
          url: 'https://index001.joyzam.com/2025/07/2025_32.html'
        }
      ]
    },
    
    student: {
      name: '학령기 가정 (3-18세)',
      icon: '🎒',
      benefits: [
        {
          id: 'student_education',
          name: '초·중·고 학생 교육비 지원',
          amount: '연 120만원',
          department: '복지로',
          match: 85,
          description: '저소득층 학생 교육비 지원',
          requirements: ['기초생활수급자', '차상위계층'],
          url: 'https://index001.joyzam.com/2025/06/2024-pc.html'
        },
        {
          id: 'student_meal',
          name: '학교급식비 지원',
          amount: '연 60만원',
          department: '교육청',
          match: 80,
          description: '저소득층 학생 급식비 지원',
          requirements: ['기초생활수급자', '한부모가족'],
          url: 'https://index001.joyzam.com/2025/07/2025_4.html'
        },
        {
          id: 'student_scholarship',
          name: '국가장학금',
          amount: '최대 전액',
          department: '한국장학재단',
          match: 90,
          description: '대학생·대학원생 장학금',
          requirements: ['대학 재학생', '소득 기준 충족'],
          url: 'https://index001.joyzam.com/2025/07/2025_24.html'
        }
      ]
    },
    
    youth: {
      name: '청년 독립기 (19-34세)',
      icon: '🎓',
      benefits: [
        {
          id: 'youth_housing',
          name: '청년 월세 지원',
          amount: '월 20만원',
          department: '복지로',
          match: 85,
          description: '19-34세 청년 월세 지원',
          requirements: ['만 19-34세', '무주택자', '소득 기준 충족'],
          url: 'https://index001.joyzam.com/2025/06/blog-post_78.html'
        },
        {
          id: 'youth_savings',
          name: '청년도약계좌',
          amount: '최대 5000만원',
          department: '서민금융진흥원',
          match: 80,
          description: '청년 자산형성 지원',
          requirements: ['만 19-34세', '소득 기준 충족', '병역 이행'],
          url: 'https://index001.joyzam.com/2025/06/blog-post_87.html'
        },
        {
          id: 'youth_job',
          name: '청년 취업지원금',
          amount: '월 50만원',
          department: '고용복지플러스',
          match: 75,
          description: '취업준비생 생활비 지원',
          requirements: ['구직등록', '취업활동 증빙'],
          url: 'https://index001.joyzam.com/2025/07/2025_52.html'
        }
      ]
    },
    
    career: {
      name: '경력 발전기 (35-54세)',
      icon: '💼',
      benefits: [
        {
          id: 'career_incentive',
          name: '근로장려금',
          amount: '최대 330만원',
          department: '국세청 홈택스',
          match: 85,
          description: '근로소득자 세액공제',
          requirements: ['근로소득자', '소득 기준 충족'],
          url: 'https://index001.joyzam.com/2025/06/2025_18.html'
        },
        {
          id: 'career_employment',
          name: '국민취업지원제도',
          amount: '월 50만원',
          department: '고용24',
          match: 80,
          description: '실업자 취업 지원',
          requirements: ['구직신청', '취업활동 참여'],
          url: 'https://index001.joyzam.com/2025/06/blog-post_33.html'
        },
        {
          id: 'career_education',
          name: '직장인 내일배움카드',
          amount: '최대 300만원',
          department: 'HRD-Net',
          match: 90,
          description: '재직자 직업훈련 지원',
          requirements: ['재직자', '고용보험 가입'],
          url: 'https://index001.joyzam.com/2025/06/blog-post_6.html'
        }
      ]
    },
    
    senior: {
      name: '은퇴 준비기 (55세+)',
      icon: '🌅',
      benefits: [
        {
          id: 'senior_pension',
          name: '기초연금',
          amount: '월 34만원',
          department: '복지로',
          match: 95,
          description: '만 65세 이상 기초연금',
          requirements: ['만 65세 이상', '소득 기준 충족'],
          url: 'https://index001.joyzam.com/2025/06/blog-post_10.html'
        },
        {
          id: 'senior_job',
          name: '시니어 일자리 지원',
          amount: '월 59만원',
          department: '고용24',
          match: 80,
          description: '60세 이상 일자리 지원',
          requirements: ['만 60세 이상', '구직등록'],
          url: 'https://index001.joyzam.com/2025/07/blog-post_91.html'
        },
        {
          id: 'senior_transport',
          name: '교통비 할인 (경로우대)',
          amount: '연 36만원',
          department: '지자체',
          match: 100,
          description: '65세 이상 교통비 할인',
          requirements: ['만 65세 이상', '주민등록'],
          url: '#'
        }
      ]
    }
  },
  
  // 상황별 추가 혜택
  situationBased: {
    job_seeker: [
      {
        id: 'jobseeker_support',
        name: '국민취업지원제도',
        amount: '월 50만원',
        department: '고용24',
        match: 90,
        requirements: ['구직등록', '취업활동 계획 수립']
      },
      {
        id: 'jobseeker_training',
        name: '국민내일배움카드',
        amount: '최대 500만원',
        department: 'HRD-Net',
        match: 85,
        requirements: ['구직등록', '훈련과정 선택']
      }
    ],
    
    student: [
      {
        id: 'student_scholarship',
        name: '국가장학금',
        amount: '최대 전액',
        department: '한국장학재단',
        match: 95,
        requirements: ['대학 재학', '성적 기준 충족']
      }
    ],
    
    parent: [
      {
        id: 'parent_childcare',
        name: '아이돌봄서비스',
        amount: '월 65만원',
        department: '복지로',
        match: 85,
        requirements: ['맞벌이가정', '자녀 연령 조건']
      },
      {
        id: 'parent_leave',
        name: '육아휴직급여',
        amount: '월 70만원',
        department: '고용보험',
        match: 90,
        requirements: ['고용보험 가입', '육아휴직 신청']
      }
    ],
    
    disabled: [
      {
        id: 'disabled_pension',
        name: '장애인연금',
        amount: '월 38만원',
        department: '복지로',
        match: 95,
        requirements: ['중증장애인', '소득 기준 충족']
      }
    ],
    
    farmer: [
      {
        id: 'farmer_fund',
        name: '농업인 정책자금',
        amount: '최대 5000만원',
        department: '농협은행',
        match: 80,
        requirements: ['농업인 확인서', '사업계획서']
      }
    ]
  },
  
  // 소득별 추가 혜택
  incomeBased: {
    low: [
      {
        id: 'low_culture',
        name: '문화누리카드',
        amount: '연 10만원',
        department: '문화체육관광부',
        match: 90,
        requirements: ['기초생활수급자', '차상위계층']
      },
      {
        id: 'low_sports',
        name: '스포츠강좌이용권',
        amount: '연 8만원',
        department: '문화체육관광부',
        match: 85,
        requirements: ['저소득층', '가족수 기준 충족']
      }
    ]
  }
};

// ===== 메인 진단 함수 =====
function diagnoseBenefits() {
  if (DiagnosisModule.isProcessing) {
    showNotification('진단이 진행 중입니다. 잠시만 기다려주세요.', 'info');
    return;
  }
  
  try {
    DiagnosisModule.isProcessing = true;
    
    // 입력값 검증
    const formData = validateFormData();
    if (!formData) {
      DiagnosisModule.isProcessing = false;
      return;
    }
    
    // 진단 시작 애니메이션
    showDiagnosisProgress();
    
    // 실제 진단 처리 (지연을 통해 사용자 경험 개선)
    setTimeout(() => {
      const recommendations = generateRecommendations(formData);
      displayDiagnosisResult(recommendations, formData);
      saveDiagnosisHistory(formData, recommendations);
      DiagnosisModule.isProcessing = false;
    }, 1500);
    
  } catch (error) {
    console.error('진단 처리 중 오류:', error);
    showNotification('진단 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    DiagnosisModule.isProcessing = false;
  }
}

// ===== 폼 데이터 검증 =====
function validateFormData() {
  const age = document.getElementById('age')?.value;
  const family = document.getElementById('family')?.value;
  const income = document.getElementById('income')?.value;
  const situation = document.getElementById('situation')?.value;
  
  const missing = [];
  if (!age) missing.push('나이');
  if (!family) missing.push('가구원수');
  if (!income) missing.push('월소득');
  if (!situation) missing.push('현재상황');
  
  if (missing.length > 0) {
    showNotification(`다음 항목을 선택해주세요: ${missing.join(', ')}`, 'warning');
    
    // 첫 번째 누락 항목으로 포커스 이동
    const firstMissingElement = document.getElementById(
      !age ? 'age' : !family ? 'family' : !income ? 'income' : 'situation'
    );
    if (firstMissingElement) {
      firstMissingElement.focus();
      firstMissingElement.style.borderColor = 'var(--error)';
      setTimeout(() => {
        firstMissingElement.style.borderColor = '';
      }, 3000);
    }
    
    return null;
  }
  
  return { age, family, income, situation };
}

// ===== 추천 결과 생성 =====
function generateRecommendations(formData) {
  const recommendations = [];
  
  // 1. 연령대별 기본 혜택
  const ageGroup = DIAGNOSIS_RULES.ageGroups[formData.age];
  if (ageGroup) {
    recommendations.push(...ageGroup.benefits.map(benefit => ({
      ...benefit,
      source: 'age',
      priority: 'high'
    })));
  }
  
  // 2. 상황별 추가 혜택
  const situationBenefits = DIAGNOSIS_RULES.situationBased[formData.situation];
  if (situationBenefits) {
    situationBenefits.forEach(benefit => {
      // 중복 제거
      if (!recommendations.find(r => r.id === benefit.id)) {
        recommendations.push({
          ...benefit,
          source: 'situation',
          priority: 'medium'
        });
      }
    });
  }
  
  // 3. 소득별 추가 혜택
  const incomeBenefits = DIAGNOSIS_RULES.incomeBased[formData.income];
  if (incomeBenefits) {
    incomeBenefits.forEach(benefit => {
      if (!recommendations.find(r => r.id === benefit.id)) {
        recommendations.push({
          ...benefit,
          source: 'income',
          priority: 'low'
        });
      }
    });
  }
  
  // 4. 특별 추천 로직
  applySpecialRecommendations(recommendations, formData);
  
  // 5. 매칭률 조정 및 정렬
  adjustMatchingScores(recommendations, formData);
  
  // 6. 상위 5개만 반환
  return recommendations
    .sort((a, b) => b.match - a.match)
    .slice(0, 5);
}

// ===== 특별 추천 로직 =====
function applySpecialRecommendations(recommendations, formData) {
  // 청년 + 구직자 = 취업 관련 혜택 우선
  if (formData.age === 'youth' && formData.situation === 'job_seeker') {
    recommendations.forEach(rec => {
      if (rec.name.includes('취업') || rec.name.includes('배움카드')) {
        rec.match = Math.min(100, rec.match + 10);
        rec.priority = 'high';
      }
    });
  }
  
  // 저소득 + 자녀 있음 = 육아/교육 지원 우선
  if (formData.income === 'low' && (formData.age === 'baby' || formData.age === 'student')) {
    recommendations.forEach(rec => {
      if (rec.name.includes('아동') || rec.name.includes('교육') || rec.name.includes('급식')) {
        rec.match = Math.min(100, rec.match + 15);
      }
    });
  }
  
  // 1인 가구 + 청년 = 주거 지원 우선
  if (formData.family === '1' && formData.age === 'youth') {
    recommendations.forEach(rec => {
      if (rec.name.includes('월세') || rec.name.includes('주거')) {
        rec.match = Math.min(100, rec.match + 12);
      }
    });
  }
}

// ===== 매칭률 조정 =====
function adjustMatchingScores(recommendations, formData) {
  recommendations.forEach(rec => {
    let adjustment = 0;
    
    // 가구원수에 따른 조정
    if (parseInt(formData.family) >= 4) {
      if (rec.name.includes('가족') || rec.name.includes('다자녀')) {
        adjustment += 5;
      }
    }
    
    // 소득 수준에 따른 조정
    if (formData.income === 'low') {
      if (rec.requirements?.some(req => req.includes('저소득') || req.includes('기초생활'))) {
        adjustment += 10;
      }
    }
    
    // 우선순위에 따른 조정
    switch (rec.priority) {
      case 'high': adjustment += 5; break;
      case 'medium': adjustment += 2; break;
      case 'low': adjustment -= 2; break;
    }
    
    rec.match = Math.max(0, Math.min(100, rec.match + adjustment));
  });
}

// ===== 진단 진행 표시 =====
function showDiagnosisProgress() {
  const button = document.querySelector('.diagnose-btn');
  if (!button) return;
  
  const originalText = button.textContent;
  button.disabled = true;
  button.style.opacity = '0.7';
  
  let step = 0;
  const steps = [
    '🔍 정보 분석 중...',
    '📊 혜택 매칭 중...',
    '✨ 결과 생성 중...'
  ];
  
  const interval = setInterval(() => {
    if (step < steps.length) {
      button.textContent = steps[step];
      step++;
    } else {
      clearInterval(interval);
      button.textContent = originalText;
      button.disabled = false;
      button.style.opacity = '1';
    }
  }, 500);
}

// ===== 진단 결과 표시 =====
function displayDiagnosisResult(recommendations, formData) {
  const resultContainer = document.getElementById('diagnosisResult');
  const contentContainer = document.getElementById('resultContent');
  
  if (!resultContainer || !contentContainer) return;
  
  // 결과 헤더 생성
  const ageGroupName = DIAGNOSIS_RULES.ageGroups[formData.age]?.name || '해당 연령대';
  const totalAmount = calculateTotalBenefitAmount(recommendations);
  
  contentContainer.innerHTML = `
    <div class="diagnosis-summary">
      <div class="summary-header">
        <h4>📋 ${ageGroupName} 맞춤 분석 결과</h4>
        <div class="summary-stats">
          <span class="total-benefits">${recommendations.length}개 혜택 발견</span>
          <span class="total-amount">총 ${totalAmount}</span>
        </div>
      </div>
    </div>
    
    <div class="recommendation-list">
      ${recommendations.map(item => `
        <div class="result-item" onclick="selectRecommendation('${item.id}', '${item.url}')">
          <div class="result-icon">${getIconForBenefit(item)}</div>
          <div class="result-info">
            <div class="result-name">${item.name}</div>
            <div class="result-amount">${item.amount}</div>
            <div class="result-department">${item.department}</div>
            ${item.description ? `<div class="result-description">${item.description}</div>` : ''}
            ${item.requirements ? `
              <div class="result-requirements">
                <span class="requirements-label">신청 조건:</span>
                ${item.requirements.slice(0, 2).join(', ')}
              </div>
            ` : ''}
          </div>
          <div class="result-match-container">
            <div class="result-match">${item.match}%</div>
            <div class="match-label">매칭률</div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="diagnosis-actions">
      <button class="action-btn primary" onclick="saveAndShareResult()">
        📤 결과 저장 및 공유
      </button>
      <button class="action-btn secondary" onclick="showDetailedGuide()">
        📖 신청 가이드 보기
      </button>
    </div>
  `;
  
  // 결과 표시 애니메이션
  resultContainer.style.display = 'block';
  resultContainer.style.opacity = '0';
  resultContainer.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    resultContainer.style.transition = 'all 0.5s ease';
    resultContainer.style.opacity = '1';
    resultContainer.style.transform = 'translateY(0)';
    
    // 스크롤 이동
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
  
  // 개별 아이템 애니메이션
  const items = resultContainer.querySelectorAll('.result-item');
  items.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
      item.style.transition = 'all 0.3s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 300 + (index * 100));
  });
}

// ===== 헬퍼 함수들 =====
function getIconForBenefit(benefit) {
  if (benefit.name.includes('아동') || benefit.name.includes('육아')) return '👶';
  if (benefit.name.includes('취업') || benefit.name.includes('일자리')) return '💼';
  if (benefit.name.includes('월세') || benefit.name.includes('주거')) return '🏠';
  if (benefit.name.includes('연금')) return '💰';
  if (benefit.name.includes('교육') || benefit.name.includes('배움')) return '📚';
  if (benefit.name.includes('의료') || benefit.name.includes('건강')) return '🏥';
  if (benefit.name.includes('문화') || benefit.name.includes('예술')) return '🎭';
  return '✨';
}

function calculateTotalBenefitAmount(recommendations) {
  // 간단한 총액 계산 (실제로는 더 복잡한 로직이 필요)
  let total = 0;
  let hasMonthly = false;
  let hasYearly = false;
  
  recommendations.forEach(item => {
    const amount = item.amount.toLowerCase();
    if (amount.includes('월')) {
      hasMonthly = true;
      const match = amount.match(/(\d+)/);
      if (match) total += parseInt(match[1]) * 12;
    } else if (amount.includes('연')) {
      hasYearly = true;
      const match = amount.match(/(\d+)/);
      if (match) total += parseInt(match[1]);
    }
  });
  
  if (total > 0) {
    return `연간 약 ${total.toLocaleString()}만원`;
  } else {
    return '개별 확인 필요';
  }
}

// ===== 추천 결과 선택 =====
function selectRecommendation(benefitId, url) {
  // 선택 이벤트 추적
  trackBenefitSelection(benefitId);
  
  // 링크 열기
  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    showNotification('해당 혜택의 상세 정보를 준비 중입니다.', 'info');
  }
}

// ===== 진단 기록 저장 =====
function saveDiagnosisHistory(formData, recommendations) {
  try {
    const diagnosis = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      formData: formData,
      recommendations: recommendations.slice(0, 3), // 상위 3개만 저장
      totalCount: recommendations.length
    };
    
    DiagnosisModule.currentDiagnosis = diagnosis;
    DiagnosisModule.diagnosisHistory.unshift(diagnosis);
    
    // 최대 개수 제한
    if (DiagnosisModule.diagnosisHistory.length > DiagnosisModule.maxHistory) {
      DiagnosisModule.diagnosisHistory = DiagnosisModule.diagnosisHistory.slice(0, DiagnosisModule.maxHistory);
    }
    
    localStorage.setItem('diagnosisHistory', JSON.stringify(DiagnosisModule.diagnosisHistory));
    
  } catch (error) {
    console.warn('진단 기록 저장 실패:', error);
  }
}

// ===== 진단 초기화 =====
function resetDiagnosis() {
  // 폼 초기화
  const form = document.getElementById('benefitForm');
  if (form) {
    form.reset();
  }
  
  // 결과 숨기기
  const resultContainer = document.getElementById('diagnosisResult');
  if (resultContainer) {
    resultContainer.style.transition = 'all 0.3s ease';
    resultContainer.style.opacity = '0';
    resultContainer.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      resultContainer.style.display = 'none';
      resultContainer.style.transition = '';
      resultContainer.style.transform = '';
    }, 300);
  }
  
  // 현재 진단 초기화
  DiagnosisModule.currentDiagnosis = null;
  
  // 폼 상단으로 스크롤
  const form = document.getElementById('benefitForm');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ===== 결과 저장 및 공유 =====
function saveAndShareResult() {
  if (!DiagnosisModule.currentDiagnosis) {
    showNotification('저장할 진단 결과가 없습니다.', 'warning');
    return;
  }
  
  try {
    // 결과 요약 생성
    const summary = generateResultSummary(DiagnosisModule.currentDiagnosis);
    
    // Web Share API 지원 확인
    if (navigator.share) {
      navigator.share({
        title: '복지 혜택 진단 결과',
        text: summary,
        url: window.location.href
      }).catch(error => {
        console.log('공유 취소됨:', error);
      });
    } else {
      // 클립보드 복사
      navigator.clipboard.writeText(summary).then(() => {
        showNotification('진단 결과가 클립보드에 복사되었습니다.', 'success');
      }).catch(() => {
        // 텍스트 선택으로 대체
        showResultInModal(summary);
      });
    }
    
  } catch (error) {
    console.error('결과 공유 실패:', error);
    showNotification('결과 공유 중 오류가 발생했습니다.', 'error');
  }
}

// ===== 상세 가이드 표시 =====
function showDetailedGuide() {
  // 별도 페이지나 모달로 상세 신청 가이드 표시
  const guideContent = `
    <div class="guide-content">
      <h3>💡 혜택 신청 완벽 가이드</h3>
      
      <div class="guide-section">
        <h4>📋 신청 전 준비사항</h4>
        <ul>
          <li>신분증 (주민등록증, 운전면허증 등)</li>
          <li>가족관계증명서</li>
          <li>소득증명서류 (급여명세서, 사업자등록증 등)</li>
          <li>통장 사본</li>
        </ul>
      </div>
      
      <div class="guide-section">
        <h4>🔗 주요 신청 사이트</h4>
        <ul>
          <li><strong>복지로:</strong> 대부분의 복지혜택 통합 신청</li>
          <li><strong>정부24:</strong> 정부 서비스 통합 포털</li>
          <li><strong>고용24:</strong> 고용 관련 서비스</li>
          <li><strong>국세청 홈택스:</strong> 세금 관련 혜택</li>
        </ul>
      </div>
      
      <div class="guide-section">
        <h4>⚠️ 주의사항</h4>
        <ul>
          <li>신청 기한을 꼭 확인하세요</li>
          <li>중복 신청이 불가능한 혜택이 있습니다</li>
          <li>소득 기준은 정기적으로 변경됩니다</li>
          <li>필요 서류를 미리 준비하세요</li>
        </ul>
      </div>
    </div>
  `;
  
  showModal('신청 가이드', guideContent);
}

// ===== 유틸리티 함수들 =====
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `
    <span class="notification-icon">${icons[type] || icons.info}</span>
    <span class="notification-message">${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  document.body.appendChild(notification);
  
  // 자동 제거
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

function showModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 배경 클릭 시 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function generateResultSummary(diagnosis) {
  const { formData, recommendations } = diagnosis;
  const ageGroupName = DIAGNOSIS_RULES.ageGroups[formData.age]?.name || '해당 연령대';
  
  let summary = `🎯 복지 혜택 진단 결과\n\n`;
  summary += `👤 대상: ${ageGroupName}\n`;
  summary += `📊 발견된 혜택: ${recommendations.length}개\n\n`;
  
  summary += `📋 추천 혜택:\n`;
  recommendations.slice(0, 3).forEach((item, index) => {
    summary += `${index + 1}. ${item.name} (${item.amount}) - 매칭률 ${item.match}%\n`;
  });
  
  summary += `\n🔗 자세한 정보: ${window.location.href}`;
  
  return summary;
}

function trackBenefitSelection(benefitId) {
  const eventData = {
    type: 'benefit_selection',
    benefitId: benefitId,
    timestamp: new Date().toISOString(),
    source: 'diagnosis'
  };
  
  console.log('혜택 선택 이벤트:', eventData);
}

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', function() {
  // 진단 기록 복원
  try {
    const history = localStorage.getItem('diagnosisHistory');
    if (history) {
      DiagnosisModule.diagnosisHistory = JSON.parse(history);
    }
  } catch (error) {
    console.warn('진단 기록 복원 실패:', error);
  }
  
  console.log('🎯 진단 모듈 초기화 완료');
});

// ===== 전역 함수 노출 =====
window.diagnoseBenefits = diagnoseBenefits;
window.resetDiagnosis = resetDiagnosis;
window.selectRecommendation = selectRecommendation;
window.saveAndShareResult = saveAndShareResult;
window.showDetailedGuide = showDetailedGuide;