// 탭 전환 함수
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(sectionId + '-section').style.display = 'block';
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

// 페이지 로드 시 기본 탭 설정
document.addEventListener('DOMContentLoaded', function() {
    showSection('calculator');
});

// 마커 관리를 위한 전역 변수
let markers = [];

// 이미지 프리뷰 기능
function handleImageUpload(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewId === 'xrayImagePreview') {
                preview.innerHTML = `
                    <div class="image-container" style="position: relative; width: 100%; height: 100%;">
                        <img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                        <div id="componentSelector" class="component-selector">
                            <select id="componentType">
                                <option value="">구성요소 선택</option>
                                <option value="explosive">폭발물</option>
                                <option value="detonator">기폭장치</option>
                                <option value="switch">스위치</option>
                                <option value="power">전원</option>
                                <option value="case">케이스</option>
                            </select>
                        </div>
                    </div>`;
                // 마커 초기화
                markers = [];
            } else {
                preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// 이미지 업로드 이벤트 리스너 설정
document.getElementById('originalImage')?.addEventListener('change', function() {
    handleImageUpload(this, 'originalImagePreview');
});

document.getElementById('xrayImage')?.addEventListener('change', function() {
    handleImageUpload(this, 'xrayImagePreview');
});

// 마커 생성 함수
function createMarker(x, y, type) {
    const container = document.querySelector('.image-container');
    if (!container) return;

    const markerContainer = document.createElement('div');
    markerContainer.className = 'marker-container';
    markerContainer.style.left = x + 'px';
    markerContainer.style.top = y + 'px';

    const marker = document.createElement('div');
    marker.className = 'component-marker';
    
    const label = document.createElement('div');
    label.className = 'component-label';
    
    // 폭발물인 경우 세부 정보 포함
    if (type === 'explosive') {
        const explosiveType = document.getElementById('explosiveDetails').value;
        const explosiveSubType = document.getElementById('explosiveSubDetails').value;
        if (explosiveSubType && explosivesData[explosiveType]?.types[explosiveSubType]) {
            label.textContent = explosivesData[explosiveType].types[explosiveSubType].name;
        } else {
            label.textContent = getComponentLabel(type);
        }
    } else {
        label.textContent = getComponentLabel(type);
    }

    markerContainer.appendChild(marker);
    markerContainer.appendChild(label);
    container.appendChild(markerContainer);

    // 마커 정보 저장
    markers.push({
        element: markerContainer,
        type: type,
        x: x,
        y: y,
        explosiveDetails: type === 'explosive' ? {
            mainType: document.getElementById('explosiveDetails').value,
            subType: document.getElementById('explosiveSubDetails').value
        } : null
    });

    // 마커 클릭 이벤트
    markerContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('이 마커를 삭제하시겠습니까?')) {
            container.removeChild(markerContainer);
            markers = markers.filter(m => m.element !== markerContainer);
            
            // 체크박스 해제
            const checkbox = document.getElementById(type);
            if (checkbox) {
                checkbox.checked = false;
                const select = document.getElementById(`${type}Details`);
                if (select) {
                    select.disabled = true;
                    select.value = '';
                }
                // 폭발물인 경우 하위 선택 메뉴도 초기화
                if (type === 'explosive') {
                    const subSelect = document.getElementById('explosiveSubDetails');
                    if (subSelect) {
                        subSelect.style.display = 'none';
                        subSelect.value = '';
                    }
                    const infoPanel = document.getElementById('explosiveInfo');
                    if (infoPanel) {
                        infoPanel.style.display = 'none';
                    }
                }
            }
        }
    });
}

// 구성요소 라벨 가져오기
function getComponentLabel(type) {
    const labels = {
        explosive: '폭발물',
        detonator: '기폭장치',
        switch: '스위치',
        power: '전원',
        case: '케이스'
    };
    return labels[type] || type;
}

// 이미지 클릭 이벤트 처리
document.getElementById('xrayImagePreview')?.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG') {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const selector = document.getElementById('componentSelector');
        if (selector) {
            selector.style.display = 'block';
            selector.style.left = x + 'px';
            selector.style.top = y + 'px';
            
            // 현재 클릭 위치 저장
            selector.dataset.clickX = x;
            selector.dataset.clickY = y;
        }
    }
});

// 드롭다운 선택 이벤트 처리
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'componentType') {
        const selectedComponent = e.target.value;
        const selector = document.getElementById('componentSelector');
        
        if (selectedComponent && selector) {
            const x = parseFloat(selector.dataset.clickX);
            const y = parseFloat(selector.dataset.clickY);
            
            // 마커 생성
            createMarker(x, y, selectedComponent);
            
            // 체크박스 체크
            const checkbox = document.getElementById(selectedComponent);
            if (checkbox) {
                checkbox.checked = true;
                const select = document.getElementById(`${selectedComponent}Details`);
                if (select) {
                    select.disabled = false;
                }
            }
        }
        
        // 선택 후 드롭다운 숨기기
        selector.style.display = 'none';
    }
});

// 다른 곳 클릭시 드롭다운 숨기기
document.addEventListener('click', function(e) {
    if (!e.target.closest('#componentSelector') && !e.target.closest('#xrayImagePreview')) {
        const selector = document.getElementById('componentSelector');
        if (selector) {
            selector.style.display = 'none';
        }
    }
});

// 컴포넌트 체크박스 이벤트 처리
const components = ['explosive', 'detonator', 'switch', 'power', 'case'];

components.forEach(component => {
    const checkbox = document.getElementById(component);
    const select = document.getElementById(`${component}Details`);
    
    // 초기 상태 설정
    select.disabled = !checkbox.checked;
    
    // 체크박스 변경 이벤트
    checkbox.addEventListener('change', function() {
        select.disabled = !this.checked;
        if (!this.checked) {
            select.value = '';
        }
    });
});

// 분석 결과 저장
document.getElementById('saveAnalysis').addEventListener('click', function() {
    const analysis = {
        timestamp: new Date().toISOString(),
        components: {},
        notes: document.getElementById('analysisNotes').value
    };

    // 각 구성요소의 상태 저장
    components.forEach(component => {
        const checkbox = document.getElementById(component);
        const select = document.getElementById(`${component}Details`);
        
        if (checkbox.checked) {
            analysis.components[component] = {
                detected: true,
                type: select.value
            };
        }
    });

    // 분석 결과를 JSON 형태로 변환
    const analysisJson = JSON.stringify(analysis, null, 2);
    
    // 파일로 다운로드
    const blob = new Blob([analysisJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ied-analysis-${new Date().toISOString().slice(0,19).replace(/[:]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// 폭발물 메인 카테고리 선택 이벤트
document.getElementById('explosiveDetails').addEventListener('change', function() {
    const mainType = this.value;
    updateExplosiveSubTypes(mainType);
    
    // 하위 유형이 선택되지 않은 상태에서는 정보 패널 숨기기
    document.getElementById('explosiveInfo').style.display = 'none';
});

// 폭발물 하위 유형 선택 이벤트
document.getElementById('explosiveSubDetails').addEventListener('change', function() {
    const mainType = document.getElementById('explosiveDetails').value;
    const subType = this.value;
    displayExplosiveInfo(mainType, subType);
});

// 폭발물 데이터
const explosivesData = {
    blackPowder: { density: 1.70, tntEquivalent: 0.55 },
    tnt: { density: 1.654, tntEquivalent: 1.00 },
    c4: { density: 1.72, tntEquivalent: 1.34 },
    semtex: { density: 1.55, tntEquivalent: 1.30 },
    anfo: { density: 0.84, tntEquivalent: 0.82 },
    dynamite: { density: 1.60, tntEquivalent: 0.92 }
};

// 미리 정의된 용기 부피 (리터 단위)
const predefinedContainers = {
    pipe: 1,
    briefcase: 15,
    backpack: 20,
    box: 30,
    suitcase: 35,
    drum: 200,
    carTrunk: 500,
    van: 2500
};

// DOM이 로드된 후 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 초기 탭 설정
    showSection('calculator');
    
    // 용기 타입 선택 이벤트 리스너
    document.getElementById('containerType').addEventListener('change', handleContainerTypeChange);
    
    // 계산 버튼 이벤트 리스너 추가
    document.getElementById('calculateBtn').addEventListener('click', handleCalculation);
    
    // 숫자 입력 필드 이벤트 리스너
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
        });
    });
});

// 용기 종류 변경 처리 함수
function handleContainerTypeChange() {
    const containerType = document.getElementById('containerType').value;
    const customVolumeInput = document.getElementById('customVolumeInput');
    const resultsSection = document.getElementById('results-section');

    customVolumeInput.style.display = containerType === 'custom' ? 'block' : 'none';
    resultsSection.classList.remove('show');

    if (containerType === 'custom') {
        document.getElementById('customWidth').value = '';
        document.getElementById('customLength').value = '';
        document.getElementById('customHeight').value = '';
    }
}

// 용기 부피 계산
function calculateVolume(containerType, dimensions) {
    if (containerType === 'custom') {
        return (dimensions.width * dimensions.height * dimensions.length) / 1000; // cm³ to L
    }
    return predefinedContainers[containerType] || 0;
}

// 최대 폭발물 중량 계산
function calculateMaxExplosiveWeight(volume, explosiveType) {
    const density = explosivesData[explosiveType].density;
    return volume * density; // 리터 * g/cm³ = kg
}

// TNT 당량 계산
function calculateTNTEquivalent(explosiveType, weight) {
    const tntEquivalent = explosivesData[explosiveType].tntEquivalent;
    return weight * tntEquivalent;
}

// 대피거리 계산
function calculateEvacuationDistance(tntEquivalent) {
    const kFactors = {
        protected: { k: 12.0, desc: '방호복 착용 시' },
        covered: { k: 24.0, desc: '엄폐 후 방호' },
        building: { k: 40.0, desc: '건물 내 대피' },
        general: { k: 50.0, desc: '일반 대피' }
    };

    const distances = {};
    for (const [key, value] of Object.entries(kFactors)) {
        distances[key] = {
            distance: Math.ceil(value.k * Math.pow(tntEquivalent, 1/3)),
            description: value.desc
        };
    }
    return distances;
}

// 계산 실행 핸들러
function handleCalculation() {
    console.log('계산 버튼이 클릭되었습니다.');
    
    const containerType = document.getElementById('containerType').value;
    const explosiveType = document.getElementById('explosiveType').value;
    
    console.log('선택된 값:', { containerType, explosiveType });

    // 입력 유효성 검사
    if (!containerType || !explosiveType) {
        alert('용기 종류와 폭발물 종류를 모두 선택해주세요.');
        return;
    }

    let volume = 0;
    if (containerType === 'custom') {
        // 직접 입력 값 검증
        const width = parseFloat(document.getElementById('customWidth').value);
        const length = parseFloat(document.getElementById('customLength').value);
        const height = parseFloat(document.getElementById('customHeight').value);

        if (!width || !length || !height) {
            alert('가로, 세로, 높이를 모두 입력해주세요.');
            return;
        }

        volume = calculateVolume(containerType, {
            width: width,
            length: length,
            height: height
        });
    } else {
        volume = calculateVolume(containerType);
    }

    console.log('계산된 부피:', volume);

    // 결과 계산
    const maxWeight = calculateMaxExplosiveWeight(volume, explosiveType);
    const tntEquivalent = calculateTNTEquivalent(explosiveType, maxWeight);
    const evacuationDistances = calculateEvacuationDistance(tntEquivalent);

    console.log('계산 결과:', { maxWeight, tntEquivalent, evacuationDistances });

    // 결과 표시
    const resultsSection = document.getElementById('results-section');
    resultsSection.innerHTML = `
        <h3>분석 결과</h3>
        <div class="result-item">
            <span>용기 부피:</span>
            <strong>${volume.toFixed(2)} L</strong>
        </div>
        <div class="result-item">
            <span>예상 최대 폭발물 중량:</span>
            <strong>${maxWeight.toFixed(2)} kg</strong>
        </div>
        <div class="result-item">
            <span>TNT 당량:</span>
            <strong>${tntEquivalent.toFixed(2)} kg</strong>
        </div>
        <div class="result-item evacuation-distances">
            <span>권장 대피거리:</span>
            <div class="distance-list">
                <div class="distance-item">
                    <strong>${evacuationDistances.protected.distance} m</strong>
                    <span class="distance-desc">${evacuationDistances.protected.description}</span>
                </div>
                <div class="distance-item">
                    <strong>${evacuationDistances.covered.distance} m</strong>
                    <span class="distance-desc">${evacuationDistances.covered.description}</span>
                </div>
                <div class="distance-item">
                    <strong>${evacuationDistances.building.distance} m</strong>
                    <span class="distance-desc">${evacuationDistances.building.description}</span>
                </div>
                <div class="distance-item">
                    <strong>${evacuationDistances.general.distance} m</strong>
                    <span class="distance-desc">${evacuationDistances.general.description}</span>
                </div>
            </div>
        </div>
    `;
    resultsSection.style.display = 'block';
    resultsSection.classList.add('show');
} 